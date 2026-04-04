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
var CoursesRepository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoursesRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const abstract_repository_1 = require("../../common/database/abstract.repository");
const course_schema_1 = require("./schemas/course.schema");
const course_search_enum_1 = require("./enums/course-search.enum");
let CoursesRepository = CoursesRepository_1 = class CoursesRepository extends abstract_repository_1.AbstractRepository {
    courseModel;
    logger = new common_1.Logger(CoursesRepository_1.name);
    constructor(courseModel, connection) {
        super(courseModel, connection);
        this.courseModel = courseModel;
    }
    async getCourseDetailById(courseId) {
        return this.courseModel
            .findById(new mongoose_2.Types.ObjectId(courseId))
            .populate('coverImageId', 'url blurHash')
            .populate('promotionalVideoId', 'url blurHash duration')
            .lean()
            .exec();
    }
    async findBySlug(slug) {
        const course = await this.courseModel
            .findOne({ slug })
            .populate('teacherId', 'fullName avatar bio')
            .populate('subjectId', 'name')
            .populate('coverImageId', 'url blurHash')
            .populate('promotionalVideoId', 'url blurHash duration')
            .lean()
            .exec();
        if (!course)
            return null;
        const { _id, coverImageId, promotionalVideoId, teacherId, subjectId, ...rest } = course;
        return {
            id: _id.toString(),
            subject: subjectId
                ? { id: subjectId._id.toString(), name: subjectId.name }
                : null,
            teacher: teacherId
                ? {
                    id: teacherId._id.toString(),
                    fullName: teacherId.fullName,
                    avatar: teacherId.avatar,
                    bio: teacherId.bio || null,
                }
                : null,
            coverImage: coverImageId
                ? {
                    id: coverImageId._id.toString(),
                    url: coverImageId.url,
                    blurHash: coverImageId.blurHash,
                }
                : null,
            promotionalVideo: promotionalVideoId
                ? {
                    id: promotionalVideoId._id.toString(),
                    url: promotionalVideoId.url,
                    blurHash: promotionalVideoId.blurHash || null,
                    duration: promotionalVideoId.duration || null,
                }
                : null,
            ...rest,
        };
    }
    async getFullCourseCurriculum(courseId, options) {
        const maskUrls = options?.maskMediaUrls ?? false;
        const pipeline = [
            { $match: { _id: new mongoose_2.Types.ObjectId(courseId.toString()) } },
            {
                $lookup: {
                    from: 'course_sections',
                    localField: '_id',
                    foreignField: 'courseId',
                    pipeline: [
                        { $sort: { order: 1 } },
                        {
                            $lookup: {
                                from: 'course_lessons',
                                localField: '_id',
                                foreignField: 'sectionId',
                                pipeline: [
                                    { $sort: { order: 1 } },
                                    {
                                        $lookup: {
                                            from: 'exams',
                                            localField: 'examId',
                                            foreignField: '_id',
                                            as: 'examData'
                                        }
                                    },
                                    {
                                        $unwind: {
                                            path: '$examData',
                                            preserveNullAndEmptyArrays: true
                                        }
                                    },
                                    {
                                        $lookup: {
                                            from: 'media',
                                            let: { videoId: '$primaryVideoId' },
                                            pipeline: [
                                                { $match: { $expr: { $eq: ['$_id', '$$videoId'] } } },
                                                {
                                                    $project: {
                                                        _id: 1,
                                                        url: 1,
                                                        blurHash: 1,
                                                        duration: 1,
                                                    },
                                                },
                                            ],
                                            as: 'primaryVideoData',
                                        },
                                    },
                                    {
                                        $unwind: {
                                            path: '$primaryVideoData',
                                            preserveNullAndEmptyArrays: true,
                                        },
                                    },
                                    {
                                        $lookup: {
                                            from: 'media',
                                            let: { attachmentIds: { $ifNull: ['$attachments', []] } },
                                            pipeline: [
                                                {
                                                    $match: {
                                                        $expr: { $in: ['$_id', '$$attachmentIds'] },
                                                    },
                                                },
                                                {
                                                    $project: {
                                                        _id: 1,
                                                        url: 1,
                                                        originalName: 1,
                                                        mimetype: 1,
                                                        size: 1,
                                                    },
                                                },
                                            ],
                                            as: 'attachmentsData',
                                        },
                                    },
                                ],
                                as: 'lessons',
                            },
                        },
                    ],
                    as: 'sections',
                },
            },
            {
                $addFields: {
                    id: { $toString: '$_id' },
                    totalLessons: {
                        $sum: {
                            $map: {
                                input: '$sections',
                                as: 's',
                                in: { $size: '$$s.lessons' },
                            },
                        },
                    },
                    totalVideos: {
                        $sum: {
                            $map: {
                                input: '$sections',
                                as: 's',
                                in: {
                                    $size: {
                                        $filter: {
                                            input: '$$s.lessons',
                                            as: 'l',
                                            cond: { $ifNull: ['$$l.primaryVideoId', false] },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    totalDocuments: {
                        $sum: {
                            $map: {
                                input: '$sections',
                                as: 's',
                                in: {
                                    $size: {
                                        $filter: {
                                            input: '$$s.lessons',
                                            as: 'l',
                                            cond: {
                                                $gt: [
                                                    { $size: { $ifNull: ['$$l.attachments', []] } },
                                                    0,
                                                ],
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    totalQuizzes: {
                        $sum: {
                            $map: {
                                input: '$sections',
                                as: 's',
                                in: {
                                    $size: {
                                        $filter: {
                                            input: '$$s.lessons',
                                            as: 'l',
                                            cond: { $ifNull: ['$$l.examId', false] },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    sections: {
                        $map: {
                            input: '$sections',
                            as: 'section',
                            in: {
                                id: { $toString: '$$section._id' },
                                title: '$$section.title',
                                description: '$$section.description',
                                order: '$$section.order',
                                lessons: {
                                    $map: {
                                        input: '$$section.lessons',
                                        as: 'lesson',
                                        in: {
                                            id: { $toString: '$$lesson._id' },
                                            title: '$$lesson.title',
                                            type: '$$lesson.type',
                                            order: '$$lesson.order',
                                            isFreePreview: '$$lesson.isFreePreview',
                                            content: '$$lesson.content',
                                            examId: {
                                                $cond: [
                                                    { $ifNull: ['$$lesson.examId', false] },
                                                    { $toString: '$$lesson.examId' },
                                                    null,
                                                ],
                                            },
                                            examMode: {
                                                $cond: [
                                                    { $ifNull: ['$$lesson.examData', false] },
                                                    '$$lesson.examData.mode',
                                                    null,
                                                ],
                                            },
                                            examType: {
                                                $cond: [
                                                    { $ifNull: ['$$lesson.examData', false] },
                                                    '$$lesson.examData.type',
                                                    null,
                                                ],
                                            },
                                            primaryVideo: {
                                                $cond: [
                                                    { $ifNull: ['$$lesson.primaryVideoData', false] },
                                                    {
                                                        id: { $toString: '$$lesson.primaryVideoData._id' },
                                                        url: maskUrls
                                                            ? {
                                                                $cond: [
                                                                    { $eq: ['$$lesson.isFreePreview', true] },
                                                                    '$$lesson.primaryVideoData.url',
                                                                    null,
                                                                ],
                                                            }
                                                            : '$$lesson.primaryVideoData.url',
                                                        blurHash: '$$lesson.primaryVideoData.blurHash',
                                                        duration: '$$lesson.primaryVideoData.duration',
                                                    },
                                                    null,
                                                ],
                                            },
                                            attachments: {
                                                $map: {
                                                    input: '$$lesson.attachmentsData',
                                                    as: 'att',
                                                    in: {
                                                        id: { $toString: '$$att._id' },
                                                        url: maskUrls
                                                            ? {
                                                                $cond: [
                                                                    { $eq: ['$$lesson.isFreePreview', true] },
                                                                    '$$att.url',
                                                                    null,
                                                                ],
                                                            }
                                                            : '$$att.url',
                                                        originalName: '$$att.originalName',
                                                        mimetype: '$$att.mimetype',
                                                        size: '$$att.size',
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    __v: 0,
                    teacherId: 0,
                    subjectId: 0,
                    coverImageId: 0,
                    promotionalVideoId: 0,
                },
            },
        ];
        const result = await this.courseModel
            .aggregate(pipeline, { session: this.currentSession })
            .exec();
        return result[0] || null;
    }
    async searchPublicCourses(options) {
        const { keyword, subjectId, page, limit, isFree, minPrice, maxPrice, sort, } = options;
        const andConditions = [{ status: 'PUBLISHED' }];
        if (keyword) {
            andConditions.push({
                $or: [
                    { title: { $regex: keyword, $options: 'i' } },
                    { description: { $regex: keyword, $options: 'i' } },
                ],
            });
        }
        if (subjectId && mongoose_2.Types.ObjectId.isValid(subjectId)) {
            andConditions.push({ subjectId: new mongoose_2.Types.ObjectId(subjectId) });
        }
        if (isFree) {
            andConditions.push({ price: 0 });
        }
        else if (minPrice !== undefined || maxPrice !== undefined) {
            const priceCondition = {};
            if (minPrice !== undefined)
                priceCondition.$gte = minPrice;
            if (maxPrice !== undefined)
                priceCondition.$lte = maxPrice;
            andConditions.push({
                $or: [
                    { discountPrice: { $gt: 0, ...priceCondition } },
                    {
                        $or: [
                            { discountPrice: 0 },
                            { discountPrice: null },
                            { discountPrice: { $exists: false } },
                        ],
                        price: priceCondition,
                    },
                ],
            });
        }
        const filter = { $and: andConditions };
        let sortConfig = { createdAt: -1 };
        if (sort) {
            switch (sort) {
                case course_search_enum_1.CourseSortType.PRICE_ASC:
                    sortConfig = { price: 1, createdAt: -1 };
                    break;
                case course_search_enum_1.CourseSortType.PRICE_DESC:
                    sortConfig = { price: -1, createdAt: -1 };
                    break;
                case course_search_enum_1.CourseSortType.POPULAR:
                    sortConfig = { averageRating: -1, totalReviews: -1, createdAt: -1 };
                    break;
                case course_search_enum_1.CourseSortType.NEWEST:
                default:
                    sortConfig = { createdAt: -1 };
                    break;
            }
        }
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.courseModel
                .find(filter)
                .select('title slug price discountPrice coverImageId teacherId subjectId status createdAt averageRating totalReviews')
                .populate('teacherId', 'fullName avatar')
                .populate('subjectId', 'name')
                .populate('coverImageId', 'url blurHash')
                .sort(sortConfig)
                .skip(skip)
                .limit(limit)
                .lean()
                .exec(),
            this.courseModel.countDocuments(filter).exec(),
        ]);
        const mappedData = data.map((item) => {
            const { _id, teacherId, coverImageId, subjectId, ...rest } = item;
            return {
                id: _id.toString(),
                subject: subjectId
                    ? { id: subjectId._id.toString(), name: subjectId.name }
                    : null,
                teacher: teacherId
                    ? {
                        id: teacherId._id.toString(),
                        fullName: teacherId.fullName,
                        avatar: teacherId.avatar,
                    }
                    : null,
                coverImage: coverImageId
                    ? {
                        id: coverImageId._id.toString(),
                        url: coverImageId.url,
                        blurHash: coverImageId.blurHash,
                    }
                    : null,
                ...rest,
            };
        });
        return {
            data: mappedData,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async getTeacherCoursesWithMetrics(teacherId) {
        const pipeline = [
            { $match: { teacherId: new mongoose_2.Types.ObjectId(teacherId) } },
            { $sort: { createdAt: -1 } },
            {
                $lookup: {
                    from: 'enrollments',
                    localField: '_id',
                    foreignField: 'courseId',
                    as: 'enrollments',
                },
            },
            {
                $lookup: {
                    from: 'media',
                    localField: 'coverImageId',
                    foreignField: '_id',
                    as: 'coverImageData',
                },
            },
            {
                $unwind: {
                    path: '$coverImageData',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    id: { $toString: '$_id' },
                    _id: 0,
                    title: 1,
                    slug: 1,
                    price: 1,
                    discountPrice: 1,
                    status: 1,
                    createdAt: 1,
                    studentCount: { $size: '$enrollments' },
                    coverImage: {
                        $cond: {
                            if: { $ifNull: ['$coverImageData', false] },
                            then: {
                                id: { $toString: '$coverImageData._id' },
                                url: '$coverImageData.url',
                                blurHash: '$coverImageData.blurHash',
                            },
                            else: null,
                        },
                    },
                },
            },
        ];
        return this.courseModel.aggregate(pipeline).exec();
    }
    async countTeacherActiveCourses(teacherId) {
        return this.courseModel
            .countDocuments({
            teacherId: new mongoose_2.Types.ObjectId(teacherId.toString()),
            status: {
                $in: [course_schema_1.CourseStatus.PUBLISHED, course_schema_1.CourseStatus.PENDING_REVIEW],
            },
        })
            .exec();
    }
    async findPublishedPublicCardsByOrderedIds(ids) {
        if (!ids.length)
            return [];
        const data = await this.courseModel
            .find({
            _id: { $in: ids },
            status: course_schema_1.CourseStatus.PUBLISHED,
        })
            .select('title slug price discountPrice coverImageId teacherId subjectId status createdAt averageRating totalReviews')
            .populate('teacherId', 'fullName avatar')
            .populate('subjectId', 'name')
            .populate('coverImageId', 'url blurHash')
            .lean()
            .exec();
        const byId = new Map(data.map((item) => [item._id.toString(), item]));
        const ordered = [];
        for (const oid of ids) {
            const item = byId.get(oid.toString());
            if (!item)
                continue;
            ordered.push(this.mapLeanToPublicCourseCard(item));
        }
        return ordered;
    }
    mapLeanToPublicCourseCard(item) {
        const { _id, teacherId, coverImageId, subjectId, ...rest } = item;
        return {
            id: _id.toString(),
            subject: subjectId
                ? { id: subjectId._id.toString(), name: subjectId.name }
                : null,
            teacher: teacherId
                ? {
                    id: teacherId._id.toString(),
                    fullName: teacherId.fullName,
                    avatar: teacherId.avatar,
                }
                : null,
            coverImage: coverImageId
                ? {
                    id: coverImageId._id.toString(),
                    url: coverImageId.url,
                    blurHash: coverImageId.blurHash,
                }
                : null,
            ...rest,
        };
    }
};
exports.CoursesRepository = CoursesRepository;
exports.CoursesRepository = CoursesRepository = CoursesRepository_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(course_schema_1.Course.name)),
    __param(1, (0, mongoose_1.InjectConnection)()),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Connection])
], CoursesRepository);
//# sourceMappingURL=courses.repository.js.map