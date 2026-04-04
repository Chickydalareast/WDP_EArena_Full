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
var ExamPapersRepository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamPapersRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const abstract_repository_1 = require("../../common/database/abstract.repository");
const exam_paper_schema_1 = require("./schemas/exam-paper.schema");
let ExamPapersRepository = ExamPapersRepository_1 = class ExamPapersRepository extends abstract_repository_1.AbstractRepository {
    logger = new common_1.Logger(ExamPapersRepository_1.name);
    constructor(model, connection) {
        super(model, connection);
    }
    async findPaperDetailWithRelations(paperId) {
        return this.model
            .findById(new mongoose_2.Types.ObjectId(paperId.toString()))
            .populate({
            path: 'questions.attachedMedia',
            select: 'url mimetype provider originalName _id',
        })
            .lean()
            .exec();
    }
    async addQuestionsToPaper(paperId, questionsToAdd, answerKeysToAdd) {
        const updatePayload = {
            $push: {
                questions: { $each: questionsToAdd },
                answerKeys: { $each: answerKeysToAdd },
            },
        };
        return this.updateByIdSafe(paperId, updatePayload);
    }
    async removeQuestionsFromPaper(paperId, questionIdsToRemove) {
        const updatePayload = {
            $pull: {
                questions: { originalQuestionId: { $in: questionIdsToRemove } },
                answerKeys: { originalQuestionId: { $in: questionIdsToRemove } },
            },
        };
        return this.updateByIdSafe(paperId, updatePayload);
    }
};
exports.ExamPapersRepository = ExamPapersRepository;
exports.ExamPapersRepository = ExamPapersRepository = ExamPapersRepository_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(exam_paper_schema_1.ExamPaper.name)),
    __param(1, (0, mongoose_1.InjectConnection)()),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Connection])
], ExamPapersRepository);
//# sourceMappingURL=exam-papers.repository.js.map