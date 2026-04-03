import {
  Injectable,
  Logger,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { MediaRepository } from '../../media/media.repository';
import { MediaStatus } from '../../media/schemas/media.schema';
import {
  UsersRepository,
  PopulatedSubscriptionPlan,
} from '../../users/users.repository';
import { CoursesRepository } from '../courses.repository';
import { ValidateCourseSubmissionPayload } from '../interfaces/course.interface';

@Injectable()
export class CourseValidatorService {
  private readonly logger = new Logger(CourseValidatorService.name);

  constructor(
    private readonly mediaRepo: MediaRepository,
    private readonly usersRepo: UsersRepository,
    private readonly coursesRepo: CoursesRepository,
  ) {}

  async validateTeacherSubjectAccess(
    teacherId: string,
    subjectId: string,
  ): Promise<void> {
    const teacher = await this.usersRepo.findByIdSafe(teacherId, {
      select: 'subjectIds',
    });
    if (!teacher || !teacher.subjectIds || teacher.subjectIds.length === 0) {
      throw new BadRequestException(
        'Hồ sơ giáo viên chưa được cấu hình bộ môn chuyên trách.',
      );
    }

    const hasAccess = teacher.subjectIds.some(
      (id) => id.toString() === subjectId,
    );
    if (!hasAccess) {
      throw new ForbiddenException(
        'Bạn không có quyền tạo khóa học cho bộ môn này.',
      );
    }
  }

  async verifyMediaOwnershipStrict(
    mediaIds: (string | null | undefined)[],
    teacherId: string,
  ): Promise<void> {
    const validIds = mediaIds.filter(
      (id): id is string => !!id && Types.ObjectId.isValid(id),
    );
    if (validIds.length === 0) return;

    const medias = await this.mediaRepo.modelInstance
      .find({
        _id: { $in: validIds.map((id) => new Types.ObjectId(id)) },
      })
      .lean()
      .select('uploadedBy status originalName')
      .exec();

    if (medias.length !== validIds.length) {
      throw new BadRequestException(
        'Một hoặc nhiều tệp đính kèm không tồn tại trong hệ thống.',
      );
    }

    for (const media of medias) {
      if (media.uploadedBy.toString() !== teacherId) {
        this.logger.warn(
          `[SECURITY ALERT] User ${teacherId} cố gắng gán Media ${media._id} của người khác!`,
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

  async verifyExamOwnershipStrict(
    examId: string | undefined,
    teacherId: string,
  ): Promise<void> {
    if (!examId || !Types.ObjectId.isValid(examId)) return;

    // TODO: Khi ExamsModule sẵn sàng, mở comment logic dưới đây
    // const exam = await this.examsRepo.findByIdSafe(examId, { select: 'teacherId' });
    // if (!exam) throw new BadRequestException('Đề thi không tồn tại.');
    // if (exam.teacherId.toString() !== teacherId) {
    //   throw new ForbiddenException('Bạn không có quyền sử dụng đề thi này.');
    // }
  }

  async validateCourseSubmissionRules(
    payload: ValidateCourseSubmissionPayload,
  ): Promise<void> {
    const { teacherId, price } = payload;

    const teacher = await this.usersRepo.findUserWithSubscription(teacherId);

    if (!teacher) {
      throw new BadRequestException('Giáo viên không tồn tại trong hệ thống.');
    }

    const currentPlan =
      teacher.currentPlanId as unknown as PopulatedSubscriptionPlan;
    const planExpiresAt = teacher.planExpiresAt;
    const now = new Date();

    if (!currentPlan) {
      throw new ForbiddenException(
        'Tài khoản của bạn chưa đăng ký gói cước. Vui lòng nâng cấp để xuất bản khóa học.',
      );
    }

    if (!currentPlan.isActive) {
      throw new ForbiddenException(
        `Gói cước "${currentPlan.name}" hiện đã ngừng cung cấp hoặc bị vô hiệu hóa. Vui lòng liên hệ Admin.`,
      );
    }

    if (!planExpiresAt || new Date(planExpiresAt) <= now) {
      throw new ForbiddenException(
        `Gói cước "${currentPlan.name}" của bạn đã hết hạn. Vui lòng gia hạn để tiếp tục xuất bản khóa học.`,
      );
    }

    if (price > 0 && !currentPlan.canCreatePaidCourse) {
      throw new ForbiddenException(
        `Gói cước "${currentPlan.name}" không hỗ trợ tạo khóa học Trả phí. Vui lòng nâng cấp gói PRO hoặc ENTERPRISE.`,
      );
    }

    if (!currentPlan.isUnlimitedCourses) {
      const activeCoursesCount =
        await this.coursesRepo.countTeacherActiveCourses(teacherId);
      const maxAllowed = currentPlan.maxCourses;

      if (activeCoursesCount >= maxAllowed) {
        throw new ForbiddenException(
          `Bạn đã đạt giới hạn xuất bản khóa học (${activeCoursesCount}/${maxAllowed}) của gói "${currentPlan.name}". Vui lòng nâng cấp gói cước để tạo thêm.`,
        );
      }
    }
  }
}
