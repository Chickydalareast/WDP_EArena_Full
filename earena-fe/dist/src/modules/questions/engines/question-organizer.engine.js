"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var QuestionOrganizerEngine_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionOrganizerEngine = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const questions_repository_1 = require("../questions.repository");
const question_folders_repository_1 = require("../question-folders.repository");
const knowledge_topics_repository_1 = require("../../taxonomy/knowledge-topics.repository");
const users_repository_1 = require("../../users/users.repository");
const question_organizer_interface_1 = require("../interfaces/question-organizer.interface");
const question_schema_1 = require("../schemas/question.schema");
const question_constant_1 = require("../constants/question.constant");
let QuestionOrganizerEngine = QuestionOrganizerEngine_1 = class QuestionOrganizerEngine {
    questionsRepo;
    foldersRepo;
    topicsRepo;
    usersRepo;
    logger = new common_1.Logger(QuestionOrganizerEngine_1.name);
    constructor(questionsRepo, foldersRepo, topicsRepo, usersRepo) {
        this.questionsRepo = questionsRepo;
        this.foldersRepo = foldersRepo;
        this.topicsRepo = topicsRepo;
        this.usersRepo = usersRepo;
    }
    async generateBlueprint(ownerId, payload) {
        const ownerObjId = new mongoose_1.Types.ObjectId(ownerId);
        const objectIds = payload.questionIds.map((id) => new mongoose_1.Types.ObjectId(id));
        const user = await this.usersRepo.findByIdSafe(ownerObjId, {
            projection: 'subjectIds',
        });
        if (!user || !user.subjectIds || user.subjectIds.length === 0) {
            throw new common_1.ForbiddenException('Tài khoản chưa được gán Môn học, không thể dùng tính năng tự động sắp xếp theo Chuyên đề.');
        }
        const subjectId = user.subjectIds[0];
        const questions = await this.questionsRepo.modelInstance
            .find({ _id: { $in: objectIds } })
            .select('_id topicId difficultyLevel ownerId')
            .lean()
            .exec();
        if (questions.length === 0)
            throw new common_1.BadRequestException('Không tìm thấy câu hỏi hợp lệ.');
        if (questions.some((q) => q.ownerId.toString() !== ownerId)) {
            throw new common_1.ForbiddenException('Bạn không có quyền thao tác trên câu hỏi của người khác.');
        }
        const topics = await this.topicsRepo.modelInstance
            .find({ subjectId: subjectId })
            .select('_id name parentId ancestors')
            .lean()
            .exec();
        const topicMap = new Map(topics.map((t) => [t._id.toString(), t]));
        const existingFolders = await this.foldersRepo.modelInstance
            .find({ ownerId: ownerObjId })
            .select('_id name parentId ancestors')
            .lean()
            .exec();
        const folderRegistry = new Map();
        for (const f of existingFolders) {
            const parentIdStr = f.parentId ? f.parentId.toString() : 'root';
            const key = `${parentIdStr}_${f.name.toLowerCase().trim()}`;
            folderRegistry.set(key, {
                _id: f._id,
                name: f.name,
                parentId: f.parentId,
                ancestors: f.ancestors,
                isNew: false,
            });
        }
        let baseFolderId = null;
        let baseAncestors = [];
        if (payload.baseFolderId) {
            const base = existingFolders.find((f) => f._id.toString() === payload.baseFolderId);
            if (!base)
                throw new common_1.NotFoundException('Thư mục gốc (baseFolderId) không tồn tại.');
            baseFolderId = base._id;
            baseAncestors = [...(base.ancestors || []), baseFolderId];
        }
        const mappings = [];
        let newFolderCount = 0;
        let unclassifiedCount = 0;
        for (const q of questions) {
            if (!q.topicId ||
                !q.difficultyLevel ||
                q.difficultyLevel === question_schema_1.DifficultyLevel.UNKNOWN) {
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
            if (payload.strategy === question_organizer_interface_1.OrganizeStrategy.TOPIC_STRICT ||
                payload.strategy === question_organizer_interface_1.OrganizeStrategy.TOPIC_AND_DIFFICULTY) {
                const topicPathIds = [...(topic.ancestors || []), topic._id];
                for (const tId of topicPathIds) {
                    const tNode = topicMap.get(tId.toString());
                    if (!tNode)
                        continue;
                    const key = `${currentParentId ? currentParentId.toString() : 'root'}_${tNode.name.toLowerCase().trim()}`;
                    let folderNode = folderRegistry.get(key);
                    if (!folderNode) {
                        folderNode = {
                            _id: new mongoose_1.Types.ObjectId(),
                            name: tNode.name,
                            parentId: currentParentId,
                            ancestors: [...currentAncestors],
                            isNew: true,
                        };
                        folderRegistry.set(key, folderNode);
                        newFolderCount++;
                    }
                    currentParentId = folderNode._id;
                    currentAncestors = [...folderNode.ancestors, folderNode._id];
                }
            }
            if (payload.strategy === question_organizer_interface_1.OrganizeStrategy.FLAT_DIFFICULTY ||
                payload.strategy === question_organizer_interface_1.OrganizeStrategy.TOPIC_AND_DIFFICULTY) {
                const diffName = question_constant_1.DIFFICULTY_NAME_MAP[q.difficultyLevel] || 'Chưa phân loại';
                const key = `${currentParentId ? currentParentId.toString() : 'root'}_${diffName.toLowerCase().trim()}`;
                let diffFolderNode = folderRegistry.get(key);
                if (!diffFolderNode) {
                    diffFolderNode = {
                        _id: new mongoose_1.Types.ObjectId(),
                        name: diffName,
                        parentId: currentParentId,
                        ancestors: [...currentAncestors],
                        isNew: true,
                    };
                    folderRegistry.set(key, diffFolderNode);
                    newFolderCount++;
                }
                currentParentId = diffFolderNode._id;
            }
            mappings.push({
                questionId: q._id,
                targetFolderId: currentParentId,
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
            },
        };
    }
    async execute(ownerId, payload) {
        const blueprint = await this.generateBlueprint(ownerId, payload);
        if (blueprint.mappings.length === 0) {
            throw new common_1.BadRequestException('Không có câu hỏi nào hợp lệ để tổ chức (Thiếu Chuyên đề hoặc Mức độ nhận thức).');
        }
        const foldersToInsert = blueprint.virtualTree.filter((f) => f.isNew);
        return this.foldersRepo.executeInTransaction(async () => {
            const session = this.foldersRepo.currentSession;
            if (foldersToInsert.length > 0) {
                const folderDocs = foldersToInsert.map((f) => ({
                    _id: f._id,
                    name: f.name,
                    ownerId: new mongoose_1.Types.ObjectId(ownerId),
                    parentId: f.parentId,
                    ancestors: f.ancestors,
                }));
                await this.foldersRepo.insertManySafe(folderDocs);
            }
            const updatesByTargetFolder = new Map();
            for (const map of blueprint.mappings) {
                const targetIdStr = map.targetFolderId.toString();
                if (!updatesByTargetFolder.has(targetIdStr)) {
                    updatesByTargetFolder.set(targetIdStr, []);
                }
                updatesByTargetFolder.get(targetIdStr).push(map.questionId);
            }
            const bulkOps = [];
            for (const [folderIdStr, qIds] of updatesByTargetFolder.entries()) {
                bulkOps.push({
                    updateMany: {
                        filter: {
                            $or: [{ _id: { $in: qIds } }, { parentPassageId: { $in: qIds } }],
                        },
                        update: { $set: { folderId: new mongoose_1.Types.ObjectId(folderIdStr) } },
                    },
                });
            }
            if (bulkOps.length > 0) {
                await this.questionsRepo.modelInstance.bulkWrite(bulkOps, { session });
            }
            this.logger.log(`[Auto-Organize] User ${ownerId} executed strategy ${payload.strategy}. Created ${foldersToInsert.length} folders, organized ${blueprint.mappings.length} root questions.`);
            return {
                message: 'Tổ chức và sắp xếp câu hỏi thành công.',
                stats: blueprint.stats,
            };
        });
    }
};
exports.QuestionOrganizerEngine = QuestionOrganizerEngine;
exports.QuestionOrganizerEngine = QuestionOrganizerEngine = QuestionOrganizerEngine_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [questions_repository_1.QuestionsRepository,
        question_folders_repository_1.QuestionFoldersRepository,
        knowledge_topics_repository_1.KnowledgeTopicsRepository,
        users_repository_1.UsersRepository])
], QuestionOrganizerEngine);
//# sourceMappingURL=question-organizer.engine.js.map