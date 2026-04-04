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
var ExamSubmissionsRepository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamSubmissionsRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const abstract_repository_1 = require("../../common/database/abstract.repository");
const exam_submission_schema_1 = require("./schemas/exam-submission.schema");
const redis_service_1 = require("../../common/redis/redis.service");
let ExamSubmissionsRepository = ExamSubmissionsRepository_1 = class ExamSubmissionsRepository extends abstract_repository_1.AbstractRepository {
    submissionModel;
    redisService;
    logger = new common_1.Logger(ExamSubmissionsRepository_1.name);
    constructor(submissionModel, connection, redisService) {
        super(submissionModel, connection);
        this.submissionModel = submissionModel;
        this.redisService = redisService;
    }
    async initSubmission(examId, examPaperId, studentId, questionIds) {
        const initialAnswers = questionIds.map(qId => ({ questionId: qId, selectedAnswerId: null }));
        return this.create({
            examId: new mongoose_2.Types.ObjectId(examId),
            examPaperId: new mongoose_2.Types.ObjectId(examPaperId),
            studentId: new mongoose_2.Types.ObjectId(studentId),
            answers: initialAnswers,
            status: exam_submission_schema_1.SubmissionStatus.IN_PROGRESS,
            score: null,
            submittedAt: null,
        });
    }
    async atomicAutoSave(submissionId, questionId, selectedAnswerId) {
        const result = await this.submissionModel.updateOne({ _id: new mongoose_2.Types.ObjectId(submissionId), 'answers.questionId': new mongoose_2.Types.ObjectId(questionId), status: exam_submission_schema_1.SubmissionStatus.IN_PROGRESS }, { $set: { 'answers.$.selectedAnswerId': selectedAnswerId } });
        return result.modifiedCount > 0;
    }
    async saveDraftToRedis(submissionId, questionId, selectedAnswerId) {
        const redisKey = `exam:submission:${submissionId}`;
        await this.redisService.hset(redisKey, questionId, selectedAnswerId);
        await this.redisService.expire(redisKey, 10800);
    }
    async getDraftAnswersFromRedis(submissionId) {
        const redisKey = `exam:submission:${submissionId}`;
        return this.redisService.hgetall(redisKey);
    }
    async syncRedisToMongoOnSubmit(submissionId, studentId) {
        const redisKey = `exam:submission:${submissionId}`;
        const draftAnswers = await this.redisService.hgetall(redisKey);
        if (!draftAnswers || Object.keys(draftAnswers).length === 0)
            return this.markAsCompleted(submissionId, studentId);
        const bulkOps = [];
        for (const [qId, aId] of Object.entries(draftAnswers)) {
            bulkOps.push({
                updateOne: {
                    filter: { _id: new mongoose_2.Types.ObjectId(submissionId), studentId: new mongoose_2.Types.ObjectId(studentId), status: exam_submission_schema_1.SubmissionStatus.IN_PROGRESS, 'answers.questionId': new mongoose_2.Types.ObjectId(qId) },
                    update: { $set: { 'answers.$.selectedAnswerId': aId } }
                }
            });
        }
        if (bulkOps.length > 0)
            await this.submissionModel.bulkWrite(bulkOps, { ordered: false });
        const success = await this.markAsCompleted(submissionId, studentId);
        if (success)
            await this.redisService.del(redisKey);
        return success;
    }
    async markAsCompleted(submissionId, studentId) {
        const result = await this.submissionModel.updateOne({ _id: new mongoose_2.Types.ObjectId(submissionId), studentId: new mongoose_2.Types.ObjectId(studentId), status: exam_submission_schema_1.SubmissionStatus.IN_PROGRESS }, { $set: { status: exam_submission_schema_1.SubmissionStatus.COMPLETED, submittedAt: new Date() } });
        return result.modifiedCount > 0;
    }
    async getLeaderboardData(courseId, lessonId, page, limit, search) {
        const skip = (page - 1) * limit;
        const pipeline = [
            { $match: { courseId: new mongoose_2.Types.ObjectId(courseId), lessonId: new mongoose_2.Types.ObjectId(lessonId), status: exam_submission_schema_1.SubmissionStatus.COMPLETED } },
            { $sort: { score: -1, submittedAt: 1 } },
            { $group: { _id: '$studentId', bestScore: { $first: '$score' }, submissionId: { $first: '$_id' }, submittedAt: { $first: '$submittedAt' }, attemptNumber: { $first: '$attemptNumber' } } },
            { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'studentInfo' } },
            { $unwind: '$studentInfo' }
        ];
        if (search)
            pipeline.push({ $match: { $or: [{ 'studentInfo.fullName': { $regex: search, $options: 'i' } }, { 'studentInfo.email': { $regex: search, $options: 'i' } }] } });
        pipeline.push({ $sort: { bestScore: -1, submittedAt: 1 } }, { $facet: { metadata: [{ $count: 'total' }], data: [{ $skip: skip }, { $limit: limit }, { $project: { _id: 0, studentId: '$_id', fullName: '$studentInfo.fullName', email: '$studentInfo.email', avatar: '$studentInfo.avatar', bestScore: 1, submissionId: 1, submittedAt: 1, attemptNumber: 1 } }] } });
        const [result] = await this.submissionModel.aggregate(pipeline);
        return { items: result?.data || [], total: result?.metadata[0]?.total || 0 };
    }
    async findLatestSubmission(studentId, lessonId) {
        return this.submissionModel.findOne({ studentId: new mongoose_2.Types.ObjectId(studentId), lessonId: new mongoose_2.Types.ObjectId(lessonId) })
            .sort({ attemptNumber: -1 }).lean().exec();
    }
    async getStudentHistoryData(studentId, page, limit, courseId, lessonId) {
        const skip = (page - 1) * limit;
        const matchStage = { studentId: new mongoose_2.Types.ObjectId(studentId) };
        if (courseId)
            matchStage.courseId = new mongoose_2.Types.ObjectId(courseId);
        if (lessonId)
            matchStage.lessonId = new mongoose_2.Types.ObjectId(lessonId);
        const [result] = await this.submissionModel.aggregate([
            { $match: matchStage }, { $sort: { createdAt: -1 } },
            { $facet: { metadata: [{ $count: 'total' }], data: [{ $skip: skip }, { $limit: limit }, { $lookup: { from: 'courses', localField: 'courseId', foreignField: '_id', as: 'course' } }, { $lookup: { from: 'course_lessons', localField: 'lessonId', foreignField: '_id', as: 'lesson' } }, { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } }, { $unwind: { path: '$lesson', preserveNullAndEmptyArrays: true } }, { $project: { answers: 0, __v: 0 } }] } }
        ]);
        const total = result.metadata[0]?.total || 0;
        return { data: result.data || [], meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }
    async getStudentHistoryOverviewData(studentId, page, limit, courseId) {
        const skip = (page - 1) * limit;
        const matchStage = { studentId: new mongoose_2.Types.ObjectId(studentId) };
        if (courseId)
            matchStage.courseId = new mongoose_2.Types.ObjectId(courseId);
        const pipeline = [
            { $match: matchStage },
            { $group: { _id: '$lessonId', courseId: { $first: '$courseId' }, attemptsUsed: { $max: '$attemptNumber' }, bestScore: { $max: '$score' }, latestSubmittedAt: { $max: '$submittedAt' } } },
            { $lookup: { from: 'course_lessons', localField: '_id', foreignField: '_id', as: 'lesson' } },
            { $unwind: { path: '$lesson', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'courses', localField: 'courseId', foreignField: '_id', as: 'course' } },
            { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
            { $sort: { latestSubmittedAt: -1 } },
            { $facet: { metadata: [{ $count: 'total' }], data: [{ $skip: skip }, { $limit: limit }, { $project: { _id: 0, lessonId: '$_id', lessonTitle: '$lesson.title', courseId: 1, courseTitle: '$course.title', attemptsUsed: 1, bestScore: 1, latestSubmittedAt: 1, maxAttempts: { $ifNull: ['$lesson.examRules.maxAttempts', 1] }, passPercentage: { $ifNull: ['$lesson.examRules.passPercentage', 50] } } }] } }
        ];
        const [result] = await this.submissionModel.aggregate(pipeline);
        const total = result?.metadata[0]?.total || 0;
        return { data: result?.data || [], meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }
    async getLessonAttemptsData(studentId, lessonId, page, limit) {
        const skip = (page - 1) * limit;
        const pipeline = [
            { $match: { studentId: new mongoose_2.Types.ObjectId(studentId), lessonId: new mongoose_2.Types.ObjectId(lessonId) } },
            { $sort: { attemptNumber: -1 } },
            { $facet: { metadata: [{ $count: 'total' }], data: [{ $skip: skip }, { $limit: limit }, { $project: { answers: 0, __v: 0 } }] } }
        ];
        const [result] = await this.submissionModel.aggregate(pipeline);
        const total = result?.metadata[0]?.total || 0;
        return { data: result?.data || [], meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }
    async getTeacherAttemptHistoryData(courseId, lessonId, page, limit, search) {
        const skip = (page - 1) * limit;
        const matchStage = {
            courseId: new mongoose_2.Types.ObjectId(courseId),
            lessonId: new mongoose_2.Types.ObjectId(lessonId)
        };
        const pipeline = [
            { $match: matchStage },
            {
                $group: {
                    _id: '$studentId',
                    bestScore: { $max: '$score' },
                    attemptsUsed: { $max: '$attemptNumber' },
                    latestStatus: { $last: '$status' },
                    latestSubmittedAt: { $max: '$submittedAt' }
                }
            },
            { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'studentInfo' } },
            { $unwind: '$studentInfo' }
        ];
        if (search) {
            pipeline.push({
                $match: {
                    $or: [
                        { 'studentInfo.fullName': { $regex: search, $options: 'i' } },
                        { 'studentInfo.email': { $regex: search, $options: 'i' } }
                    ]
                }
            });
        }
        pipeline.push({ $sort: { bestScore: -1, latestSubmittedAt: -1 } }, {
            $facet: {
                metadata: [{ $count: 'total' }],
                data: [
                    { $skip: skip }, { $limit: limit },
                    {
                        $project: {
                            _id: 0, studentId: '$_id', fullName: '$studentInfo.fullName', email: '$studentInfo.email',
                            bestScore: 1, attemptsUsed: 1, latestStatus: 1, latestSubmittedAt: 1
                        }
                    }
                ]
            }
        });
        const [result] = await this.submissionModel.aggregate(pipeline);
        const total = result?.metadata[0]?.total || 0;
        return { data: result?.data || [], meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }
    async getQuizAnalyticsData(lessonId, passPercentage, totalScore) {
        const lessonObjId = new mongoose_2.Types.ObjectId(lessonId);
        let boundaries = [0, 0.01];
        if (totalScore > 0) {
            const step = totalScore / 10;
            boundaries = Array.from({ length: 11 }, (_, i) => parseFloat((i * step).toFixed(2)));
            boundaries[10] = boundaries[10] + 0.01;
        }
        const pipeline = [
            { $match: { lessonId: lessonObjId, status: exam_submission_schema_1.SubmissionStatus.COMPLETED } },
            {
                $facet: {
                    summary: [
                        {
                            $group: {
                                _id: null,
                                totalCompletedSubmissions: { $sum: 1 },
                                averageScore: { $avg: "$score" },
                                passedCount: {
                                    $sum: {
                                        $cond: [
                                            { $gte: [{ $divide: ["$score", totalScore || 1] }, passPercentage / 100] },
                                            1, 0
                                        ]
                                    }
                                }
                            }
                        }
                    ],
                    scoreDistribution: [
                        {
                            $bucket: {
                                groupBy: "$score",
                                boundaries: boundaries,
                                default: "Out of Range",
                                output: { count: { $sum: 1 } }
                            }
                        }
                    ],
                    topWrongQuestions: [
                        { $unwind: "$answers" },
                        { $match: { "answers.isCorrect": false } },
                        { $group: { _id: "$answers.questionId", wrongCount: { $sum: 1 } } },
                        { $sort: { wrongCount: -1 } },
                        { $limit: 5 },
                        {
                            $lookup: {
                                from: 'questions',
                                localField: '_id',
                                foreignField: '_id',
                                as: 'questionDetails'
                            }
                        },
                        { $unwind: "$questionDetails" },
                        {
                            $project: {
                                _id: 0,
                                questionId: "$_id",
                                wrongCount: 1,
                                content: "$questionDetails.content",
                                type: "$questionDetails.type",
                            }
                        }
                    ]
                }
            }
        ];
        const [result] = await this.submissionModel.aggregate(pipeline);
        const summaryData = result.summary[0] || { totalCompletedSubmissions: 0, averageScore: 0, passedCount: 0 };
        const passRate = summaryData.totalCompletedSubmissions > 0
            ? parseFloat(((summaryData.passedCount / summaryData.totalCompletedSubmissions) * 100).toFixed(2))
            : 0;
        return {
            passRate,
            averageScore: parseFloat((summaryData.averageScore || 0).toFixed(2)),
            totalCompletedSubmissions: summaryData.totalCompletedSubmissions,
            scoreDistribution: result.scoreDistribution,
            topWrongQuestions: result.topWrongQuestions,
        };
    }
};
exports.ExamSubmissionsRepository = ExamSubmissionsRepository;
exports.ExamSubmissionsRepository = ExamSubmissionsRepository = ExamSubmissionsRepository_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(exam_submission_schema_1.ExamSubmission.name)),
    __param(1, (0, mongoose_1.InjectConnection)()),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Connection,
        redis_service_1.RedisService])
], ExamSubmissionsRepository);
//# sourceMappingURL=exam-submissions.repository.js.map