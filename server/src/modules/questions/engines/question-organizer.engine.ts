import { Injectable, Logger, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { QuestionsRepository } from '../questions.repository';
import { QuestionFoldersRepository } from '../question-folders.repository';
import { KnowledgeTopicsRepository } from '../../taxonomy/knowledge-topics.repository';
import { UsersRepository } from '../../users/users.repository';
import {
    OrganizeStrategy,
    PreviewOrganizePayload,
    OrganizePreviewResult,
    VirtualFolderNode,
    QuestionMapping
} from '../interfaces/question-organizer.interface';
import { DifficultyLevel } from '../schemas/question.schema';
import { DIFFICULTY_NAME_MAP } from '../constants/question.constant';

@Injectable()
export class QuestionOrganizerEngine {
    private readonly logger = new Logger(QuestionOrganizerEngine.name);

    constructor(
        private readonly questionsRepo: QuestionsRepository,
        private readonly foldersRepo: QuestionFoldersRepository,
        private readonly topicsRepo: KnowledgeTopicsRepository,
        private readonly usersRepo: UsersRepository,
    ) { }

    async generateBlueprint(ownerId: string, payload: PreviewOrganizePayload): Promise<OrganizePreviewResult> {
        const ownerObjId = new Types.ObjectId(ownerId);
        const objectIds = payload.questionIds.map(id => new Types.ObjectId(id));

        const user = await this.usersRepo.findByIdSafe(ownerObjId, { projection: 'subjectIds' });
        if (!user || !user.subjectIds || user.subjectIds.length === 0) {
            throw new ForbiddenException('Tài khoản chưa được gán Môn học, không thể dùng tính năng tự động sắp xếp theo Chuyên đề.');
        }
        const subjectId = user.subjectIds[0];

        const questions = await this.questionsRepo.modelInstance
            .find({ _id: { $in: objectIds } })
            .select('_id topicId difficultyLevel ownerId')
            .lean()
            .exec();

        if (questions.length === 0) throw new BadRequestException('Không tìm thấy câu hỏi hợp lệ.');
        if (questions.some(q => q.ownerId.toString() !== ownerId)) {
            throw new ForbiddenException('Bạn không có quyền thao tác trên câu hỏi của người khác.');
        }

        const topics = await this.topicsRepo.modelInstance
            .find({ subjectId: subjectId })
            .select('_id name parentId ancestors')
            .lean()
            .exec();

        const topicMap = new Map<string, any>(topics.map(t => [t._id.toString(), t]));

        const existingFolders = await this.foldersRepo.modelInstance
            .find({ ownerId: ownerObjId })
            .select('_id name parentId ancestors')
            .lean()
            .exec();

        const folderRegistry = new Map<string, VirtualFolderNode>();

        for (const f of existingFolders) {
            const parentIdStr = f.parentId ? f.parentId.toString() : 'root';
            const key = `${parentIdStr}_${f.name.toLowerCase().trim()}`;
            folderRegistry.set(key, {
                _id: f._id as Types.ObjectId,
                name: f.name,
                parentId: f.parentId as Types.ObjectId | null,
                ancestors: f.ancestors as Types.ObjectId[],
                isNew: false
            });
        }
        let baseFolderId: Types.ObjectId | null = null;
        let baseAncestors: Types.ObjectId[] = [];
        if (payload.baseFolderId) {
            const base = existingFolders.find(f => f._id.toString() === payload.baseFolderId);
            if (!base) throw new NotFoundException('Thư mục gốc (baseFolderId) không tồn tại.');
            baseFolderId = base._id as Types.ObjectId;
            baseAncestors = [...(base.ancestors || []), baseFolderId];
        }
        const mappings: QuestionMapping[] = [];
        let newFolderCount = 0;
        let unclassifiedCount = 0;

        for (const q of questions) {
            if (!q.topicId || !q.difficultyLevel || q.difficultyLevel === DifficultyLevel.UNKNOWN) {
                unclassifiedCount++;
                continue;
            }

            const topic = topicMap.get(q.topicId.toString());
            if (!topic) {
                unclassifiedCount++;
                continue;
            }

            let currentParentId = baseFolderId;
            let currentAncestors = [...baseAncestors];

            if (payload.strategy === OrganizeStrategy.TOPIC_STRICT || payload.strategy === OrganizeStrategy.TOPIC_AND_DIFFICULTY) {
                const topicPathIds = [...(topic.ancestors || []), topic._id];

                for (const tId of topicPathIds) {
                    const tNode = topicMap.get(tId.toString());
                    if (!tNode) continue;

                    const key = `${currentParentId ? currentParentId.toString() : 'root'}_${tNode.name.toLowerCase().trim()}`;
                    let folderNode = folderRegistry.get(key);

                    if (!folderNode) {
                        folderNode = {
                            _id: new Types.ObjectId(),
                            name: tNode.name,
                            parentId: currentParentId,
                            ancestors: [...currentAncestors],
                            isNew: true
                        };
                        folderRegistry.set(key, folderNode);
                        newFolderCount++;
                    }

                    currentParentId = folderNode._id;
                    currentAncestors = [...folderNode.ancestors, folderNode._id];
                }
            }

            if (payload.strategy === OrganizeStrategy.FLAT_DIFFICULTY || payload.strategy === OrganizeStrategy.TOPIC_AND_DIFFICULTY) {
                const diffName = DIFFICULTY_NAME_MAP[q.difficultyLevel] || 'Chưa phân loại';
                const key = `${currentParentId ? currentParentId.toString() : 'root'}_${diffName.toLowerCase().trim()}`;

                let diffFolderNode = folderRegistry.get(key);
                if (!diffFolderNode) {
                    diffFolderNode = {
                        _id: new Types.ObjectId(),
                        name: diffName,
                        parentId: currentParentId,
                        ancestors: [...currentAncestors],
                        isNew: true
                    };
                    folderRegistry.set(key, diffFolderNode);
                    newFolderCount++;
                }

                currentParentId = diffFolderNode._id;
            }

            mappings.push({
                questionId: q._id as Types.ObjectId,
                targetFolderId: currentParentId!
            });
        }

        const virtualTree = Array.from(folderRegistry.values());

        return {
            strategyUsed: payload.strategy,
            virtualTree,
            mappings,
            stats: {
                totalQuestions: questions.length,
                newFoldersToCreate: newFolderCount,
                unclassifiedQuestions: unclassifiedCount,
            }
        };
    }


    async execute(ownerId: string, payload: PreviewOrganizePayload) {
        const blueprint = await this.generateBlueprint(ownerId, payload);

        if (blueprint.mappings.length === 0) {
            throw new BadRequestException('Không có câu hỏi nào hợp lệ để tổ chức (Thiếu Chuyên đề hoặc Mức độ nhận thức).');
        }

        const foldersToInsert = blueprint.virtualTree.filter(f => f.isNew);

        return this.foldersRepo.executeInTransaction(async () => {
            const session = (this.foldersRepo as any).currentSession;

            if (foldersToInsert.length > 0) {
                const folderDocs = foldersToInsert.map(f => ({
                    _id: f._id,
                    name: f.name,
                    ownerId: new Types.ObjectId(ownerId),
                    parentId: f.parentId,
                    ancestors: f.ancestors,
                }));

                await (this.foldersRepo as any).insertManySafe(folderDocs);
            }

            const updatesByTargetFolder = new Map<string, Types.ObjectId[]>();

            for (const map of blueprint.mappings) {
                const targetIdStr = map.targetFolderId.toString();
                if (!updatesByTargetFolder.has(targetIdStr)) {
                    updatesByTargetFolder.set(targetIdStr, []);
                }
                updatesByTargetFolder.get(targetIdStr)!.push(map.questionId);
            }

            const bulkOps = [];
            for (const [folderIdStr, qIds] of updatesByTargetFolder.entries()) {
                bulkOps.push({
                    updateMany: {
                        filter: {
                            $or: [
                                { _id: { $in: qIds } },
                                { parentPassageId: { $in: qIds } }
                            ]
                        },
                        update: { $set: { folderId: new Types.ObjectId(folderIdStr) } }
                    }
                });
            }

            if (bulkOps.length > 0) {
                await this.questionsRepo.modelInstance.bulkWrite(bulkOps, { session });
            }

            this.logger.log(`[Auto-Organize] User ${ownerId} executed strategy ${payload.strategy}. Created ${foldersToInsert.length} folders, organized ${blueprint.mappings.length} root questions.`);

            return {
                message: 'Tổ chức và sắp xếp câu hỏi thành công.',
                stats: blueprint.stats
            };
        });
    }
}