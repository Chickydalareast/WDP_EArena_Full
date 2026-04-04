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
var ExamsRepository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamsRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const abstract_repository_1 = require("../../common/database/abstract.repository");
const exam_schema_1 = require("./schemas/exam.schema");
let ExamsRepository = ExamsRepository_1 = class ExamsRepository extends abstract_repository_1.AbstractRepository {
    logger = new common_1.Logger(ExamsRepository_1.name);
    constructor(model, connection) {
        super(model, connection);
    }
    async getExamsWithPagination(teacherId, page, limit, search, type, subjectId) {
        const skip = (page - 1) * limit;
        const matchStage = { teacherId: new mongoose_2.Types.ObjectId(teacherId) };
        if (search)
            matchStage.title = { $regex: search, $options: 'i' };
        if (type) {
            matchStage.type = type;
        }
        else {
            matchStage.type = { $ne: exam_schema_1.ExamType.COURSE_QUIZ };
        }
        if (subjectId)
            matchStage.subjectId = new mongoose_2.Types.ObjectId(subjectId);
        const [result] = await this.model.aggregate([
            { $match: matchStage },
            { $sort: { createdAt: -1 } },
            {
                $lookup: {
                    from: 'exam_papers',
                    localField: '_id',
                    foreignField: 'examId',
                    as: 'papers',
                },
            },
            {
                $addFields: {
                    defaultPaperId: {
                        $ifNull: [
                            { $toString: { $arrayElemAt: ['$papers._id', 0] } },
                            null,
                        ],
                    },
                },
            },
            {
                $facet: {
                    metadata: [{ $count: 'total' }],
                    data: [
                        { $skip: skip },
                        { $limit: limit },
                        { $project: { __v: 0, updatedAt: 0, papers: 0 } },
                    ],
                },
            },
        ]);
        return {
            items: result.data || [],
            total: result.metadata[0]?.total || 0,
        };
    }
};
exports.ExamsRepository = ExamsRepository;
exports.ExamsRepository = ExamsRepository = ExamsRepository_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(exam_schema_1.Exam.name)),
    __param(1, (0, mongoose_1.InjectConnection)()),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Connection])
], ExamsRepository);
//# sourceMappingURL=exams.repository.js.map