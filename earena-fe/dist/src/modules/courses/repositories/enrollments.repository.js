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
var EnrollmentsRepository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrollmentsRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const abstract_repository_1 = require("../../../common/database/abstract.repository");
const enrollment_schema_1 = require("../schemas/enrollment.schema");
let EnrollmentsRepository = EnrollmentsRepository_1 = class EnrollmentsRepository extends abstract_repository_1.AbstractRepository {
    enrollmentModel;
    logger = new common_1.Logger(EnrollmentsRepository_1.name);
    constructor(enrollmentModel, connection) {
        super(enrollmentModel, connection);
        this.enrollmentModel = enrollmentModel;
    }
    async findUserEnrollment(userId, courseId) {
        return this.findOneSafe({
            userId: new mongoose_2.Types.ObjectId(userId.toString()),
            courseId: new mongoose_2.Types.ObjectId(courseId.toString()),
        });
    }
    async atomicUpdateProgress(enrollmentId, lessonId, newProgress) {
        return this.enrollmentModel
            .findByIdAndUpdate(enrollmentId, {
            $addToSet: { completedLessons: lessonId },
            $set: { progress: newProgress },
        }, { returnDocument: 'after', lean: true, session: this.currentSession })
            .exec();
    }
    async findMyCoursesPaginated(userId, page, limit) {
        const skip = (page - 1) * limit;
        const pipeline = [
            {
                $match: {
                    userId: new mongoose_2.Types.ObjectId(userId),
                    status: enrollment_schema_1.EnrollmentStatus.ACTIVE,
                },
            },
            { $sort: { updatedAt: -1 } },
            {
                $facet: {
                    data: [
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $lookup: {
                                from: 'courses',
                                localField: 'courseId',
                                foreignField: '_id',
                                as: 'course',
                            },
                        },
                        { $unwind: { path: '$course', preserveNullAndEmptyArrays: false } },
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'course.teacherId',
                                foreignField: '_id',
                                as: 'teacher',
                            },
                        },
                        { $unwind: { path: '$teacher', preserveNullAndEmptyArrays: true } },
                        {
                            $lookup: {
                                from: 'media',
                                localField: 'course.coverImageId',
                                foreignField: '_id',
                                as: 'coverImage',
                            },
                        },
                        {
                            $unwind: {
                                path: '$coverImage',
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $project: {
                                _id: 0,
                                id: { $toString: '$_id' },
                                courseId: { $toString: '$course._id' },
                                progress: 1,
                                status: 1,
                                course: {
                                    title: '$course.title',
                                    slug: '$course.slug',
                                    teacher: {
                                        fullName: '$teacher.fullName',
                                        avatar: '$teacher.avatar',
                                    },
                                    coverImage: {
                                        url: '$coverImage.url',
                                        blurHash: '$coverImage.blurHash',
                                    },
                                },
                            },
                        },
                    ],
                    totalCount: [{ $count: 'count' }],
                },
            },
        ];
        const [result] = await this.enrollmentModel.aggregate(pipeline).exec();
        return {
            items: result.data || [],
            total: result.totalCount[0]?.count || 0,
        };
    }
    async findActiveStudentIdsByCourse(courseId) {
        const enrollments = await this.enrollmentModel
            .find({
            courseId: new mongoose_2.Types.ObjectId(courseId.toString()),
            status: enrollment_schema_1.EnrollmentStatus.ACTIVE,
        })
            .select('userId')
            .lean()
            .exec();
        return enrollments.map((e) => e.userId.toString());
    }
    async getCourseAverageProgress(courseId) {
        const pipeline = [
            {
                $match: {
                    courseId: new mongoose_2.Types.ObjectId(courseId.toString()),
                    status: enrollment_schema_1.EnrollmentStatus.ACTIVE,
                },
            },
            {
                $group: {
                    _id: null,
                    avgProgress: { $avg: '$progress' },
                },
            },
        ];
        const result = await this.enrollmentModel.aggregate(pipeline).exec();
        return result.length > 0 ? result[0].avgProgress : 0;
    }
};
exports.EnrollmentsRepository = EnrollmentsRepository;
exports.EnrollmentsRepository = EnrollmentsRepository = EnrollmentsRepository_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(enrollment_schema_1.Enrollment.name)),
    __param(1, (0, mongoose_1.InjectConnection)()),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Connection])
], EnrollmentsRepository);
//# sourceMappingURL=enrollments.repository.js.map