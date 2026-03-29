import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { CoursesRepository } from '../courses.repository';
import { SectionsRepository } from '../repositories/sections.repository';
import { LessonsRepository } from '../repositories/lessons.repository';
import { RedisService } from '../../../common/redis/redis.service';
import {
  CreateSectionPayload,
  CreateLessonPayload,
  UpdateSectionPayload,
  UpdateLessonPayload,
  ReorderPayload
} from '../interfaces/course.interface';

// Import để check IDOR
import { MediaRepository } from '../../media/media.repository';
import { MediaStatus } from '../../media/schemas/media.schema';
// [CTO FIX]: Đã mở comment và import đúng Repository của Exam
import { ExamsRepository } from '../../exams/exams.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CourseStatus } from '../schemas/course.schema';
import { CourseEventPattern, CourseNewLessonEventPayload } from '../constants/course-event.constant';

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
  ) {}

  private async verifyMultipleMediaStrict(mediaIds: (string | null | undefined)[], teacherId: string): Promise<void> {
    const validIdsArray = mediaIds.filter((id): id is string => !!id && Types.ObjectId.isValid(id));
    const uniqueValidIds = Array.from(new Set(validIdsArray));
    
    if (uniqueValidIds.length === 0) return;

    // 2. Query 1 lượt lấy hết files
    const medias = await this.mediaRepo.modelInstance.find({
      _id: { $in: uniqueValidIds.map(id => new Types.ObjectId(id)) }
    }).lean().select('uploadedBy status originalName').exec();

    // 3. Đảm bảo toàn bộ ID truy vấn đều tồn tại thực sự trên DB
    if (medias.length !== uniqueValidIds.length) {
      throw new BadRequestException('Một hoặc nhiều tệp đính kèm không tồn tại trong hệ thống.');
    }

    // 4. Check quyền & trạng thái từng file
    for (const media of medias) {
      if (media.uploadedBy.toString() !== teacherId) {
        this.logger.warn(`[SECURITY ALERT] User ${teacherId} cố gắng gán Media ${media._id} của người khác vào bài học!`);
        throw new ForbiddenException(`Tệp tin "${media.originalName}" không thuộc quyền sở hữu của bạn.`);
      }
      if (media.status !== MediaStatus.READY) {
        throw new BadRequestException(`Tệp tin "${media.originalName}" đang xử lý hoặc bị lỗi, chưa thể sử dụng.`);
      }
    }
  }

  // =========================================================================
  // [CTO UPGRADE]: Động cơ quét bảo mật & check Status của Exam
  // =========================================================================
  private async verifyExamStrict(examId: string, teacherId: string): Promise<void> {
    if (!examId) return; // Không truyền examId thì skip hợp lệ
    
    if (!Types.ObjectId.isValid(examId)) {
      throw new BadRequestException('Định dạng ID Bài kiểm tra không hợp lệ.');
    }

    // Chỉ query các trường cần thiết để tiết kiệm RAM
    const exam = await this.examsRepo.findByIdSafe(examId, { 
      select: 'teacherId isPublished title' 
    });

    if (!exam) {
      throw new NotFoundException('Không tìm thấy Bài kiểm tra (Exam) trong hệ thống.');
    }

    // 1. Chống IDOR: Không cho phép xài trộm đề của giáo viên khác
    if (exam.teacherId.toString() !== teacherId) {
      this.logger.warn(`[SECURITY ALERT] User ${teacherId} cố gắng gán Exam ${examId} của người khác vào bài học!`);
      throw new ForbiddenException(`Bài kiểm tra "${exam.title}" không thuộc quyền sở hữu của bạn.`);
    }

    // 2. Chống rác Data: Không cho phép gắn đề thi đang viết nháp
    if (!exam.isPublished) {
      throw new BadRequestException(
        `Bài kiểm tra "${exam.title}" đang ở trạng thái Nháp (Draft). Vui lòng Xuất bản đề thi trước khi gắn vào Khóa học.`
      );
    }
  }

  private async validateCourseOwnership(courseId: string, teacherId: string) {
    if (!Types.ObjectId.isValid(courseId)) throw new BadRequestException('ID khóa học không hợp lệ.');
    
    const course = await this.coursesRepo.findByIdSafe(courseId, { select: 'teacherId slug status title' });
    if (!course) throw new NotFoundException('Không tìm thấy khóa học.');
    
    if (course.teacherId.toString() !== teacherId) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa khóa học này.');
    }
    return course;
  }

  private async clearCourseCache(slug: string) {
    try {
      await this.redisService.del(`course:detail:${slug}`);
      this.logger.debug(`[Cache Invalidation] Đã xóa cache cho course: ${slug}`);
    } catch (error) {
      this.logger.error(`[Cache Error] Lỗi khi xóa cache khóa học ${slug}:`, error);
    }
  }

  async createSection(payload: CreateSectionPayload) {
    const course = await this.validateCourseOwnership(payload.courseId, payload.teacherId);
    
    const MAX_RETRIES = 3;
    let attempt = 0;

    while (attempt < MAX_RETRIES) {
      try {
        const nextOrder = await this.sectionsRepo.getNextOrder(payload.courseId);
        
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
    throw new ConflictException('Hệ thống đang xử lý nhiều thao tác cùng lúc, vui lòng thử lại.');
  }


async createLesson(payload: CreateLessonPayload) {
    const course = await this.validateCourseOwnership(payload.courseId, payload.teacherId);

    const mediaIdsToCheck = [payload.primaryVideoId, ...(payload.attachments || [])];
    await this.verifyMultipleMediaStrict(mediaIdsToCheck, payload.teacherId);

    if (payload.examId) await this.verifyExamStrict(payload.examId, payload.teacherId);

    const section = await this.sectionsRepo.findByIdSafe(payload.sectionId, { select: '_id' });
    if (!section) throw new NotFoundException('Không tìm thấy Chương/Phần này.');

    const MAX_RETRIES = 3;
    let attempt = 0;

    while (attempt < MAX_RETRIES) {
      try {
        const nextOrder = await this.lessonsRepo.getNextOrder(payload.sectionId);
        
        const lessonData = {
          courseId: new Types.ObjectId(payload.courseId),
          sectionId: new Types.ObjectId(payload.sectionId),
          title: payload.title,
          order: nextOrder,
          isFreePreview: payload.isFreePreview,
          primaryVideoId: payload.primaryVideoId ? new Types.ObjectId(payload.primaryVideoId) : undefined,
          attachments: payload.attachments && payload.attachments.length > 0 ? payload.attachments.map(id => new Types.ObjectId(id)) : [],
          examId: payload.examId ? new Types.ObjectId(payload.examId) : undefined,
          examRules: payload.examRules || null,
          content: payload.content, 
        };

        const created = await this.lessonsRepo.createDocument(lessonData);
        await this.clearCourseCache(course.slug);
        
        const { _id, ...rest } = created as any;
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
    throw new ConflictException('Hệ thống đang xử lý nhiều thao tác cùng lúc, vui lòng thử lại.');
  }



  async updateLesson(payload: UpdateLessonPayload) {
    const course = await this.validateCourseOwnership(payload.courseId, payload.teacherId);
    
    const lesson = await this.lessonsRepo.findByIdSafe(payload.lessonId);
    if (!lesson || lesson.courseId.toString() !== payload.courseId) {
      throw new NotFoundException('Bài học không tồn tại trong khóa học này.');
    }

    // Gộp tất cả media IDs cần kiểm tra
    const mediaIdsToCheck = [payload.primaryVideoId, ...(payload.attachments || [])];
    await this.verifyMultipleMediaStrict(mediaIdsToCheck, payload.teacherId);

    if (payload.examId) await this.verifyExamStrict(payload.examId, payload.teacherId);

    const { courseId, lessonId, teacherId, ...updateData } = payload;
    
    // Ép kiểu chuẩn xác các trường Object Id, tránh rác data
    const sanitized: any = {};
    if (updateData.title !== undefined) sanitized.title = updateData.title;
    if (updateData.isFreePreview !== undefined) sanitized.isFreePreview = updateData.isFreePreview;
    if (updateData.content !== undefined) sanitized.content = updateData.content;
    
    if (updateData.primaryVideoId !== undefined) {
      sanitized.primaryVideoId = updateData.primaryVideoId ? new Types.ObjectId(updateData.primaryVideoId) : null;
    }
    if (updateData.attachments !== undefined) {
      sanitized.attachments = updateData.attachments.map(id => new Types.ObjectId(id));
    }
    if (updateData.examId !== undefined) {
      sanitized.examId = updateData.examId ? new Types.ObjectId(updateData.examId) : null;
    }
    
    // [MAX PING - Vá lỗi DB rỗng]: Hứng cấu hình thi cập nhật từ FE
    if (updateData.examRules !== undefined) {
      sanitized.examRules = updateData.examRules;
    }

    const updated = await this.lessonsRepo.updateByIdSafe(lessonId, { $set: sanitized });
    
    await this.clearCourseCache(course.slug);

    return { id: (updated as any)._id.toString(), ...updated };
  }

  async updateSection(payload: UpdateSectionPayload) {
    const course = await this.validateCourseOwnership(payload.courseId, payload.teacherId);
    
    const section = await this.sectionsRepo.findByIdSafe(payload.sectionId);
    if (!section || section.courseId.toString() !== payload.courseId) {
      throw new NotFoundException('Chương học không tồn tại trong khóa học này.');
    }

    const { courseId, sectionId, teacherId, ...updateData } = payload;
    const updated = await this.sectionsRepo.updateByIdSafe(sectionId, { $set: updateData });
    
    await this.clearCourseCache(course.slug);

    return { message: 'Cập nhật chương học thành công', id: (updated as any)._id.toString(), ...updated };
  }

  async deleteSection(courseId: string, sectionId: string, teacherId: string) {
    const course = await this.validateCourseOwnership(courseId, teacherId);

    if (!Types.ObjectId.isValid(sectionId)) throw new BadRequestException('ID chương học không hợp lệ.');

    const section = await this.sectionsRepo.findByIdSafe(sectionId, { select: 'courseId' });
    if (!section || section.courseId.toString() !== courseId) {
      throw new NotFoundException('Chương học không tồn tại trong khóa học này.');
    }

    await this.sectionsRepo.executeInTransaction(async () => {
      await this.lessonsRepo.deleteManySafe({ sectionId: new Types.ObjectId(sectionId) });
      await this.sectionsRepo.deleteOneSafe({ _id: new Types.ObjectId(sectionId) });
    });

    await this.clearCourseCache(course.slug);

    return { message: 'Đã xóa Chương và toàn bộ Bài học bên trong thành công.' };
  }

  // async updateLesson(payload: UpdateLessonPayload) {
  //   const course = await this.validateCourseOwnership(payload.courseId, payload.teacherId);
    
  //   const lesson = await this.lessonsRepo.findByIdSafe(payload.lessonId);
  //   if (!lesson || lesson.courseId.toString() !== payload.courseId) {
  //     throw new NotFoundException('Bài học không tồn tại trong khóa học này.');
  //   }

  //   // Gộp tất cả media IDs cần kiểm tra
  //   const mediaIdsToCheck = [payload.primaryVideoId, ...(payload.attachments || [])];
  //   await this.verifyMultipleMediaStrict(mediaIdsToCheck, payload.teacherId);

  //   if (payload.examId) await this.verifyExamStrict(payload.examId, payload.teacherId);

  //   const { courseId, lessonId, teacherId, ...updateData } = payload;
    
  //   // [CTO UPGRADE]: Ép kiểu chuẩn xác các trường Object Id, tránh rác data
  //   const sanitized: any = {};
  //   if (updateData.title !== undefined) sanitized.title = updateData.title;
  //   if (updateData.isFreePreview !== undefined) sanitized.isFreePreview = updateData.isFreePreview;
  //   if (updateData.content !== undefined) sanitized.content = updateData.content;
    
  //   if (updateData.primaryVideoId !== undefined) {
  //     sanitized.primaryVideoId = updateData.primaryVideoId ? new Types.ObjectId(updateData.primaryVideoId) : null;
  //   }
  //   if (updateData.attachments !== undefined) {
  //     sanitized.attachments = updateData.attachments.map(id => new Types.ObjectId(id));
  //   }
  //   if (updateData.examId !== undefined) {
  //     sanitized.examId = updateData.examId ? new Types.ObjectId(updateData.examId) : null;
  //   }

  //   const updated = await this.lessonsRepo.updateByIdSafe(lessonId, { $set: sanitized });
    
  //   await this.clearCourseCache(course.slug);

  //   return { id: (updated as any)._id.toString(), ...updated };
  // }

  async deleteLesson(courseId: string, lessonId: string, teacherId: string) {
    const course = await this.validateCourseOwnership(courseId, teacherId);
    const lesson = await this.lessonsRepo.findByIdSafe(lessonId, { select: 'courseId' });
    if (!lesson || lesson.courseId.toString() !== courseId) throw new NotFoundException('Bài học không hợp lệ.');

    await this.lessonsRepo.deleteOneSafe({ _id: new Types.ObjectId(lessonId) });
    
    await this.clearCourseCache(course.slug);
    
    return { message: 'Đã xóa bài học.' };
  }

  async reorderCurriculum(payload: ReorderPayload) {
    const course = await this.validateCourseOwnership(payload.courseId, payload.teacherId);

    await this.coursesRepo.executeInTransaction(async () => {
      if (payload.sections && payload.sections.length > 0) {
        await this.sectionsRepo.bulkUpdateOrderStrict(payload.courseId, payload.sections);
      }
      if (payload.lessons && payload.lessons.length > 0) {
        await this.lessonsRepo.bulkUpdateOrderAndSectionStrict(payload.courseId, payload.lessons);
      }
    });

    await this.clearCourseCache(course.slug);

    return { message: 'Cập nhật cấu trúc bài giảng thành công.' };
  }
}