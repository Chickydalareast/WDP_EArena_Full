// file: src/modules/courses/courses.repository.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types, PipelineStage } from 'mongoose';
import { AbstractRepository } from '../../common/database/abstract.repository';
import { Course, CourseDocument, CourseStatus } from './schemas/course.schema';
import { CourseSortType } from './enums/course-search.enum';

// [CTO UPGRADE]: Interface mở rộng chuẩn SOLID (Open/Closed Principle)
export interface GetCurriculumOptions {
  maskMediaUrls?: boolean;
}

// [CTO UPGRADE]: Domain Interface kết nối Service và Repository (Không chứa DTO)
export interface SearchPublicCoursesOptions {
  keyword?: string;
  subjectId?: string;
  page: number;
  limit: number;
  isFree?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sort?: CourseSortType;
}

@Injectable()
export class CoursesRepository extends AbstractRepository<CourseDocument> {
  protected readonly logger = new Logger(CoursesRepository.name);

  constructor(
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
    @InjectConnection() connection: Connection,
  ) {
    super(courseModel, connection);
  }

  async getCourseDetailById(courseId: string) {
    return this.courseModel
      .findById(new Types.ObjectId(courseId))
      .populate('coverImageId', 'url blurHash')
      .populate('promotionalVideoId', 'url blurHash duration')
      .lean()
      .exec();
  }

  async findBySlug(slug: string): Promise<any> {
    const course = await this.courseModel
      .findOne({ slug })
      .populate('teacherId', 'fullName avatar bio')
      .populate('subjectId', 'name')
      .populate('coverImageId', 'url blurHash')
      .populate('promotionalVideoId', 'url blurHash duration')
      .lean()
      .exec();

    if (!course) return null;

    const {
      _id,
      coverImageId,
      promotionalVideoId,
      teacherId,
      subjectId,
      ...rest
    } = course as any;
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

  async getFullCourseCurriculum(
    courseId: string | Types.ObjectId,
    options?: GetCurriculumOptions,
  ) {
    const maskUrls = options?.maskMediaUrls ?? false;

    const pipeline: PipelineStage[] = [
      { $match: { _id: new Types.ObjectId(courseId.toString()) } },
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
          teacherId: { $toString: '$teacherId' },
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
                      dynamicConfig: {
                        $cond: [
                          { $ifNull: ['$$lesson.examData.dynamicConfig', false] },
                          {
                            matrixId: {
                              $cond: [
                                { $ifNull: ['$$lesson.examData.dynamicConfig.matrixId', false] },
                                { $toString: '$$lesson.examData.dynamicConfig.matrixId' },
                                null,
                              ],
                            },
                            adHocSections: { $ifNull: ['$$lesson.examData.dynamicConfig.adHocSections', []] },
                          },
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

  async searchPublicCourses(options: SearchPublicCoursesOptions) {
    const {
      keyword,
      subjectId,
      page,
      limit,
      isFree,
      minPrice,
      maxPrice,
      sort,
    } = options;

    const andConditions: any[] = [{ status: 'PUBLISHED' }];

    if (keyword) {
      andConditions.push({
        $or: [
          { title: { $regex: keyword, $options: 'i' } },
          { description: { $regex: keyword, $options: 'i' } },
        ],
      });
    }

    if (subjectId && Types.ObjectId.isValid(subjectId)) {
      andConditions.push({ subjectId: new Types.ObjectId(subjectId) });
    }

    if (isFree) {
      andConditions.push({ price: 0 });
    } else if (minPrice !== undefined || maxPrice !== undefined) {
      const priceCondition: any = {};
      if (minPrice !== undefined) priceCondition.$gte = minPrice;
      if (maxPrice !== undefined) priceCondition.$lte = maxPrice;

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

    let sortConfig: Record<string, 1 | -1> = { createdAt: -1 };

    if (sort) {
      switch (sort) {
        case CourseSortType.PRICE_ASC:
          sortConfig = { price: 1, createdAt: -1 };
          break;
        case CourseSortType.PRICE_DESC:
          sortConfig = { price: -1, createdAt: -1 };
          break;
        case CourseSortType.POPULAR:
          sortConfig = { averageRating: -1, totalReviews: -1, createdAt: -1 };
          break;
        case CourseSortType.NEWEST:
        default:
          sortConfig = { createdAt: -1 };
          break;
      }
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.courseModel
        .find(filter)
        .select(
          'title slug price discountPrice coverImageId teacherId subjectId status createdAt averageRating totalReviews',
        )
        .populate('teacherId', 'fullName avatar')
        .populate('subjectId', 'name')
        .populate('coverImageId', 'url blurHash')
        .sort(sortConfig as any)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.courseModel.countDocuments(filter).exec(),
    ]);

    // 4. Transform Data về chuẩn Output
    const mappedData = data.map((item: any) => {
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

  async getTeacherCoursesWithMetrics(teacherId: string) {
    const pipeline: PipelineStage[] = [
      { $match: { teacherId: new Types.ObjectId(teacherId) } },
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

  async countTeacherActiveCourses(
    teacherId: string | Types.ObjectId,
  ): Promise<number> {
    return this.courseModel
      .countDocuments({
        teacherId: new Types.ObjectId(teacherId.toString()),
        status: {
          $in: [CourseStatus.PUBLISHED, CourseStatus.PENDING_REVIEW],
        },
      })
      .exec();
  }

  /** Cùng shape với phần tử `data` của searchPublicCourses, giữ đúng thứ tự `ids`. */
  async findPublishedPublicCardsByOrderedIds(
    ids: Types.ObjectId[],
  ): Promise<Record<string, unknown>[]> {
    if (!ids.length) return [];
    const data = await this.courseModel
      .find({
        _id: { $in: ids },
        status: CourseStatus.PUBLISHED,
      })
      .select(
        'title slug price discountPrice coverImageId teacherId subjectId status createdAt averageRating totalReviews',
      )
      .populate('teacherId', 'fullName avatar')
      .populate('subjectId', 'name')
      .populate('coverImageId', 'url blurHash')
      .lean()
      .exec();
    const byId = new Map(
      (data as any[]).map((item: any) => [item._id.toString(), item]),
    );
    const ordered: Record<string, unknown>[] = [];
    for (const oid of ids) {
      const item = byId.get(oid.toString()) as any;
      if (!item) continue;
      ordered.push(this.mapLeanToPublicCourseCard(item));
    }
    return ordered;
  }

  private mapLeanToPublicCourseCard(item: any): Record<string, unknown> {
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
}
