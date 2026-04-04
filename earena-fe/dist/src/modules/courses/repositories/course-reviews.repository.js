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
var CourseReviewsRepository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseReviewsRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const abstract_repository_1 = require("../../../common/database/abstract.repository");
const course_review_schema_1 = require("../schemas/course-review.schema");
let CourseReviewsRepository = CourseReviewsRepository_1 = class CourseReviewsRepository extends abstract_repository_1.AbstractRepository {
    reviewModel;
    logger = new common_1.Logger(CourseReviewsRepository_1.name);
    constructor(reviewModel, connection) {
        super(reviewModel, connection);
        this.reviewModel = reviewModel;
    }
    async calculateAverageRating(courseId) {
        const result = await this.reviewModel.aggregate([
            { $match: { courseId: new mongoose_2.Types.ObjectId(courseId.toString()) } },
            {
                $group: {
                    _id: '$courseId',
                    averageRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 },
                },
            },
        ], { session: this.currentSession });
        if (result.length > 0) {
            return {
                averageRating: Math.round(result[0].averageRating * 10) / 10,
                totalReviews: result[0].totalReviews,
            };
        }
        return { averageRating: 0, totalReviews: 0 };
    }
    async getCourseReviewsPaginated(courseId, page, limit) {
        const skip = (page - 1) * limit;
        const pipeline = [
            { $match: { courseId: new mongoose_2.Types.ObjectId(courseId) } },
            { $sort: { createdAt: -1 } },
            {
                $facet: {
                    data: [
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'userId',
                                foreignField: '_id',
                                as: 'user',
                            },
                        },
                        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
                        {
                            $project: {
                                _id: 0,
                                id: { $toString: '$_id' },
                                rating: 1,
                                comment: 1,
                                teacherReply: 1,
                                repliedAt: 1,
                                createdAt: 1,
                                updatedAt: 1,
                                user: {
                                    id: { $toString: '$user._id' },
                                    fullName: '$user.fullName',
                                    avatar: '$user.avatar',
                                },
                            },
                        },
                    ],
                    totalCount: [{ $count: 'count' }],
                },
            },
        ];
        const [result] = await this.reviewModel.aggregate(pipeline).exec();
        return {
            items: result.data || [],
            total: result.totalCount[0]?.count || 0,
        };
    }
    async countUnrepliedReviews(courseId) {
        return this.reviewModel
            .countDocuments({
            courseId: new mongoose_2.Types.ObjectId(courseId.toString()),
            $or: [
                { teacherReply: { $exists: false } },
                { teacherReply: null },
                { teacherReply: '' },
            ],
        })
            .exec();
    }
};
exports.CourseReviewsRepository = CourseReviewsRepository;
exports.CourseReviewsRepository = CourseReviewsRepository = CourseReviewsRepository_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(course_review_schema_1.CourseReview.name)),
    __param(1, (0, mongoose_1.InjectConnection)()),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Connection])
], CourseReviewsRepository);
//# sourceMappingURL=course-reviews.repository.js.map