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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var QuestionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const questions_repository_1 = require("./questions.repository");
const question_schema_1 = require("./schemas/question.schema");
const knowledge_topics_repository_1 = require("../taxonomy/knowledge-topics.repository");
const users_service_1 = require("../users/users.service");
const question_folders_repository_1 = require("./question-folders.repository");
const media_repository_1 = require("../media/media.repository");
const question_interface_1 = require("./interfaces/question.interface");
const question_constant_1 = require("./constants/question.constant");
const question_organizer_engine_1 = require("./engines/question-organizer.engine");
const question_jobs_interface_1 = require("./interfaces/question-jobs.interface");
let QuestionsService = QuestionsService_1 = class QuestionsService {
    questionsRepository;
    topicsRepo;
    usersService;
    foldersRepo;
    mediaRepo;
    syncQueue;
    questionTasksQueue;
    organizerEngine;
    logger = new common_1.Logger(QuestionsService_1.name);
    constructor(questionsRepository, topicsRepo, usersService, foldersRepo, mediaRepo, syncQueue, questionTasksQueue, organizerEngine) {
        this.questionsRepository = questionsRepository;
        this.topicsRepo = topicsRepo;
        this.usersService = usersService;
        this.foldersRepo = foldersRepo;
        this.mediaRepo = mediaRepo;
        this.syncQueue = syncQueue;
        this.questionTasksQueue = questionTasksQueue;
        this.organizerEngine = organizerEngine;
    }
    async dispatchSyncEvent(action, questionIds) {
        if (!questionIds || questionIds.length === 0)
            return;
        try {
            const jobs = questionIds.map((id) => ({
                name: 'sync-to-exam-paper',
                data: { action, questionId: id },
                opts: {
                    removeOnComplete: true,
                    removeOnFail: false,
                    attempts: 3,
                    backoff: { type: 'exponential', delay: 2000 },
                },
            }));
            await this.syncQueue.addBulk(jobs);
            this.logger.debug(`[BullMQ] Đã bắn tín hiệu ${action} cho ${questionIds.length} câu hỏi vào hàng đợi.`);
        }
        catch (error) {
            this.logger.error(`[BullMQ Panic] Lỗi đẩy Job đồng bộ câu hỏi: ${error.message}`);
        }
    }
    async validateMediaOwnership(ownerId, mediaIds) {
        if (!mediaIds || mediaIds.length === 0)
            return [];
        const uniqueIds = [...new Set(mediaIds)];
        const objectIds = uniqueIds.map((id) => new mongoose_1.Types.ObjectId(id));
        const validCount = await this.mediaRepo.model.countDocuments({
            _id: { $in: objectIds },
            uploadedBy: new mongoose_1.Types.ObjectId(ownerId),
        });
        if (validCount !== uniqueIds.length) {
            throw new common_1.BadRequestException('Một hoặc nhiều tệp đính kèm không tồn tại hoặc không thuộc quyền sở hữu của bạn.');
        }
        return objectIds;
    }
    async bulkCreateQuestions(payload) {
        const { ownerId, folderId, questions } = payload;
        const folder = await this.foldersRepo.findByIdSafe(new mongoose_1.Types.ObjectId(folderId));
        if (!folder || folder.ownerId.toString() !== ownerId) {
            throw new common_1.ForbiddenException('Thư mục không tồn tại hoặc bạn không có quyền truy cập.');
        }
        const allMediaIdsToValidate = [];
        for (const q of questions) {
            if (q.attachedMedia)
                allMediaIdsToValidate.push(...q.attachedMedia);
            if (q.subQuestions) {
                for (const sub of q.subQuestions) {
                    if (sub.attachedMedia)
                        allMediaIdsToValidate.push(...sub.attachedMedia);
                }
            }
        }
        await this.validateMediaOwnership(ownerId, allMediaIdsToValidate);
        return this.questionsRepository.executeInTransaction(async () => {
            const flatDocuments = [];
            const ownerObjectId = new mongoose_1.Types.ObjectId(ownerId);
            const folderObjectId = new mongoose_1.Types.ObjectId(folderId);
            for (const q of questions) {
                const mappedMedia = (q.attachedMedia || []).map((id) => new mongoose_1.Types.ObjectId(id));
                if (q.type === question_schema_1.QuestionType.PASSAGE && q.subQuestions?.length) {
                    const parentId = new mongoose_1.Types.ObjectId();
                    flatDocuments.push({
                        _id: parentId,
                        ownerId: ownerObjectId,
                        folderId: folderObjectId,
                        topicId: q.topicId ? new mongoose_1.Types.ObjectId(q.topicId) : null,
                        type: question_schema_1.QuestionType.PASSAGE,
                        content: q.content,
                        explanation: q.explanation || null,
                        answers: [],
                        attachedMedia: mappedMedia,
                        tags: q.tags || [],
                        difficultyLevel: q.difficultyLevel || question_schema_1.DifficultyLevel.UNKNOWN,
                        isDraft: q.isDraft !== undefined ? q.isDraft : true,
                    });
                    q.subQuestions.forEach((sub, index) => {
                        flatDocuments.push({
                            _id: new mongoose_1.Types.ObjectId(),
                            ownerId: ownerObjectId,
                            folderId: folderObjectId,
                            topicId: q.topicId ? new mongoose_1.Types.ObjectId(q.topicId) : null,
                            parentPassageId: parentId,
                            type: question_schema_1.QuestionType.MULTIPLE_CHOICE,
                            content: sub.content,
                            explanation: sub.explanation || null,
                            answers: sub.answers,
                            orderIndex: index + 1,
                            attachedMedia: (sub.attachedMedia || []).map((id) => new mongoose_1.Types.ObjectId(id)),
                            tags: q.tags || [],
                            difficultyLevel: sub.difficultyLevel || question_schema_1.DifficultyLevel.UNKNOWN,
                            isDraft: q.isDraft !== undefined ? q.isDraft : true,
                        });
                    });
                }
                else {
                    flatDocuments.push({
                        _id: new mongoose_1.Types.ObjectId(),
                        ownerId: ownerObjectId,
                        folderId: folderObjectId,
                        topicId: q.topicId ? new mongoose_1.Types.ObjectId(q.topicId) : null,
                        type: q.type,
                        content: q.content,
                        explanation: q.explanation || null,
                        answers: q.answers || [],
                        attachedMedia: mappedMedia,
                        tags: q.tags || [],
                        difficultyLevel: q.difficultyLevel || question_schema_1.DifficultyLevel.UNKNOWN,
                        isDraft: q.isDraft !== undefined ? q.isDraft : true,
                    });
                }
            }
            const result = await this.questionsRepository.insertManySafe(flatDocuments);
            const insertedIds = result.map((doc) => doc._id.toString());
            this.logger.log(`[Import] User ${ownerId} imported ${result.length} questions into Folder ${folderId}`);
            return {
                message: `Đã import thành công ${result.length} câu hỏi.`,
                count: result.length,
                insertedIds,
            };
        });
    }
    async bulkStandardizeQuestions(ownerId, payload) {
        const { questionIds, topicId, difficultyLevel, autoOrganize } = payload;
        const topic = await this.topicsRepo.findByIdSafe(new mongoose_1.Types.ObjectId(topicId));
        if (!topic)
            throw new common_1.NotFoundException('Chuyên đề không tồn tại.');
        const owner = await this.usersService.findById(ownerId);
        if (!owner)
            throw new common_1.ForbiddenException('Tài khoản không tồn tại.');
        const hasPermission = owner.subjectIds?.some((id) => id.toString() === topic.subjectId.toString());
        if (!hasPermission)
            throw new common_1.ForbiddenException('Bạn không có chuyên môn để gán câu hỏi cho môn học này.');
        const objectIds = questionIds.map((id) => new mongoose_1.Types.ObjectId(id));
        return this.questionsRepository.executeInTransaction(async () => {
            const questionModel = this.questionsRepository.model;
            const session = this.questionsRepository.currentSession;
            if (!autoOrganize) {
                const updateResult = await questionModel.updateMany({ _id: { $in: objectIds }, ownerId: new mongoose_1.Types.ObjectId(ownerId) }, {
                    $set: {
                        topicId: new mongoose_1.Types.ObjectId(topicId),
                        difficultyLevel: difficultyLevel,
                        isDraft: false,
                    },
                }, { session });
                return {
                    message: `Đã chuẩn hóa thành công ${updateResult.modifiedCount} câu hỏi.`,
                };
            }
            const questions = await questionModel
                .find({ _id: { $in: objectIds }, ownerId: new mongoose_1.Types.ObjectId(ownerId) })
                .select('_id folderId type')
                .lean()
                .session(session);
            if (questions.length === 0)
                throw new common_1.BadRequestException('Không tìm thấy câu hỏi hợp lệ để chuẩn hóa.');
            const folderGroups = new Map();
            const passageIds = [];
            for (const q of questions) {
                const fId = q.folderId.toString();
                if (!folderGroups.has(fId))
                    folderGroups.set(fId, []);
                folderGroups.get(fId).push(q._id);
                if (q.type === question_schema_1.QuestionType.PASSAGE)
                    passageIds.push(q._id);
            }
            const diffName = question_constant_1.DIFFICULTY_NAME_MAP[difficultyLevel] || 'Chưa phân loại';
            let totalUpdated = 0;
            for (const [baseFolderId, qIds] of folderGroups.entries()) {
                const baseFolderObjId = new mongoose_1.Types.ObjectId(baseFolderId);
                const baseFolder = await this.foldersRepo.findByIdSafe(baseFolderObjId);
                let topicFolderId;
                let topicFolderAncestors = [];
                if (baseFolder &&
                    baseFolder.name.trim().toLowerCase() ===
                        topic.name.trim().toLowerCase()) {
                    topicFolderId = baseFolder._id;
                    topicFolderAncestors = baseFolder.ancestors || [];
                }
                else {
                    let topicFolder = await this.foldersRepo.findOneSafe({
                        ownerId: new mongoose_1.Types.ObjectId(ownerId),
                        parentId: baseFolderObjId,
                        name: topic.name,
                    });
                    if (!topicFolder) {
                        topicFolder = await this.foldersRepo.createDocument({
                            name: topic.name,
                            ownerId: new mongoose_1.Types.ObjectId(ownerId),
                            parentId: baseFolderObjId,
                            ancestors: baseFolder
                                ? [...(baseFolder.ancestors || []), baseFolder._id]
                                : [],
                        });
                    }
                    topicFolderId = topicFolder._id;
                    topicFolderAncestors = [
                        ...(topicFolder.ancestors || []),
                        topicFolder._id,
                    ];
                }
                let diffFolder = await this.foldersRepo.findOneSafe({
                    ownerId: new mongoose_1.Types.ObjectId(ownerId),
                    parentId: topicFolderId,
                    name: diffName,
                });
                if (!diffFolder) {
                    diffFolder = await this.foldersRepo.createDocument({
                        name: diffName,
                        ownerId: new mongoose_1.Types.ObjectId(ownerId),
                        parentId: topicFolderId,
                        ancestors: topicFolderAncestors,
                    });
                }
                const updateRes = await questionModel.updateMany({ _id: { $in: qIds } }, {
                    $set: {
                        topicId: new mongoose_1.Types.ObjectId(topicId),
                        difficultyLevel: difficultyLevel,
                        isDraft: false,
                        folderId: diffFolder._id,
                    },
                }, { session });
                totalUpdated += updateRes.modifiedCount;
                const groupPassageIds = qIds.filter((id) => passageIds.some((pId) => pId.toString() === id.toString()));
                if (groupPassageIds.length > 0) {
                    await questionModel.updateMany({ parentPassageId: { $in: groupPassageIds } }, { $set: { folderId: diffFolder._id } }, { session });
                }
            }
            this.logger.log(`[Auto-Routing] User ${ownerId} standardized and moved ${totalUpdated} questions to proper folders.`);
            return {
                message: `Đã chuẩn hóa và tự động sắp xếp ${totalUpdated} câu hỏi vào kho dữ liệu.`,
            };
        });
    }
    async createQuestion(payload) {
        if (payload.parentPassageId) {
            if (!mongoose_1.Types.ObjectId.isValid(payload.parentPassageId)) {
                throw new common_1.BadRequestException('Mã đoạn văn mẹ (parentPassageId) không hợp lệ.');
            }
            const parent = await this.questionsRepository.findByIdSafe(payload.parentPassageId);
            if (!parent) {
                throw new common_1.NotFoundException('Không tìm thấy đoạn văn mẹ.');
            }
            if (parent.type !== question_schema_1.QuestionType.PASSAGE) {
                throw new common_1.BadRequestException('Câu hỏi cha không phải là một đoạn văn (PASSAGE). Không thể gán làm parent.');
            }
        }
        const finalAnswers = payload.type === question_schema_1.QuestionType.PASSAGE ? [] : payload.answers || [];
        const validMediaObjectIds = await this.validateMediaOwnership(payload.ownerId, payload.attachedMedia || []);
        const newDoc = await this.questionsRepository.createDocument({
            ownerId: new mongoose_1.Types.ObjectId(payload.ownerId),
            folderId: new mongoose_1.Types.ObjectId(payload.folderId),
            topicId: payload.topicId ? new mongoose_1.Types.ObjectId(payload.topicId) : null,
            parentPassageId: payload.parentPassageId
                ? new mongoose_1.Types.ObjectId(payload.parentPassageId)
                : null,
            type: payload.type,
            content: payload.content,
            explanation: payload.explanation || null,
            orderIndex: payload.orderIndex || 0,
            answers: finalAnswers,
            difficultyLevel: payload.difficultyLevel,
            tags: payload.tags || [],
            isDraft: payload.isDraft ?? true,
            attachedMedia: validMediaObjectIds,
        });
        const populatedDoc = await newDoc.populate({
            path: 'attachedMedia',
            select: 'url mimetype provider originalName _id',
        });
        return {
            message: 'Tạo câu hỏi thành công.',
            question: {
                id: populatedDoc._id,
                content: populatedDoc.content,
                type: populatedDoc.type,
                attachedMedia: populatedDoc.attachedMedia,
            },
        };
    }
    async updateQuestion(id, ownerId, payload) {
        if (!mongoose_1.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('ID câu hỏi không hợp lệ.');
        }
        const questionId = new mongoose_1.Types.ObjectId(id);
        const question = await this.questionsRepository.findByIdSafe(questionId);
        if (!question)
            throw new common_1.NotFoundException('Không tìm thấy câu hỏi.');
        if (question.ownerId.toString() !== ownerId)
            throw new common_1.ForbiddenException('Bạn không có quyền chỉnh sửa câu hỏi này.');
        const finalIsDraft = payload.isDraft !== undefined ? payload.isDraft : question.isDraft;
        if (finalIsDraft === false) {
            const finalTopicId = payload.topicId !== undefined
                ? payload.topicId
                : question.topicId?.toString();
            const finalDiff = payload.difficultyLevel !== undefined
                ? payload.difficultyLevel
                : question.difficultyLevel;
            if (!finalTopicId || finalDiff === question_schema_1.DifficultyLevel.UNKNOWN) {
                throw new common_1.BadRequestException('Không thể bỏ trạng thái Nháp. Câu hỏi xuất bản bắt buộc phải được gán Chuyên đề và Mức độ nhận thức.');
            }
        }
        const updateData = { ...payload };
        if (payload.topicId)
            updateData.topicId = new mongoose_1.Types.ObjectId(payload.topicId);
        if (payload.folderId)
            updateData.folderId = new mongoose_1.Types.ObjectId(payload.folderId);
        if (payload.parentPassageId)
            updateData.parentPassageId = new mongoose_1.Types.ObjectId(payload.parentPassageId);
        if (payload.attachedMedia) {
            updateData.attachedMedia = payload.attachedMedia.map((mId) => new mongoose_1.Types.ObjectId(mId));
        }
        const updated = await this.questionsRepository.updateByIdSafe(questionId, {
            $set: updateData,
        });
        await this.dispatchSyncEvent(question_interface_1.QuestionSyncAction.UPDATE, [
            questionId.toString(),
        ]);
        return updated;
    }
    async cloneQuestion(id, currentOwnerId, payload) {
        if (!mongoose_1.Types.ObjectId.isValid(id) ||
            !mongoose_1.Types.ObjectId.isValid(payload.destFolderId)) {
            throw new common_1.BadRequestException('ID câu hỏi hoặc thư mục đích không hợp lệ.');
        }
        const questionId = new mongoose_1.Types.ObjectId(id);
        const destFolderId = new mongoose_1.Types.ObjectId(payload.destFolderId);
        const destFolder = await this.foldersRepo.findByIdSafe(destFolderId);
        if (!destFolder || destFolder.ownerId.toString() !== currentOwnerId) {
            throw new common_1.ForbiddenException('Thư mục đích không tồn tại hoặc bạn không có quyền truy cập.');
        }
        const sourceQuestion = await this.questionsRepository.findByIdSafe(questionId);
        if (!sourceQuestion) {
            throw new common_1.NotFoundException('Câu hỏi gốc không tồn tại.');
        }
        if (sourceQuestion.ownerId.toString() !== currentOwnerId) {
            throw new common_1.ForbiddenException('Bạn không có quyền nhân bản câu hỏi của người khác.');
        }
        return this.questionsRepository.executeInTransaction(async () => {
            const { _id, createdAt, updatedAt, __v, ...baseData } = sourceQuestion;
            baseData.ownerId = new mongoose_1.Types.ObjectId(currentOwnerId);
            baseData.folderId = destFolderId;
            baseData.content = `${baseData.content} (Copy)`;
            if (baseData.type !== question_schema_1.QuestionType.PASSAGE) {
                const clonedDoc = await this.questionsRepository.createDocument(baseData);
                this.logger.log(`[Clone] User ${currentOwnerId} shallow-cloned Question ${id}`);
                return {
                    message: 'Nhân bản câu hỏi thành công.',
                    data: clonedDoc,
                };
            }
            const newParentId = new mongoose_1.Types.ObjectId();
            const parentDoc = { ...baseData, _id: newParentId };
            const subQuestions = await this.questionsRepository.model
                .find({ parentPassageId: questionId })
                .lean();
            const docsToInsert = [parentDoc];
            for (const sub of subQuestions) {
                const { _id: subId, createdAt: subCA, updatedAt: subUA, __v: subV, ...subBaseData } = sub;
                subBaseData.ownerId = new mongoose_1.Types.ObjectId(currentOwnerId);
                subBaseData.folderId = destFolderId;
                subBaseData.parentPassageId = newParentId;
                docsToInsert.push({
                    ...subBaseData,
                    _id: new mongoose_1.Types.ObjectId(),
                });
            }
            const insertedDocs = await this.questionsRepository.insertManySafe(docsToInsert);
            this.logger.log(`[Clone Engine] User ${currentOwnerId} deep-cloned Passage ${id} containing ${subQuestions.length} sub-questions.`);
            return {
                message: `Nhân bản đoạn văn và ${subQuestions.length} câu hỏi con thành công.`,
                data: insertedDocs.find((doc) => doc._id.toString() === newParentId.toString()),
            };
        });
    }
    async expandHierarchyIds(repo, inputIds) {
        if (!inputIds || inputIds.length === 0)
            return undefined;
        const objIds = inputIds.map((id) => new mongoose_1.Types.ObjectId(id));
        const childNodes = await repo.modelInstance
            .find({ ancestors: { $in: objIds } })
            .select('_id')
            .lean()
            .exec();
        return [
            ...new Set([
                ...inputIds,
                ...childNodes.map((n) => n._id.toString()),
            ]),
        ];
    }
    async getQuestionsPaginated(userId, payload) {
        const expandedFolderIds = await this.expandHierarchyIds(this.foldersRepo, payload.folderIds);
        const expandedTopicIds = await this.expandHierarchyIds(this.topicsRepo, payload.topicIds);
        const { folderIds, topicIds, ...restPayload } = payload;
        return this.questionsRepository.getQuestionsPaginated(userId, {
            ...restPayload,
            folderIds: expandedFolderIds,
            topicIds: expandedTopicIds,
        });
    }
    async moveQuestions(ownerId, payload) {
        const { questionIds, destFolderId } = payload;
        const destFolder = await this.foldersRepo.findOne({
            _id: new mongoose_1.Types.ObjectId(destFolderId),
        });
        if (!destFolder || destFolder.ownerId.toString() !== ownerId) {
            throw new common_1.ForbiddenException('Thư mục đích không tồn tại hoặc bạn không có quyền truy cập.');
        }
        const objectIds = questionIds.map((id) => new mongoose_1.Types.ObjectId(id));
        const questionModel = this.questionsRepository.model;
        const result = await questionModel.updateMany({
            _id: { $in: objectIds },
            ownerId: new mongoose_1.Types.ObjectId(ownerId),
        }, { $set: { folderId: new mongoose_1.Types.ObjectId(destFolderId) } });
        return {
            message: `Đã di chuyển thành công ${result.modifiedCount} câu hỏi.`,
        };
    }
    async deleteQuestion(id, ownerId) {
        const questionId = new mongoose_1.Types.ObjectId(id);
        const questionModel = this.questionsRepository.model;
        const question = await questionModel.findOne({ _id: questionId });
        if (!question)
            throw new common_1.NotFoundException('Câu hỏi không tồn tại.');
        if (question.ownerId.toString() !== ownerId) {
            throw new common_1.ForbiddenException('Bạn không có quyền xóa câu hỏi này.');
        }
        const subQuestions = await questionModel
            .find({ parentPassageId: questionId })
            .select('_id')
            .lean();
        const idsToDelete = [
            questionId.toString(),
            ...subQuestions.map((q) => q._id.toString()),
        ];
        await questionModel.deleteOne({ _id: questionId });
        await questionModel.deleteMany({ parentPassageId: questionId });
        await this.dispatchSyncEvent(question_interface_1.QuestionSyncAction.DELETE, idsToDelete);
        return { message: 'Đã xóa vĩnh viễn câu hỏi.' };
    }
    async updatePassageWithDiffing(passageId, ownerId, payload) {
        if (!mongoose_1.Types.ObjectId.isValid(passageId)) {
            throw new common_1.BadRequestException('ID Đoạn văn không hợp lệ.');
        }
        const passageObjectId = new mongoose_1.Types.ObjectId(passageId);
        const passage = await this.questionsRepository.findByIdSafe(passageObjectId);
        if (!passage)
            throw new common_1.NotFoundException('Không tìm thấy đoạn văn mẹ.');
        if (passage.ownerId.toString() !== ownerId)
            throw new common_1.ForbiddenException('Bạn không có quyền chỉnh sửa nội dung này.');
        if (passage.type !== question_schema_1.QuestionType.PASSAGE)
            throw new common_1.BadRequestException('Câu hỏi này không phải là Đoạn văn (PASSAGE).');
        const allMediaIdsToValidate = [];
        if (payload.attachedMedia)
            allMediaIdsToValidate.push(...payload.attachedMedia);
        payload.subQuestions.forEach((sub) => {
            if (sub.attachedMedia)
                allMediaIdsToValidate.push(...sub.attachedMedia);
        });
        await this.validateMediaOwnership(ownerId, allMediaIdsToValidate);
        const existingSubQuestions = await this.questionsRepository.model
            .find({ parentPassageId: passageObjectId })
            .select('_id')
            .lean();
        const existingIds = existingSubQuestions.map((q) => q._id.toString());
        const incomingIds = payload.subQuestions
            .map((sub) => sub.id)
            .filter((id) => !!id);
        const idsToDelete = existingIds.filter((id) => !incomingIds.includes(id));
        const toCreateDocs = [];
        const bulkUpdateOps = [];
        payload.subQuestions.forEach((sub, index) => {
            const absoluteOrderIndex = index + 1;
            const mappedMedia = (sub.attachedMedia || []).map((id) => new mongoose_1.Types.ObjectId(id));
            if (sub.id) {
                bulkUpdateOps.push({
                    updateOne: {
                        filter: {
                            _id: new mongoose_1.Types.ObjectId(sub.id),
                            parentPassageId: passageObjectId,
                        },
                        update: {
                            $set: {
                                content: sub.content,
                                explanation: sub.explanation || null,
                                difficultyLevel: sub.difficultyLevel || question_schema_1.DifficultyLevel.UNKNOWN,
                                answers: sub.answers,
                                attachedMedia: mappedMedia,
                                orderIndex: absoluteOrderIndex,
                            },
                        },
                    },
                });
            }
            else {
                toCreateDocs.push({
                    _id: new mongoose_1.Types.ObjectId(),
                    ownerId: passage.ownerId,
                    folderId: passage.folderId,
                    topicId: passage.topicId,
                    parentPassageId: passageObjectId,
                    type: question_schema_1.QuestionType.MULTIPLE_CHOICE,
                    content: sub.content,
                    explanation: sub.explanation || null,
                    difficultyLevel: sub.difficultyLevel || question_schema_1.DifficultyLevel.UNKNOWN,
                    answers: sub.answers,
                    attachedMedia: mappedMedia,
                    tags: payload.tags || passage.tags,
                    orderIndex: absoluteOrderIndex,
                    isDraft: passage.isDraft,
                });
            }
        });
        const result = await this.questionsRepository.executeInTransaction(async () => {
            const session = this.questionsRepository.currentSession;
            const questionModel = this.questionsRepository.model;
            const passageUpdateData = {};
            if (payload.content !== undefined)
                passageUpdateData.content = payload.content;
            if (payload.explanation !== undefined)
                passageUpdateData.explanation = payload.explanation;
            if (payload.difficultyLevel !== undefined)
                passageUpdateData.difficultyLevel = payload.difficultyLevel;
            if (payload.tags !== undefined)
                passageUpdateData.tags = payload.tags;
            if (payload.topicId !== undefined)
                passageUpdateData.topicId = new mongoose_1.Types.ObjectId(payload.topicId);
            if (payload.attachedMedia !== undefined) {
                passageUpdateData.attachedMedia = payload.attachedMedia.map((id) => new mongoose_1.Types.ObjectId(id));
            }
            if (payload.isDraft !== undefined) {
                passageUpdateData.isDraft = payload.isDraft;
                if (payload.isDraft === false) {
                    const finalTopicId = payload.topicId !== undefined
                        ? payload.topicId
                        : passage.topicId?.toString();
                    const finalDiff = payload.difficultyLevel !== undefined
                        ? payload.difficultyLevel
                        : passage.difficultyLevel;
                    if (!finalTopicId || finalDiff === question_schema_1.DifficultyLevel.UNKNOWN) {
                        throw new common_1.BadRequestException('Không thể xuất bản! Đoạn văn bắt buộc phải được gán Chuyên đề và Mức độ nhận thức.');
                    }
                }
            }
            if (Object.keys(passageUpdateData).length > 0) {
                await questionModel.updateOne({ _id: passageObjectId }, { $set: passageUpdateData }, { session });
            }
            if (idsToDelete.length > 0) {
                const objectIdsToDelete = idsToDelete.map((id) => new mongoose_1.Types.ObjectId(id));
                await this.questionsRepository.deleteManySafe({
                    _id: { $in: objectIdsToDelete },
                    parentPassageId: passageObjectId,
                });
            }
            if (toCreateDocs.length > 0) {
                await this.questionsRepository.insertManySafe(toCreateDocs);
            }
            if (bulkUpdateOps.length > 0) {
                await questionModel.bulkWrite(bulkUpdateOps, { session });
            }
            this.logger.log(`[Diffing Engine] User ${ownerId} updated Passage ${passageId}. Created: ${toCreateDocs.length}, Updated: ${bulkUpdateOps.length}, Deleted: ${idsToDelete.length}`);
            return {
                message: 'Lưu thay đổi toàn bộ đoạn văn và câu hỏi con thành công.',
                diffStats: {
                    deleted: idsToDelete.length,
                    created: toCreateDocs.length,
                    updated: bulkUpdateOps.length,
                },
            };
        });
        const updatedIds = [
            passageId,
            ...bulkUpdateOps.map((op) => op.updateOne.filter._id.toString()),
        ];
        if (updatedIds.length > 0) {
            await this.dispatchSyncEvent(question_interface_1.QuestionSyncAction.UPDATE, updatedIds);
        }
        if (idsToDelete.length > 0) {
            await this.dispatchSyncEvent(question_interface_1.QuestionSyncAction.DELETE, idsToDelete);
        }
        return result;
    }
    async bulkCloneQuestions(currentOwnerId, payload) {
        const { questionIds, destFolderId } = payload;
        const uniqueIds = [...new Set(questionIds)];
        const objectIds = uniqueIds.map((id) => new mongoose_1.Types.ObjectId(id));
        const destFolderObjectId = new mongoose_1.Types.ObjectId(destFolderId);
        const destFolder = await this.foldersRepo.findByIdSafe(destFolderObjectId);
        if (!destFolder || destFolder.ownerId.toString() !== currentOwnerId) {
            throw new common_1.ForbiddenException('Thư mục đích không tồn tại hoặc bạn không có quyền truy cập.');
        }
        const sourceQuestions = await this.questionsRepository.model
            .find({ _id: { $in: objectIds } })
            .lean();
        if (sourceQuestions.length !== uniqueIds.length) {
            throw new common_1.BadRequestException('Một số câu hỏi không tồn tại hoặc đã bị xóa khỏi hệ thống.');
        }
        const hasInvalidOwner = sourceQuestions.some((q) => q.ownerId.toString() !== currentOwnerId);
        if (hasInvalidOwner) {
            throw new common_1.ForbiddenException('Phát hiện truy cập trái phép! Bạn không có quyền nhân bản câu hỏi của người khác.');
        }
        const passageIds = sourceQuestions
            .filter((q) => q.type === question_schema_1.QuestionType.PASSAGE)
            .map((q) => q._id);
        let allSubQuestions = [];
        if (passageIds.length > 0) {
            allSubQuestions = await this.questionsRepository.model
                .find({ parentPassageId: { $in: passageIds } })
                .lean();
        }
        return this.questionsRepository.executeInTransaction(async () => {
            const docsToInsert = [];
            const passageIdMap = new Map();
            for (const q of sourceQuestions) {
                const { _id, createdAt, updatedAt, __v, ...baseData } = q;
                baseData.ownerId = new mongoose_1.Types.ObjectId(currentOwnerId);
                baseData.folderId = destFolderObjectId;
                baseData.content = `${baseData.content} (Copy)`;
                const newRootId = new mongoose_1.Types.ObjectId();
                if (baseData.type === question_schema_1.QuestionType.PASSAGE) {
                    passageIdMap.set(_id.toString(), newRootId);
                }
                docsToInsert.push({ ...baseData, _id: newRootId });
            }
            for (const sub of allSubQuestions) {
                const { _id, createdAt, updatedAt, __v, ...subBaseData } = sub;
                subBaseData.ownerId = new mongoose_1.Types.ObjectId(currentOwnerId);
                subBaseData.folderId = destFolderObjectId;
                const oldParentIdStr = sub.parentPassageId.toString();
                const newParentId = passageIdMap.get(oldParentIdStr);
                if (!newParentId) {
                    this.logger.warn(`[Bulk Clone] Mồ côi câu hỏi con ${oldParentIdStr}. Bỏ qua.`);
                    continue;
                }
                subBaseData.parentPassageId = newParentId;
                docsToInsert.push({ ...subBaseData, _id: new mongoose_1.Types.ObjectId() });
            }
            await this.questionsRepository.insertManySafe(docsToInsert);
            this.logger.log(`[Bulk Clone] User ${currentOwnerId} cloned ${sourceQuestions.length} roots and ${allSubQuestions.length} subs into Folder ${destFolderId}.`);
            return {
                message: `Đã nhân bản thành công ${sourceQuestions.length} câu hỏi.`,
                clonedRootCount: sourceQuestions.length,
                clonedSubCount: allSubQuestions.length,
            };
        });
    }
    async bulkDeleteQuestions(currentOwnerId, payload) {
        const { questionIds } = payload;
        const uniqueIds = [...new Set(questionIds)];
        const objectIds = uniqueIds.map((id) => new mongoose_1.Types.ObjectId(id));
        const ownerObjectId = new mongoose_1.Types.ObjectId(currentOwnerId);
        const sourceQuestions = await this.questionsRepository.model
            .find({ _id: { $in: objectIds } })
            .select('_id ownerId type')
            .lean();
        if (sourceQuestions.length !== uniqueIds.length) {
            throw new common_1.BadRequestException('Một số câu hỏi không tồn tại hoặc đã bị xóa trước đó.');
        }
        const hasInvalidOwner = sourceQuestions.some((q) => q.ownerId.toString() !== currentOwnerId);
        if (hasInvalidOwner) {
            throw new common_1.ForbiddenException('Phát hiện truy cập trái phép! Bạn không có quyền xóa câu hỏi của người khác.');
        }
        const passageIds = sourceQuestions
            .filter((q) => q.type === question_schema_1.QuestionType.PASSAGE)
            .map((q) => q._id);
        let subQuestionIds = [];
        if (passageIds.length > 0) {
            const subQuestions = await this.questionsRepository.model
                .find({ parentPassageId: { $in: passageIds } })
                .select('_id')
                .lean();
            subQuestionIds = subQuestions.map((q) => q._id);
        }
        const allObjectIdsToDelete = [...objectIds, ...subQuestionIds];
        const allStringIdsToDelete = allObjectIdsToDelete.map((id) => id.toString());
        const deleteResult = await this.questionsRepository.model.deleteMany({
            _id: { $in: allObjectIdsToDelete },
        });
        this.logger.log(`[Bulk Delete] User ${currentOwnerId} deleted ${deleteResult.deletedCount} items (${uniqueIds.length} roots, ${subQuestionIds.length} subs).`);
        await this.dispatchSyncEvent(question_interface_1.QuestionSyncAction.DELETE, allStringIdsToDelete);
        return {
            message: `Đã xóa vĩnh viễn ${uniqueIds.length} câu hỏi đã chọn.`,
            deletedCount: deleteResult.deletedCount,
        };
    }
    async suggestFoldersForMove(ownerId, payload) {
        const { questionIds } = payload;
        const objectIds = questionIds.map((id) => new mongoose_1.Types.ObjectId(id));
        const questions = await this.questionsRepository.model
            .find({ _id: { $in: objectIds }, ownerId: new mongoose_1.Types.ObjectId(ownerId) })
            .select('topicId difficultyLevel')
            .lean()
            .exec();
        if (questions.length === 0)
            return [];
        const topicCounts = {};
        for (const q of questions) {
            if (q.topicId) {
                const tid = q.topicId.toString();
                topicCounts[tid] = (topicCounts[tid] || 0) + 1;
            }
        }
        const topicKeys = Object.keys(topicCounts);
        if (topicKeys.length === 0)
            return [];
        const topTopicId = topicKeys.reduce((a, b) => topicCounts[a] > topicCounts[b] ? a : b);
        const diffCounts = {};
        const filteredQuestions = questions.filter((q) => q.topicId?.toString() === topTopicId);
        for (const q of filteredQuestions) {
            const diff = q.difficultyLevel || question_schema_1.DifficultyLevel.UNKNOWN;
            diffCounts[diff] = (diffCounts[diff] || 0) + 1;
        }
        const diffKeys = Object.keys(diffCounts);
        const topDiff = diffKeys.length > 0
            ? diffKeys.reduce((a, b) => diffCounts[a] > diffCounts[b] ? a : b)
            : question_schema_1.DifficultyLevel.UNKNOWN;
        const topic = await this.topicsRepo.findByIdSafe(new mongoose_1.Types.ObjectId(topTopicId));
        if (!topic)
            return [];
        const suggestions = [];
        const ownerObjId = new mongoose_1.Types.ObjectId(ownerId);
        const topicFolder = await this.foldersRepo.findOneSafe({
            ownerId: ownerObjId,
            name: topic.name,
        });
        if (topicFolder) {
            const diffName = question_constant_1.DIFFICULTY_NAME_MAP[topDiff] || 'Chưa phân loại';
            const diffFolder = await this.foldersRepo.findOneSafe({
                ownerId: ownerObjId,
                parentId: topicFolder._id,
                name: diffName,
            });
            if (diffFolder) {
                suggestions.push({
                    id: diffFolder._id.toString(),
                    name: `${topicFolder.name} > ${diffFolder.name}`,
                    isExactMatch: true,
                });
            }
            suggestions.push({
                id: topicFolder._id.toString(),
                name: topicFolder.name,
                isExactMatch: !diffFolder,
            });
        }
        return suggestions;
    }
    async previewOrganize(ownerId, payload) {
        return this.organizerEngine.generateBlueprint(ownerId, payload);
    }
    async executeOrganize(ownerId, payload) {
        const blueprint = await this.organizerEngine.generateBlueprint(ownerId, payload);
        const result = await this.organizerEngine.execute(ownerId, payload);
        const movedQuestionIds = blueprint.mappings.map((m) => m.questionId.toString());
        if (movedQuestionIds.length > 0) {
            await this.dispatchSyncEvent(question_interface_1.QuestionSyncAction.UPDATE, movedQuestionIds);
        }
        return result;
    }
    async dispatchAutoTagJob(teacherId, payload) {
        const validCount = await this.questionsRepository.countValidQuestions(payload.questionIds, teacherId);
        if (validCount !== payload.questionIds.length) {
            throw new common_1.ForbiddenException('Một hoặc nhiều câu hỏi không tồn tại, bị lưu trữ hoặc bạn không có quyền sở hữu.');
        }
        const teacher = await this.usersService.findById(teacherId);
        if (!teacher || !teacher.subjectIds || teacher.subjectIds.length === 0) {
            throw new common_1.BadRequestException('Tài khoản của bạn chưa được phân công giảng dạy bộ môn nào. Vui lòng liên hệ Admin.');
        }
        const firstSubject = teacher.subjectIds[0];
        const targetSubjectId = firstSubject._id
            ? firstSubject._id.toString()
            : firstSubject.toString();
        if (!mongoose_1.Types.ObjectId.isValid(targetSubjectId)) {
            throw new common_1.BadRequestException(`Lỗi dữ liệu hệ thống: Mã môn học không hợp lệ (${targetSubjectId}).`);
        }
        const jobPayload = {
            teacherId,
            questionIds: payload.questionIds,
            subjectId: targetSubjectId,
        };
        await this.questionTasksQueue.add('process-auto-tag', jobPayload, {
            removeOnComplete: true,
            removeOnFail: false,
            attempts: 3,
            backoff: { type: 'exponential', delay: 5000 },
        });
        this.logger.log(`[Queue] Đã dispatch Job AI Auto-Tag cho ${payload.questionIds.length} câu hỏi (Teacher: ${teacherId})`);
        return {
            message: 'Yêu cầu AI phân tích thuộc tính đã được đưa vào hệ thống xử lý ngầm. Vui lòng kiểm tra lại sau ít phút.',
            jobDispatched: true,
        };
    }
    buildPrunedTree(nodes) {
        const map = new Map();
        const roots = [];
        nodes.forEach((node) => {
            map.set(node._id.toString(), {
                id: node._id.toString(),
                name: node.name,
                children: [],
            });
        });
        nodes.forEach((node) => {
            const current = map.get(node._id.toString());
            if (node.parentId) {
                const parent = map.get(node.parentId.toString());
                if (parent) {
                    parent.children.push(current);
                }
                else {
                    roots.push(current);
                }
            }
            else {
                roots.push(current);
            }
        });
        return roots;
    }
    async getActiveFilters(ownerId, payload) {
        const expandedPayload = {
            ...payload,
            folderIds: await this.expandHierarchyIds(this.foldersRepo, payload.folderIds),
            topicIds: await this.expandHierarchyIds(this.topicsRepo, payload.topicIds),
        };
        const rawMetadata = await this.questionsRepository.getActiveFiltersMetadata(ownerId, expandedPayload);
        let finalFoldersTree = [];
        if (rawMetadata.folderIds.length > 0) {
            const leafObjIds = rawMetadata.folderIds.map((id) => new mongoose_1.Types.ObjectId(id));
            const leafNodes = await this.foldersRepo.modelInstance
                .find({ _id: { $in: leafObjIds } })
                .select('ancestors')
                .lean()
                .exec();
            const allRequiredIds = new Set(rawMetadata.folderIds);
            leafNodes.forEach((node) => {
                node.ancestors?.forEach((a) => allRequiredIds.add(a.toString()));
            });
            const allNodes = await this.foldersRepo.modelInstance
                .find({
                _id: {
                    $in: Array.from(allRequiredIds).map((id) => new mongoose_1.Types.ObjectId(id)),
                },
            })
                .select('_id name parentId')
                .lean()
                .exec();
            finalFoldersTree = this.buildPrunedTree(allNodes);
        }
        let finalTopicsTree = [];
        if (rawMetadata.topicIds.length > 0) {
            const leafObjIds = rawMetadata.topicIds.map((id) => new mongoose_1.Types.ObjectId(id));
            const leafNodes = await this.topicsRepo.modelInstance
                .find({ _id: { $in: leafObjIds } })
                .select('ancestors')
                .lean()
                .exec();
            const allRequiredIds = new Set(rawMetadata.topicIds);
            leafNodes.forEach((node) => {
                node.ancestors?.forEach((a) => allRequiredIds.add(a.toString()));
            });
            const allNodes = await this.topicsRepo.modelInstance
                .find({
                _id: {
                    $in: Array.from(allRequiredIds).map((id) => new mongoose_1.Types.ObjectId(id)),
                },
            })
                .select('_id name parentId')
                .lean()
                .exec();
            finalTopicsTree = this.buildPrunedTree(allNodes);
        }
        return {
            folders: finalFoldersTree,
            topics: finalTopicsTree,
            difficulties: rawMetadata.difficulties,
            tags: rawMetadata.tags,
        };
    }
    async bulkPublishQuestions(ownerId, payload) {
        const { questionIds } = payload;
        const uniqueIds = [...new Set(questionIds)];
        const objectIds = uniqueIds.map((id) => new mongoose_1.Types.ObjectId(id));
        const questions = await this.questionsRepository.model
            .find({ _id: { $in: objectIds }, ownerId: new mongoose_1.Types.ObjectId(ownerId) })
            .select('_id type topicId difficultyLevel parentPassageId isDraft')
            .lean()
            .exec();
        if (questions.length !== uniqueIds.length) {
            throw new common_1.BadRequestException('Một số câu hỏi không tồn tại, đã bị xóa hoặc bạn không có quyền sở hữu.');
        }
        const invalidRoots = questions.filter((q) => !q.parentPassageId &&
            (!q.topicId || q.difficultyLevel === question_schema_1.DifficultyLevel.UNKNOWN));
        if (invalidRoots.length > 0) {
            throw new common_1.BadRequestException(`Không thể xuất bản! Có ${invalidRoots.length} câu hỏi gốc chưa được gán Chuyên đề hoặc Mức độ nhận thức. Vui lòng chuẩn hóa trước khi xuất bản.`);
        }
        return this.questionsRepository.executeInTransaction(async () => {
            const questionModel = this.questionsRepository.model;
            const session = this.questionsRepository.currentSession;
            const updateResult = await questionModel.updateMany({ _id: { $in: objectIds } }, { $set: { isDraft: false } }, { session });
            const passageIds = questions
                .filter((q) => q.type === question_schema_1.QuestionType.PASSAGE)
                .map((q) => q._id);
            let childrenUpdated = 0;
            if (passageIds.length > 0) {
                const childUpdateRes = await questionModel.updateMany({ parentPassageId: { $in: passageIds } }, { $set: { isDraft: false } }, { session });
                childrenUpdated = childUpdateRes.modifiedCount;
            }
            this.logger.log(`[Bulk Publish] User ${ownerId} published ${updateResult.modifiedCount} questions and ${childrenUpdated} sub-questions.`);
            return {
                message: `Đã xuất bản thành công ${updateResult.modifiedCount} câu hỏi.`,
                publishedCount: updateResult.modifiedCount + childrenUpdated,
            };
        });
    }
    async getActiveFiltersForQuizBuilder(ownerId, payload) {
        const expandedPayload = {
            ...payload,
            folderIds: await this.expandHierarchyIds(this.foldersRepo, payload.folderIds),
            topicIds: await this.expandHierarchyIds(this.topicsRepo, payload.topicIds),
        };
        const rawMetadata = await this.questionsRepository.getPublishedActiveFiltersMetadata(ownerId, expandedPayload);
        let finalFoldersTree = [];
        if (rawMetadata.folderIds.length > 0) {
            const leafObjIds = rawMetadata.folderIds.map((id) => new mongoose_1.Types.ObjectId(id));
            const leafNodes = await this.foldersRepo.modelInstance
                .find({ _id: { $in: leafObjIds } })
                .select('ancestors')
                .lean()
                .exec();
            const allRequiredIds = new Set(rawMetadata.folderIds);
            leafNodes.forEach((node) => {
                node.ancestors?.forEach((a) => allRequiredIds.add(a.toString()));
            });
            const allNodes = await this.foldersRepo.modelInstance
                .find({
                _id: {
                    $in: Array.from(allRequiredIds).map((id) => new mongoose_1.Types.ObjectId(id)),
                },
            })
                .select('_id name parentId')
                .lean()
                .exec();
            finalFoldersTree = this.buildPrunedTree(allNodes);
        }
        let finalTopicsTree = [];
        if (rawMetadata.topicIds.length > 0) {
            const leafObjIds = rawMetadata.topicIds.map((id) => new mongoose_1.Types.ObjectId(id));
            const leafNodes = await this.topicsRepo.modelInstance
                .find({ _id: { $in: leafObjIds } })
                .select('ancestors')
                .lean()
                .exec();
            const allRequiredIds = new Set(rawMetadata.topicIds);
            leafNodes.forEach((node) => {
                node.ancestors?.forEach((a) => allRequiredIds.add(a.toString()));
            });
            const allNodes = await this.topicsRepo.modelInstance
                .find({
                _id: {
                    $in: Array.from(allRequiredIds).map((id) => new mongoose_1.Types.ObjectId(id)),
                },
            })
                .select('_id name parentId')
                .lean()
                .exec();
            finalTopicsTree = this.buildPrunedTree(allNodes);
        }
        return {
            folders: finalFoldersTree,
            topics: finalTopicsTree,
            difficulties: rawMetadata.difficulties,
            tags: rawMetadata.tags,
        };
    }
};
exports.QuestionsService = QuestionsService;
exports.QuestionsService = QuestionsService = QuestionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(5, (0, bullmq_1.InjectQueue)('question-sync')),
    __param(6, (0, bullmq_1.InjectQueue)(question_jobs_interface_1.QUESTION_TASKS_QUEUE)),
    __metadata("design:paramtypes", [questions_repository_1.QuestionsRepository,
        knowledge_topics_repository_1.KnowledgeTopicsRepository,
        users_service_1.UsersService,
        question_folders_repository_1.QuestionFoldersRepository,
        media_repository_1.MediaRepository,
        bullmq_2.Queue,
        bullmq_2.Queue,
        question_organizer_engine_1.QuestionOrganizerEngine])
], QuestionsService);
//# sourceMappingURL=questions.service.js.map