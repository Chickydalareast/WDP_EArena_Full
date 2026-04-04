import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { CoursesRepository } from '../courses.repository';
import { SectionsRepository } from '../repositories/sections.repository';
import { LessonsRepository } from '../repositories/lessons.repository';
import { MediaRepository } from '../../media/media.repository';
import { ExamsRepository } from '../../exams/exams.repository';
import { EnrollmentsRepository } from '../repositories/enrollments.repository';

import { RedisService } from '../../../common/redis/redis.service';
import { MediaStatus } from '../../media/schemas/media.schema';
import { CourseStatus } from '../schemas/course.schema';
import { EnrollmentStatus } from '../schemas/enrollment.schema';
import {
  CourseEventPattern,
  CourseNewLessonEventPayload,
} from '../constants/course-event.constant';

import {
  CreateSectionPayload,
  CreateLessonPayload,
  UpdateSectionPayload,
  UpdateLessonPayload,
  ReorderPayload,
  EmbeddedExamConfigPayload,
  LessonDetailResponse,
  LessonComputedType,
} from '../interfaces/course.interface';
import { ExamMode, ExamType } from 'src/modules/exams/schemas/exam.schema';

@Injectable()
export class CurriculumService {
  private readonly logger = new Logger(CurriculumService.name);

  constructor(
    private readonly coursesRepo: CoursesRepository,
    private readonly sectionsRepo: SectionsRepository,
    private readonly lessonsRepo: LessonsRepository,
    private readonly redisService: RedisService,
    private readonly mediaRepo: MediaRepository,
    private readonly examsRepo: ExamsRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly enrollmentsRepo: EnrollmentsRepository,
  ) {}

  private async verifyMultipleMediaStrict(
    mediaIds: (string | null | undefined)[],
    teacherId: string,
  ): Promise<void> {
    const validIdsArray = mediaIds.filter(
      (id): id is string => !!id && Types.ObjectId.isValid(id),
    );
    const uniqueValidIds = Array.from(new Set(validIdsArray));

    if (uniqueValidIds.length === 0) return;

    const medias = await this.mediaRepo.modelInstance
      .find({
        _id: { $in: uniqueValidIds.map((id) => new Types.ObjectId(id)) },
      })
      .lean()
      .select('uploadedBy status originalName')
      .exec();

    if (medias.length !== uniqueValidIds.length) {
      throw new BadRequestException(
        'Một hoặc nhiều tệp đính kèm không tồn tại trong hệ thống.',
      );
    }

    for (const media of medias) {
      if (media.uploadedBy.toString() !== teacherId) {
        this.logger.warn(
          `[SECURITY ALERT] User ${teacherId} cố gắng gán Media ${media._id} của người khác vào bài học!`,
        );
        throw new ForbiddenException(
          `Tệp tin "${media.originalName}" không thuộc quyền sở hữu của bạn.`,
        );
      }
      if (media.status !== MediaStatus.READY) {
        throw new BadRequestException(
          `Tệp tin "${media.originalName}" đang xử lý hoặc bị lỗi, chưa thể sử dụng.`,
        );
      }
    }
  }

  private async verifyExamStrict(
    examId: string,
    teacherId: string,
  ): Promise<void> {
    if (!examId) return;

    if (!Types.ObjectId.isValid(examId)) {
      throw new BadRequestException('Định dạng ID Bài kiểm tra không hợp lệ.');
    }

    const exam = await this.examsRepo.findByIdSafe(examId, {
      select: 'teacherId isPublished title',
    });

    if (!exam) {
      throw new NotFoundException(
        'Không tìm thấy Bài kiểm tra (Exam) trong hệ thống.',
      );
    }

    if (exam.teacherId.toString() !== teacherId) {
      this.logger.warn(
        `[SECURITY ALERT] User ${teacherId} cố gắng gán Exam ${examId} của người khác vào bài học!`,
      );
      throw new ForbiddenException(
        `Bài kiểm tra "${exam.title}" không thuộc quyền sở hữu của bạn.`,
      );
    }

    if (!exam.isPublished) {
      throw new BadRequestException(
        `Bài kiểm tra "${exam.title}" đang ở trạng thái Nháp (Draft). Vui lòng Xuất bản đề thi trước khi gắn vào Khóa học.`,
      );
    }
  }

  private async validateCourseOwnership(courseId: string, teacherId: string) {
    if (!Types.ObjectId.isValid(courseId))
      throw new BadRequestException('ID khóa học không hợp lệ.');

    const course = await this.coursesRepo.findByIdSafe(courseId, {
      select: 'teacherId slug status title progressionMode',
    });
    if (!course) throw new NotFoundException('Không tìm thấy khóa học.');

    if (course.teacherId.toString() !== teacherId) {
      throw new ForbiddenException(
        'Bạn không có quyền chỉnh sửa khóa học này.',
      );
    }
    return course;
  }

  private async clearCourseCache(slug: string) {
    try {
      await this.redisService.del(`course:detail:${slug}`);
      this.logger.debug(
        `[Cache Invalidation] Đã xóa cache cho course: ${slug}`,
      );
    } catch (error) {
      this.logger.error(
        `[Cache Error] Lỗi khi xóa cache khóa học ${slug}:`,
        error,
      );
    }
  }

  private async checkStructureLock(
    courseId: string,
    actionName: string,
  ): Promise<void> {
    const studentCount =
      await this.enrollmentsRepo.modelInstance.countDocuments({
        courseId: new Types.ObjectId(courseId),
        status: EnrollmentStatus.ACTIVE,
      });

    if (studentCount > 0) {
      throw new ForbiddenException(
        `Hành động bị từ chối (${actionName})! Không thể xóa phân mảnh cấu trúc (Chương/Bài học) khi khóa học đã có học viên ghi danh. Nếu cần thay thế, vui lòng dùng chức năng Cập Nhật nội dung bên trong Bài Học.`,
      );
    }
  }

  private async processEmbeddedExamConfig(
    teacherId: string,
    subjectId: Types.ObjectId | undefined,
    config: EmbeddedExamConfigPayload,
    existingExamId?: Types.ObjectId,
  ): Promise<Types.ObjectId> {
    const dynamicConfigData = config.matrixId
      ? { matrixId: config.matrixId }
      : { adHocSections: config.adHocSections };

    if (existingExamId) {
      await this.examsRepo.updateByIdSafe(existingExamId, {
        $set: {
          title: config.title,
          totalScore: config.totalScore,
          dynamicConfig: dynamicConfigData as any,
        },
      });
      return existingExamId;
    } else {
      const newExam = await this.examsRepo.createDocument({
        title: config.title,
        description: 'Bài kiểm tra tạo tự động từ Course Builder',
        teacherId: new Types.ObjectId(teacherId),
        subjectId: subjectId || new Types.ObjectId(),
        totalScore: config.totalScore,
        type: ExamType.COURSE_QUIZ,
        mode: ExamMode.DYNAMIC,
        isPublished: true,
        dynamicConfig: dynamicConfigData as any,
      });
      this.logger.log(
        `[Orchestrator] Đã sinh ngầm COURSE_QUIZ ${newExam._id} cho Teacher ${teacherId}`,
      );
      return newExam._id;
    }
  }

  async createSection(payload: CreateSectionPayload) {
    const course = await this.validateCourseOwnership(
      payload.courseId,
      payload.teacherId,
    );

    const MAX_RETRIES = 3;
    let attempt = 0;

    while (attempt < MAX_RETRIES) {
      try {
        const nextOrder = await this.sectionsRepo.getNextOrder(
          payload.courseId,
        );

        const sectionData = {
          courseId: new Types.ObjectId(payload.courseId),
          title: payload.title,
          description: payload.description,
          order: nextOrder,
        };

        const created = await this.sectionsRepo.createDocument(sectionData);
        await this.clearCourseCache(course.slug);

        const { _id, ...rest } = created as any;
        return { id: _id.toString(), ...rest };
      } catch (error: any) {
        if (error.code === 11000) {
          attempt++;
          continue;
        }
        throw error;
      }
    }
    throw new ConflictException(
      'Hệ thống đang xử lý nhiều thao tác cùng lúc, vui lòng thử lại.',
    );
  }

  async updateSection(payload: UpdateSectionPayload) {
    const course = await this.validateCourseOwnership(
      payload.courseId,
      payload.teacherId,
    );

    const section = await this.sectionsRepo.findByIdSafe(payload.sectionId);
    if (!section || section.courseId.toString() !== payload.courseId) {
      throw new NotFoundException(
        'Chương học không tồn tại trong khóa học này.',
      );
    }

    const { courseId, sectionId, teacherId, ...updateData } = payload;
    const updated = await this.sectionsRepo.updateByIdSafe(sectionId, {
      $set: updateData,
    });

    await this.clearCourseCache(course.slug);

    return {
      message: 'Cập nhật chương học thành công',
      id: (updated as any)._id.toString(),
      ...updated,
    };
  }

  async deleteSection(courseId: string, sectionId: string, teacherId: string) {
    const course = await this.validateCourseOwnership(courseId, teacherId);

    await this.checkStructureLock(courseId, 'Xóa Chương học');

    if (!Types.ObjectId.isValid(sectionId))
      throw new BadRequestException('ID chương học không hợp lệ.');

    const section = await this.sectionsRepo.findByIdSafe(sectionId, {
      select: 'courseId',
    });
    if (!section || section.courseId.toString() !== courseId) {
      throw new NotFoundException(
        'Chương học không tồn tại trong khóa học này.',
      );
    }

    await this.sectionsRepo.executeInTransaction(async () => {
      await this.lessonsRepo.deleteManySafe({
        sectionId: new Types.ObjectId(sectionId),
      });
      await this.sectionsRepo.deleteOneSafe({
        _id: new Types.ObjectId(sectionId),
      });
    });

    await this.clearCourseCache(course.slug);

    return {
      message: 'Đã xóa Chương và toàn bộ Bài học bên trong thành công.',
    };
  }

  async createLesson(payload: CreateLessonPayload) {
    if (payload.examId && payload.embeddedExamConfig) {
      throw new BadRequestException(
        'Xung đột dữ liệu: Không thể vừa chọn Đề thi có sẵn, vừa yêu cầu tạo Đề thi mới.',
      );
    }

    const course = await this.validateCourseOwnership(
      payload.courseId,
      payload.teacherId,
    );

    const mediaIdsToCheck = [
      payload.primaryVideoId,
      ...(payload.attachments || []),
    ];
    await this.verifyMultipleMediaStrict(mediaIdsToCheck, payload.teacherId);

    if (payload.examId)
      await this.verifyExamStrict(payload.examId, payload.teacherId);

    const section = await this.sectionsRepo.findByIdSafe(payload.sectionId, {
      select: '_id',
    });
    if (!section)
      throw new NotFoundException('Không tìm thấy Chương/Phần này.');

    const MAX_RETRIES = 3;
    let attempt = 0;

    while (attempt < MAX_RETRIES) {
      try {
        const createdLesson = await this.lessonsRepo.executeInTransaction(
          async () => {
            const nextOrder = await this.lessonsRepo.getNextOrder(
              payload.sectionId,
            );

            let finalExamId: Types.ObjectId | undefined = payload.examId
              ? new Types.ObjectId(payload.examId)
              : undefined;

            if (payload.embeddedExamConfig) {
              finalExamId = await this.processEmbeddedExamConfig(
                payload.teacherId,
                course.subjectId,
                payload.embeddedExamConfig,
              );
            }

            const lessonData = {
              courseId: new Types.ObjectId(payload.courseId),
              sectionId: new Types.ObjectId(payload.sectionId),
              title: payload.title,
              order: nextOrder,
              isFreePreview: payload.isFreePreview,
              primaryVideoId: payload.primaryVideoId
                ? new Types.ObjectId(payload.primaryVideoId)
                : undefined,
              attachments:
                payload.attachments?.map((id) => new Types.ObjectId(id)) || [],
              examId: finalExamId,
              examRules: payload.examRules || null,
              content: payload.content,
            };

            return await this.lessonsRepo.createDocument(lessonData);
          },
        );

        await this.clearCourseCache(course.slug);

        const { _id, ...rest } = createdLesson as any;
        const lessonIdStr = _id.toString();

        if (course.status === CourseStatus.PUBLISHED) {
          this.eventEmitter.emit(CourseEventPattern.COURSE_NEW_LESSON, {
            courseId: course._id.toString(),
            courseTitle: course.title,
            lessonId: lessonIdStr,
            lessonTitle: payload.title,
          } as CourseNewLessonEventPayload);
        }

        return { id: lessonIdStr, ...rest };
      } catch (error: any) {
        if (error.code === 11000) {
          attempt++;
          continue;
        }
        throw error;
      }
    }
    throw new ConflictException(
      'Hệ thống đang xử lý nhiều thao tác cùng lúc, vui lòng thử lại.',
    );
  }

  async updateLesson(payload: UpdateLessonPayload) {
    if (payload.examId && payload.embeddedExamConfig) {
      throw new BadRequestException(
        'Xung đột dữ liệu: Không thể truyền cả ID đề thi và cấu hình khởi tạo ngầm.',
      );
    }

    const course = await this.validateCourseOwnership(
      payload.courseId,
      payload.teacherId,
    );

    const lesson = await this.lessonsRepo.findByIdSafe(payload.lessonId, {
      populate: 'examId',
    });
    if (!lesson || lesson.courseId.toString() !== payload.courseId) {
      throw new NotFoundException('Bài học không tồn tại trong khóa học này.');
    }

    const mediaIdsToCheck = [
      payload.primaryVideoId,
      ...(payload.attachments || []),
    ];
    await this.verifyMultipleMediaStrict(mediaIdsToCheck, payload.teacherId);

    if (payload.examId)
      await this.verifyExamStrict(payload.examId, payload.teacherId);

    const updatedLesson = await this.lessonsRepo.executeInTransaction(
      async () => {
        let finalExamId: Types.ObjectId | null | undefined = undefined;

        if (payload.examId === null && !payload.embeddedExamConfig) {
          finalExamId = null;
        } else if (payload.examId) {
          finalExamId = new Types.ObjectId(payload.examId);
        } else if (payload.embeddedExamConfig) {
          const currentExam = lesson.examId as any;
          const existingQuizId =
            currentExam && currentExam.type === ExamType.COURSE_QUIZ
              ? currentExam._id
              : undefined;

          finalExamId = await this.processEmbeddedExamConfig(
            payload.teacherId,
            course.subjectId,
            payload.embeddedExamConfig,
            existingQuizId,
          );
        }

        const sanitized: any = {};
        if (payload.title !== undefined) sanitized.title = payload.title;
        if (payload.isFreePreview !== undefined)
          sanitized.isFreePreview = payload.isFreePreview;
        if (payload.content !== undefined) sanitized.content = payload.content;
        if (payload.primaryVideoId !== undefined)
          sanitized.primaryVideoId = payload.primaryVideoId
            ? new Types.ObjectId(payload.primaryVideoId)
            : null;
        if (payload.attachments !== undefined)
          sanitized.attachments =
            payload.attachments?.map((id) => new Types.ObjectId(id)) || [];
        if (payload.examRules !== undefined)
          sanitized.examRules = payload.examRules;
        if (finalExamId !== undefined) sanitized.examId = finalExamId;

        return await this.lessonsRepo.updateByIdSafe(payload.lessonId, {
          $set: sanitized,
        });
      },
    );

    await this.clearCourseCache(course.slug);

    return { id: (updatedLesson as any)._id.toString(), ...updatedLesson };
  }

  async deleteLesson(courseId: string, lessonId: string, teacherId: string) {
    const course = await this.validateCourseOwnership(courseId, teacherId);

    await this.checkStructureLock(courseId, 'Xóa Bài học');

    const lesson = await this.lessonsRepo.findByIdSafe(lessonId, {
      populate: 'examId',
    });
    if (!lesson || lesson.courseId.toString() !== courseId)
      throw new NotFoundException('Bài học không hợp lệ.');

    const examObj = lesson.examId as any;

    await this.lessonsRepo.executeInTransaction(async () => {
      await this.lessonsRepo.deleteOneSafe({
        _id: new Types.ObjectId(lessonId),
      });

      if (examObj && examObj.type === ExamType.COURSE_QUIZ) {
        await this.examsRepo.deleteOneSafe({ _id: examObj._id });
        this.logger.log(
          `[Garbage Collection] Xóa thành công đề ngầm ${examObj._id} đi kèm bài học ${lessonId}`,
        );
      }
    });

    await this.clearCourseCache(course.slug);

    return { message: 'Đã xóa bài học và các tài nguyên ngầm liên quan.' };
  }

  async reorderCurriculum(payload: ReorderPayload) {
    const course = await this.validateCourseOwnership(
      payload.courseId,
      payload.teacherId,
    );

    if ((course as any).progressionMode === 'STRICT_LINEAR') {
      const studentCount =
        await this.enrollmentsRepo.modelInstance.countDocuments({
          courseId: new Types.ObjectId(payload.courseId),
          status: EnrollmentStatus.ACTIVE,
        });
      if (studentCount > 0) {
        throw new ForbiddenException(
          'Không thể thay đổi thứ tự bài học (Reorder) do khóa học đang bật cấu hình học Tuần tự (STRICT_LINEAR) và đã có học viên. Việc đảo lộn thứ tự sẽ gây gãy hệ thống tính toán bài học tiếp theo.',
        );
      }
    }

    await this.coursesRepo.executeInTransaction(async () => {
      if (payload.sections && payload.sections.length > 0) {
        await this.sectionsRepo.bulkUpdateOrderStrict(
          payload.courseId,
          payload.sections,
        );
      }
      if (payload.lessons && payload.lessons.length > 0) {
        await this.lessonsRepo.bulkUpdateOrderAndSectionStrict(
          payload.courseId,
          payload.lessons,
        );
      }
    });

    await this.clearCourseCache(course.slug);

    return { message: 'Cập nhật cấu trúc bài giảng thành công.' };
  }

async getLessonDetail(
    courseId: string,
    lessonId: string,
    teacherId: string,
  ): Promise<LessonDetailResponse> {
    await this.validateCourseOwnership(courseId, teacherId);

    const lesson = await this.lessonsRepo.findOneSafe({
      _id: new Types.ObjectId(lessonId),
      courseId: new Types.ObjectId(courseId),
    });

    if (!lesson) {
      throw new NotFoundException('Bài học không tồn tại hoặc không thuộc khóa học này.');
    }

    let computedType: LessonComputedType = 'READING';
    if (lesson.examId) {
      computedType = 'QUIZ';
    } else if (lesson.primaryVideoId) {
      computedType = 'VIDEO';
    }

    const response: LessonDetailResponse = {
      id: lesson._id.toString(),
      title: lesson.title,
      content: lesson.content,
      type: computedType,
      isFreePreview: lesson.isFreePreview,
      orderIndex: lesson.order, 
      examId: lesson.examId?.toString(),
      primaryVideoId: lesson.primaryVideoId?.toString(),
      attachments: lesson.attachments?.map(id => id.toString()),
    };

    if (lesson.examId) {
      const exam = await this.examsRepo.findByIdSafe(lesson.examId);
      if (exam) {
        response.dynamicConfig = exam.dynamicConfig;
        response.examRules = lesson.examRules;
      }
    }

    return response;
  }
}
