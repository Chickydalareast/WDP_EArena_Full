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
var ExamGeneratorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamGeneratorService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const questions_repository_1 = require("../questions/questions.repository");
const exams_repository_1 = require("./exams.repository");
const exam_papers_repository_1 = require("./exam-papers.repository");
const exam_matrices_service_1 = require("./exam-matrices.service");
const question_folders_repository_1 = require("../questions/question-folders.repository");
const knowledge_topics_repository_1 = require("../taxonomy/knowledge-topics.repository");
const redis_service_1 = require("../../common/redis/redis.service");
const exam_schema_1 = require("./schemas/exam.schema");
const question_schema_1 = require("../questions/schemas/question.schema");
let ExamGeneratorService = ExamGeneratorService_1 = class ExamGeneratorService {
    questionsRepo;
    examsRepo;
    examPapersRepo;
    matricesService;
    foldersRepo;
    topicsRepo;
    redisService;
    logger = new common_1.Logger(ExamGeneratorService_1.name);
    constructor(questionsRepo, examsRepo, examPapersRepo, matricesService, foldersRepo, topicsRepo, redisService) {
        this.questionsRepo = questionsRepo;
        this.examsRepo = examsRepo;
        this.examPapersRepo = examPapersRepo;
        this.matricesService = matricesService;
        this.foldersRepo = foldersRepo;
        this.topicsRepo = topicsRepo;
        this.redisService = redisService;
    }
    async expandHierarchyIds(repo, collectionPrefix, inputIds) {
        if (!inputIds || inputIds.length === 0)
            return [];
        const sortedIds = [...inputIds].sort();
        const cacheKey = `hierarchy:${collectionPrefix}:${sortedIds.join(',')}`;
        const HIERARCHY_CACHE_TTL_SECONDS = 60;
        const cached = await this.redisService.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }
        const objIds = sortedIds.map((id) => new mongoose_1.Types.ObjectId(id));
        const childNodes = await repo.modelInstance
            .find({ ancestors: { $in: objIds } })
            .select('_id')
            .lean()
            .exec();
        const expanded = [
            ...new Set([
                ...sortedIds,
                ...childNodes.map((n) => n._id.toString()),
            ]),
        ];
        await this.redisService.set(cacheKey, JSON.stringify(expanded), HIERARCHY_CACHE_TTL_SECONDS);
        return expanded;
    }
    shuffleArray(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
    mapQuestionToPaper(rawQ, parentPassageId, questionsArray, keysArray, orderIdx) {
        const isPassageMother = rawQ.type === question_schema_1.QuestionType.PASSAGE;
        let answers = [];
        if (!isPassageMother) {
            const correctAnswer = rawQ.answers?.find((a) => a.isCorrect);
            if (!correctAnswer)
                throw new common_1.InternalServerErrorException(`Câu hỏi gốc ID ${rawQ._id} bị lỗi dữ liệu (không set đáp án đúng).`);
            answers = this.shuffleArray(rawQ.answers).map((opt) => ({
                id: opt.id,
                content: opt.content,
            }));
            keysArray.push({
                originalQuestionId: rawQ._id,
                correctAnswerId: correctAnswer.id,
            });
        }
        questionsArray.push({
            originalQuestionId: rawQ._id,
            type: rawQ.type,
            parentPassageId: parentPassageId,
            orderIndex: orderIdx,
            explanation: rawQ.explanation || null,
            content: rawQ.content,
            difficultyLevel: rawQ.difficultyLevel,
            answers: answers,
            attachedMedia: rawQ.attachedMedia || [],
            points: null,
        });
    }
    async buildQuestionsFromSections(teacherObjId, sectionsToProcess, initialExcludeIds, startOrderIndex) {
        const pickedQuestionIds = new Set(initialExcludeIds);
        const finalPaperQuestions = [];
        const finalAnswerKeys = [];
        let globalOrderIndex = startOrderIndex;
        for (const section of sectionsToProcess) {
            const excludeObjIdsSnapshot = Array.from(pickedQuestionIds).map((id) => new mongoose_1.Types.ObjectId(id));
            const ruleCandidates = await Promise.all(section.rules.map(async (rule) => {
                const [expandedFolderIds, expandedTopicIds] = await Promise.all([
                    this.expandHierarchyIds(this.foldersRepo, 'folder', rule.folderIds),
                    this.expandHierarchyIds(this.topicsRepo, 'topic', rule.topicIds),
                ]);
                const mappedRule = {
                    folderIds: expandedFolderIds.map((id) => new mongoose_1.Types.ObjectId(id)),
                    topicIds: expandedTopicIds.map((id) => new mongoose_1.Types.ObjectId(id)),
                    difficulties: rule.difficulties || [],
                    tags: rule.tags || [],
                    limit: rule.limit,
                };
                const candidates = await this.questionsRepo.getCandidatePoolForRule(teacherObjId, mappedRule, excludeObjIdsSnapshot, 3);
                return { rule, candidates };
            }));
            for (const { rule, candidates } of ruleCandidates) {
                let currentSlotFilled = 0;
                const targetLimit = rule.limit;
                for (const passage of candidates.passages) {
                    const childCount = passage.children.length;
                    if (currentSlotFilled < targetLimit) {
                        this.mapQuestionToPaper(passage, null, finalPaperQuestions, finalAnswerKeys, globalOrderIndex++);
                        pickedQuestionIds.add(passage._id.toString());
                        for (const child of passage.children) {
                            this.mapQuestionToPaper(child, passage._id, finalPaperQuestions, finalAnswerKeys, globalOrderIndex++);
                            pickedQuestionIds.add(child._id.toString());
                        }
                        currentSlotFilled += childCount;
                    }
                    if (currentSlotFilled >= targetLimit)
                        break;
                }
                if (currentSlotFilled < targetLimit) {
                    for (const flat of candidates.flats) {
                        if (currentSlotFilled < targetLimit) {
                            this.mapQuestionToPaper(flat, null, finalPaperQuestions, finalAnswerKeys, globalOrderIndex++);
                            pickedQuestionIds.add(flat._id.toString());
                            currentSlotFilled++;
                        }
                        else {
                            break;
                        }
                    }
                }
                if (currentSlotFilled < targetLimit) {
                    throw new common_1.BadRequestException(`Ngân hàng không đủ dữ liệu. Yêu cầu tối thiểu ${targetLimit} câu nhưng chỉ tìm được ${currentSlotFilled} câu khả dụng (chưa trùng lặp) cho Section "${section.name}".`);
                }
            }
        }
        return { finalPaperQuestions, finalAnswerKeys };
    }
    async resolveSectionsToProcess(teacherId, matrixId, adHocSections) {
        const hasMatrix = !!matrixId;
        const hasAdHoc = Array.isArray(adHocSections) && adHocSections.length > 0;
        if (hasMatrix && hasAdHoc) {
            throw new common_1.BadRequestException('Cấu hình nguồn đề không hợp lệ: không được cung cấp cả "matrixId" lẫn "adHocSections" cùng lúc.');
        }
        let sectionsToProcess = (adHocSections || []).map((sec) => ({
            ...sec,
            orderIndex: sec.orderIndex ?? 0,
        }));
        let subjectId = null;
        if (matrixId) {
            const template = await this.matricesService.getMatrixDetail(matrixId, teacherId);
            sectionsToProcess = template.sections.map((sec) => ({
                name: sec.name,
                orderIndex: sec.orderIndex,
                rules: sec.rules.map((rule) => ({
                    folderIds: rule.folderIds?.map((id) => id.toString()) || [],
                    topicIds: rule.topicIds?.map((id) => id.toString()) || [],
                    difficulties: rule.difficulties || [],
                    tags: rule.tags || [],
                    limit: rule.limit,
                })),
            }));
            subjectId = template.subjectId;
        }
        if (!sectionsToProcess.length) {
            throw new common_1.BadRequestException('Không có dữ liệu Ma trận để xử lý.');
        }
        return { sectionsToProcess, subjectId };
    }
    async previewDynamicExam(payload) {
        const { teacherId, matrixId, adHocSections } = payload;
        const teacherObjId = new mongoose_1.Types.ObjectId(teacherId);
        const { sectionsToProcess } = await this.resolveSectionsToProcess(teacherId, matrixId, adHocSections);
        const { finalPaperQuestions, finalAnswerKeys } = await this.buildQuestionsFromSections(teacherObjId, sectionsToProcess, new Set(), 1);
        this.logger.log(`[Dry-Run Preview] Teacher ${teacherId} generated a preview. Questions: ${finalPaperQuestions.length}`);
        return {
            message: 'Tạo bản xem trước thành công (Dry-Run). Dữ liệu chưa được lưu.',
            totalItems: finalPaperQuestions.length,
            totalActualQuestions: finalAnswerKeys.length,
            previewData: {
                questions: finalPaperQuestions,
                answerKeys: finalAnswerKeys,
            },
        };
    }
    async generateDynamicExam(payload) {
        const { teacherId, title, totalScore, matrixId, adHocSections } = payload;
        const teacherObjId = new mongoose_1.Types.ObjectId(teacherId);
        const { sectionsToProcess, subjectId } = await this.resolveSectionsToProcess(teacherId, matrixId, adHocSections);
        const { finalPaperQuestions, finalAnswerKeys } = await this.buildQuestionsFromSections(teacherObjId, sectionsToProcess, new Set(), 1);
        if (totalScore > 0 && finalAnswerKeys.length > 0) {
            const scorePerQuestion = Number((totalScore / finalAnswerKeys.length).toFixed(2));
            finalPaperQuestions.forEach((q) => {
                if (q.type !== question_schema_1.QuestionType.PASSAGE)
                    q.points = scorePerQuestion;
            });
        }
        return this.examsRepo.executeInTransaction(async () => {
            const exam = await this.examsRepo.createDocument({
                title,
                description: `Sinh từ động cơ Ma trận. ${matrixId ? `Template ID: ${matrixId}` : 'Ad-hoc Matrix'}.`,
                teacherId: teacherObjId,
                subjectId: subjectId || new mongoose_1.Types.ObjectId(),
                totalScore,
                type: exam_schema_1.ExamType.PRACTICE,
                mode: exam_schema_1.ExamMode.DYNAMIC,
                isPublished: false,
            });
            const examPaper = await this.examPapersRepo.createDocument({
                examId: exam._id,
                questions: finalPaperQuestions,
                answerKeys: finalAnswerKeys,
            });
            return {
                message: 'Sinh đề thi mới bằng Rule Engine thành công',
                examId: exam._id,
                paperId: examPaper._id,
                totalItems: finalPaperQuestions.length,
                totalActualQuestions: finalAnswerKeys.length,
            };
        });
    }
    async fillExistingPaperFromMatrix(payload) {
        const { teacherId, paperId, matrixId, adHocSections } = payload;
        const paperObjId = new mongoose_1.Types.ObjectId(paperId);
        const teacherObjId = new mongoose_1.Types.ObjectId(teacherId);
        const paper = (await this.examPapersRepo.modelInstance
            .findById(paperObjId)
            .populate('examId', 'teacherId isPublished')
            .lean()
            .exec());
        if (!paper)
            throw new common_1.NotFoundException('Mã đề không tồn tại.');
        if (paper.examId.teacherId.toString() !== teacherId)
            throw new common_1.ForbiddenException('Bạn không có quyền sửa đề thi này.');
        if (paper.examId.isPublished)
            throw new common_1.BadRequestException('Đề thi đã khóa (Published). Không thể đắp thêm câu hỏi.');
        const { sectionsToProcess } = await this.resolveSectionsToProcess(teacherId, matrixId, adHocSections);
        const existingExcludeIds = new Set();
        let maxOrderIndex = 0;
        for (const q of paper.questions) {
            existingExcludeIds.add(q.originalQuestionId.toString());
            if (q.orderIndex > maxOrderIndex) {
                maxOrderIndex = q.orderIndex;
            }
        }
        const startOrderIndex = maxOrderIndex + 1;
        const { finalPaperQuestions, finalAnswerKeys } = await this.buildQuestionsFromSections(teacherObjId, sectionsToProcess, existingExcludeIds, startOrderIndex);
        await this.examPapersRepo.updateByIdSafe(paperObjId, {
            $push: {
                questions: { $each: finalPaperQuestions },
                answerKeys: { $each: finalAnswerKeys },
            },
        });
        this.logger.log(`[Builder] Teacher ${teacherId} đắp thêm ${finalAnswerKeys.length} câu vào Paper ${paperId} bằng Matrix`);
        return {
            message: `Đã bốc thành công ${finalAnswerKeys.length} câu hỏi mới vào đề thi hiện tại.`,
            addedItems: finalPaperQuestions.length,
            addedActualQuestions: finalAnswerKeys.length,
        };
    }
    async previewRuleAvailability(payload) {
        const { teacherId, paperId, rule } = payload;
        const paperObjId = new mongoose_1.Types.ObjectId(paperId);
        const teacherObjId = new mongoose_1.Types.ObjectId(teacherId);
        const paper = (await this.examPapersRepo.modelInstance
            .findById(paperObjId)
            .populate('examId', 'teacherId isPublished')
            .select('questions examId')
            .lean()
            .exec());
        if (!paper)
            throw new common_1.NotFoundException('Mã đề không tồn tại.');
        if (paper.examId.teacherId.toString() !== teacherId) {
            throw new common_1.ForbiddenException('Bạn không có quyền thao tác trên đề thi này.');
        }
        if (paper.examId.isPublished) {
            throw new common_1.BadRequestException('Đề thi đã khóa (Published). Không thể thay đổi rule.');
        }
        const excludeIds = paper.questions.map((q) => q.originalQuestionId);
        const [expandedFolderIds, expandedTopicIds] = await Promise.all([
            this.expandHierarchyIds(this.foldersRepo, 'folder', rule.folderIds),
            this.expandHierarchyIds(this.topicsRepo, 'topic', rule.topicIds),
        ]);
        const mappedRule = {
            folderIds: expandedFolderIds.map((id) => new mongoose_1.Types.ObjectId(id)),
            topicIds: expandedTopicIds.map((id) => new mongoose_1.Types.ObjectId(id)),
            difficulties: rule.difficulties || [],
            tags: rule.tags || [],
        };
        const availableCount = await this.questionsRepo.countAvailableQuestionsForRule(teacherObjId, mappedRule, excludeIds);
        return {
            message: 'Lấy số lượng câu hỏi khả dụng thành công.',
            availableQuestionsCount: availableCount,
        };
    }
    async generateJitPaperFromMatrix(teacherId, totalScore, matrixId, adHocSections) {
        const { sectionsToProcess } = await this.resolveSectionsToProcess(teacherId, matrixId, adHocSections);
        const { finalPaperQuestions, finalAnswerKeys } = await this.buildQuestionsFromSections(new mongoose_1.Types.ObjectId(teacherId), sectionsToProcess, new Set(), 1);
        if (totalScore > 0 && finalAnswerKeys.length > 0) {
            const scorePerQuestion = Number((totalScore / finalAnswerKeys.length).toFixed(2));
            finalPaperQuestions.forEach((q) => {
                if (q.type !== question_schema_1.QuestionType.PASSAGE)
                    q.points = scorePerQuestion;
            });
        }
        return {
            questions: finalPaperQuestions,
            answerKeys: finalAnswerKeys,
        };
    }
    async countAvailableForRule(teacherId, rule) {
        const teacherObjId = new mongoose_1.Types.ObjectId(teacherId);
        const [expandedFolderIds, expandedTopicIds] = await Promise.all([
            this.expandHierarchyIds(this.foldersRepo, 'folder', rule.folderIds),
            this.expandHierarchyIds(this.topicsRepo, 'topic', rule.topicIds),
        ]);
        const mappedRule = {
            folderIds: expandedFolderIds.map((id) => new mongoose_1.Types.ObjectId(id)),
            topicIds: expandedTopicIds.map((id) => new mongoose_1.Types.ObjectId(id)),
            difficulties: rule.difficulties || [],
            tags: rule.tags || [],
            limit: rule.limit,
        };
        return this.questionsRepo.countAvailableQuestionsForRule(teacherObjId, mappedRule, []);
    }
};
exports.ExamGeneratorService = ExamGeneratorService;
exports.ExamGeneratorService = ExamGeneratorService = ExamGeneratorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [questions_repository_1.QuestionsRepository,
        exams_repository_1.ExamsRepository,
        exam_papers_repository_1.ExamPapersRepository,
        exam_matrices_service_1.ExamMatricesService,
        question_folders_repository_1.QuestionFoldersRepository,
        knowledge_topics_repository_1.KnowledgeTopicsRepository,
        redis_service_1.RedisService])
], ExamGeneratorService);
//# sourceMappingURL=exam-generator.service.js.map