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
var QuestionTasksProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionTasksProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const config_1 = require("@nestjs/config");
const event_emitter_1 = require("@nestjs/event-emitter");
const question_jobs_interface_1 = require("../interfaces/question-jobs.interface");
const questions_repository_1 = require("../questions.repository");
const ai_service_1 = require("../../ai/ai.service");
const ai_provider_interface_1 = require("../../ai/interfaces/ai-provider.interface");
const knowledge_topics_service_1 = require("../../taxonomy/knowledge-topics.service");
const notification_event_constant_1 = require("../../notifications/constants/notification-event.constant");
let QuestionTasksProcessor = QuestionTasksProcessor_1 = class QuestionTasksProcessor extends bullmq_1.WorkerHost {
    questionsRepo;
    aiService;
    topicsService;
    configService;
    eventEmitter;
    logger = new common_1.Logger(QuestionTasksProcessor_1.name);
    CHUNK_SIZE = 10;
    constructor(questionsRepo, aiService, topicsService, configService, eventEmitter) {
        super();
        this.questionsRepo = questionsRepo;
        this.aiService = aiService;
        this.topicsService = topicsService;
        this.configService = configService;
        this.eventEmitter = eventEmitter;
    }
    async process(job) {
        switch (job.name) {
            case 'process-auto-tag':
                await this.handleAutoTagging(job);
                break;
            default:
                this.logger.warn(`[Worker] Bỏ qua job không xác định định tuyến: ${job.name}`);
        }
    }
    async handleAutoTagging(job) {
        const { teacherId, questionIds, subjectId } = job.data;
        this.logger.debug(`[Worker] Bắt đầu xử lý AI Tagging cho ${questionIds.length} câu hỏi. Subject: ${subjectId}`);
        try {
            const rawTopicTree = await this.topicsService.getTreeBySubject(subjectId);
            const { flatString: topicsDict, validTopicIds } = this.flattenTopicTree(rawTopicTree);
            const totalBatches = Math.ceil(questionIds.length / this.CHUNK_SIZE);
            for (let i = 0; i < questionIds.length; i += this.CHUNK_SIZE) {
                const chunkIds = questionIds.slice(i, i + this.CHUNK_SIZE);
                const batchNum = Math.floor(i / this.CHUNK_SIZE) + 1;
                await this.processChunk(chunkIds, topicsDict, validTopicIds, batchNum, teacherId, totalBatches);
                await job.updateProgress(Math.round(((i + chunkIds.length) / questionIds.length) * 100));
            }
            this.logger.log(` [Worker] Hoàn tất quá trình Auto-Tag cho ${questionIds.length} câu hỏi.`);
        }
        catch (error) {
            this.logger.error(` [Worker] Lỗi System Auto-Tag: ${error.message}`);
            throw error;
        }
    }
    async processChunk(chunkIds, topicsDict, validTopicIds, batchNum, teacherId, totalBatches) {
        this.logger.debug(`[Batch ${batchNum}] Đang lấy dữ liệu ${chunkIds.length} câu hỏi...`);
        const questions = await this.questionsRepo.modelInstance
            .find({
            _id: { $in: chunkIds.map((id) => new mongoose_1.Types.ObjectId(id)) },
        })
            .select('content answers type difficultyLevel topicId parentPassageId tags')
            .lean()
            .exec();
        if (!questions.length)
            return;
        const independentQuestions = questions.filter((q) => !q.parentPassageId);
        const missingParentIds = questions
            .filter((q) => q.parentPassageId &&
            !independentQuestions.some((ind) => ind._id.toString() === q.parentPassageId.toString()))
            .map((q) => q.parentPassageId);
        if (missingParentIds.length > 0) {
            const missingParents = await this.questionsRepo.modelInstance
                .find({
                _id: { $in: missingParentIds },
            })
                .select('content answers type difficultyLevel topicId parentPassageId tags')
                .lean()
                .exec();
            independentQuestions.push(...missingParents);
        }
        const simplifiedQuestions = independentQuestions.map((q) => ({
            id: q._id.toString(),
            type: q.type,
            content: q.content,
            answers: Array.isArray(q.answers) ? q.answers.map((a) => a.content) : [],
        }));
        const systemPrompt = this.buildTaggerPrompt(topicsDict);
        const userMessage = JSON.stringify(simplifiedQuestions, null, 2);
        const targetModel = this.configService.get('GROQ_TAGGING_MODEL') ||
            'llama-3.1-8b-instant';
        this.logger.debug(`[Batch ${batchNum}] Bắn request sang GROQ (Model: ${targetModel})...`);
        const aiResponse = await this.aiService.processTextRequest({
            providerName: ai_provider_interface_1.AiProviderName.GROQ,
            modelId: targetModel,
            systemPrompt: systemPrompt,
            userMessage: userMessage,
            temperature: 0.1,
            responseFormat: 'json_object',
        });
        const aiResult = this.extractJsonFromAiResponse(aiResponse.content);
        if (!aiResult || !aiResult.taggedQuestions)
            return;
        const validIndependentIds = independentQuestions.map((q) => q._id.toString());
        const validUpdates = this.sanitizeAiOutput(aiResult.taggedQuestions, validIndependentIds, validTopicIds);
        if (validUpdates.length > 0) {
            await this.questionsRepo.executeInTransaction(async () => {
                for (const updateData of validUpdates) {
                    const targetObjId = new mongoose_1.Types.ObjectId(updateData.id);
                    const updatePayload = {
                        $set: {
                            difficultyLevel: updateData.difficultyLevel,
                            tags: updateData.tags,
                            ...(updateData.topicId && {
                                topicId: new mongoose_1.Types.ObjectId(updateData.topicId),
                            }),
                        },
                    };
                    await this.questionsRepo.updateByIdSafe(targetObjId, updatePayload);
                    await this.questionsRepo.modelInstance
                        .updateMany({ parentPassageId: targetObjId }, {
                        $set: {
                            tags: updateData.tags,
                            ...(updateData.topicId && {
                                topicId: new mongoose_1.Types.ObjectId(updateData.topicId),
                            }),
                        },
                    }, { session: this.questionsRepo.currentSession })
                        .exec();
                }
            });
            this.logger.debug(`[Batch ${batchNum}] Đã lưu và Cascade thuộc tính Mẹ-Con thành công (An toàn ACID).`);
            this.eventEmitter.emit(notification_event_constant_1.NotificationEventPattern.QUESTION_AUTO_TAG_BATCH_COMPLETED, {
                teacherId,
                batchNum,
                totalBatches,
                processedQuestions: validUpdates,
            });
        }
    }
    sanitizeAiOutput(aiQuestions, chunkIds, validTopicIds) {
        const validUpdates = [];
        for (const item of aiQuestions) {
            if (!item.id || !chunkIds.includes(item.id))
                continue;
            const updatePayload = { id: item.id };
            if (item.topicId && validTopicIds.has(item.topicId)) {
                updatePayload.topicId = item.topicId;
            }
            const validDiffs = ['NB', 'TH', 'VD', 'VDC'];
            updatePayload.difficultyLevel = validDiffs.includes(item.difficultyLevel)
                ? item.difficultyLevel
                : 'UNKNOWN';
            updatePayload.tags = Array.isArray(item.tags)
                ? item.tags.filter((t) => typeof t === 'string').slice(0, 5)
                : [];
            validUpdates.push(updatePayload);
        }
        return validUpdates;
    }
    flattenTopicTree(tree, prefix = '') {
        let flatString = '';
        const validTopicIds = new Set();
        for (const node of tree) {
            const idStr = node._id.toString();
            validTopicIds.add(idStr);
            flatString += `- ID: "${idStr}" | Chuyên đề: ${prefix}${node.name}\n`;
            if (node.children && node.children.length > 0) {
                const childResult = this.flattenTopicTree(node.children, prefix + '-- ');
                flatString += childResult.flatString;
                for (const childId of childResult.validTopicIds) {
                    validTopicIds.add(childId);
                }
            }
        }
        return { flatString, validTopicIds };
    }
    extractJsonFromAiResponse(aiText) {
        try {
            const cleanText = aiText
                .replace(/```json/gi, '')
                .replace(/```/gi, '')
                .trim();
            return JSON.parse(cleanText);
        }
        catch (error) {
            this.logger.error(`[Worker JSON Lỗi]: AI trả về format hỏng.`);
            return null;
        }
    }
    buildTaggerPrompt(topicsDict) {
        return `
Bạn là một Robot xử lý dữ liệu JSON cứng nhắc. Không được phép trò chuyện. 
Nhiệm vụ của bạn: Đọc danh sách các câu hỏi, phân tích nội dung, và gán thuộc tính cho chúng.

⚠️ BỘ TỪ ĐIỂN CHUYÊN ĐỀ DUY NHẤT ĐƯỢC PHÉP DÙNG:
${topicsDict || '(Không có dữ liệu, hãy đặt topicId là null)'}

⚠️ QUY TẮC SINH TỒN (BẮT BUỘC TUÂN THỦ):
1. TRẢ VỀ DUY NHẤT một chuỗi JSON hợp lệ với gốc là đối tượng chứa mảng "taggedQuestions".
2. KHÔNG thay đổi "id" của câu hỏi gốc.
3. Trường "difficultyLevel" CHỈ ĐƯỢC CHỌN 1 trong 4 giá trị: "NB" (Nhận biết), "TH" (Thông hiểu), "VD" (Vận dụng), "VDC" (Vận dụng cao).
4. Trường "topicId" CHỈ ĐƯỢC COPY từ "BỘ TỪ ĐIỂN CHUYÊN ĐỀ" ở trên. NẾU KHÔNG TÌM THẤY chuyên đề phù hợp, BẮT BUỘC trả về null. KHÔNG ĐƯỢC TỰ BỊA ID.
5. Trường "tags" là mảng chứa tối đa 3 từ khóa quan trọng (viết liền không dấu hoặc có dấu).

💡 VÍ DỤ ĐẦU VÀO (User sẽ gửi):
[
  { "id": "65b...", "type": "MULTIPLE_CHOICE", "content": "1 cộng 1 bằng mấy?", "answers": ["1", "2"] }
]

💡 VÍ DỤ ĐẦU RA (Bạn phải trả lời ĐÚNG CẤU TRÚC NÀY):
{
  "taggedQuestions": [
    {
      "id": "65b...",
      "topicId": "60a...", 
      "difficultyLevel": "NB",
      "tags": ["toan_hoc", "co_ban"]
    }
  ]
}
`.trim();
    }
};
exports.QuestionTasksProcessor = QuestionTasksProcessor;
exports.QuestionTasksProcessor = QuestionTasksProcessor = QuestionTasksProcessor_1 = __decorate([
    (0, bullmq_1.Processor)(question_jobs_interface_1.QUESTION_TASKS_QUEUE),
    __metadata("design:paramtypes", [questions_repository_1.QuestionsRepository,
        ai_service_1.AiService,
        knowledge_topics_service_1.KnowledgeTopicsService,
        config_1.ConfigService,
        event_emitter_1.EventEmitter2])
], QuestionTasksProcessor);
//# sourceMappingURL=question-tasks.processor.js.map