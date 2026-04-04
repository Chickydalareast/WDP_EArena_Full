import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  OnModuleInit
} from '@nestjs/common';
import { Types, UpdateQuery } from 'mongoose';
import { ClassesRepository } from './classes.repository';
import { ClassMembersRepository } from './class-members.repository';
import { ClassDocument } from './schemas/class.schema';
import { JoinStatus } from './schemas/class-member.schema';
import { RedisService } from '../../common/redis/redis.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export type CreateClassPayload = {
  name: string;
  description?: string;
  coverImageUrl?: string;
  isPublic?: boolean;
  teacherId: string;
};

export type UpdateClassPayload = {
  name?: string;
  description?: string;
  coverImageUrl?: string;
  isPublic?: boolean;
  isLocked?: boolean;
};

export type SearchClassQuery = {
  keyword?: string;
  page?: number;
  limit?: number;
};

@Injectable()
export class ClassesService implements OnModuleInit {
  private readonly logger = new Logger(ClassesService.name);

  constructor(
    private readonly classesRepo: ClassesRepository,
    private readonly classMembersRepo: ClassMembersRepository,
    private readonly redisService: RedisService,
    @InjectQueue('classes_queue') private readonly classesQueue: Queue,
  ) { }

  private generateRandomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length: 6 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
  }

  async createClass(payload: CreateClassPayload): Promise<ClassDocument> {
    const { teacherId, coverImageUrl, ...rest } = payload;
    if (!teacherId || !Types.ObjectId.isValid(teacherId)) throw new BadRequestException('ID giáo viên không hợp lệ.');

    const MAX_RETRIES = 5;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      const code = this.generateRandomCode();
      try {
        const classData = {
          ...rest,
          code,
          teacherId: new Types.ObjectId(teacherId),
          coverImageUrl: coverImageUrl || null,
          isLocked: false,
          isPublic: payload.isPublic ?? true,
        };
        return await this.classesRepo.createDocument(classData);
      } catch (error: unknown) {
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
          this.logger.warn(`Va chạm mã Code [${code}]. Đang retry lần ${attempt}...`);
          if (attempt === MAX_RETRIES) throw new InternalServerErrorException('Hệ thống đang quá tải, không thể khởi tạo mã lớp học.');
          continue;
        }
        throw error;
      }
    }
    throw new InternalServerErrorException('Lỗi không xác định khi tạo lớp học.');
  }

  async searchPublicClasses(query: SearchClassQuery) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, query.limit || 20);
    const keyword = query.keyword ? query.keyword.trim().toLowerCase() : '';
    const cacheKey = `classes_search:kw_${keyword}:p_${page}:l_${limit}`;

    if (page <= 3) {
      const cachedData = await this.redisService.get(cacheKey);
      if (cachedData) {
        this.logger.debug(`[Cache Hit] Trả về dữ liệu lớp học từ Redis: ${cacheKey}`);
        return JSON.parse(cachedData);
      }
    }

    const result = await this.classesRepo.searchPaginatedPublicClasses(query);

    if (page <= 3 && result.data.length > 0) {
      await this.redisService.set(cacheKey, JSON.stringify(result), 300);
    }
    return result;
  }

  async requestJoin(classId: string, studentId: string) {
    if (!Types.ObjectId.isValid(classId)) throw new BadRequestException('Mã lớp học không hợp lệ.');

    const targetClass = await this.classesRepo.findByIdSafe(classId, { select: 'isLocked teacherId' });
    if (!targetClass) throw new NotFoundException('Lớp học không tồn tại.');
    if (targetClass.isLocked) throw new ForbiddenException('Lớp học đã bị khóa.');
    if (targetClass.teacherId.toString() === studentId) throw new BadRequestException('Giáo viên không thể tự tham gia lớp của mình.');

    const existingMember = await this.classMembersRepo.findExistingMember(classId, studentId);

    if (existingMember) {
      if (existingMember.status === JoinStatus.APPROVED) throw new ConflictException('Bạn đã ở trong lớp này rồi.');
      if (existingMember.status === JoinStatus.PENDING) throw new ConflictException('Yêu cầu đang chờ duyệt.');

      if (existingMember.status === JoinStatus.REJECTED) {
        await this.classMembersRepo.updateByIdSafe(existingMember._id.toString(), { $set: { status: JoinStatus.PENDING } });
        return { message: 'Đã gửi lại yêu cầu tham gia lớp.' };
      }
    }

    try {
      await this.classMembersRepo.createDocument({
        classId: new Types.ObjectId(classId),
        studentId: new Types.ObjectId(studentId),
        status: JoinStatus.PENDING,
      });
      return { message: 'Đã gửi yêu cầu tham gia lớp.' };
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
        throw new ConflictException('Yêu cầu đã tồn tại trong hệ thống.');
      }
      throw new InternalServerErrorException('Lỗi hệ thống khi gửi yêu cầu tham gia.');
    }
  }

  async joinByCode(code: string, studentId: string) {
    // FIX: Dùng đúng tên hàm
    const targetClass = await this.classesRepo.findByCode(code);
    if (!targetClass) throw new NotFoundException('Mã lớp học không tồn tại.');
    if (targetClass.isLocked) throw new ForbiddenException('Lớp học đã bị khóa.');
    if (targetClass.teacherId.toString() === studentId) throw new BadRequestException('Giáo viên không thể tự tham gia lớp của mình.');

    const existingMember = await this.classMembersRepo.findExistingMember(targetClass._id.toString(), studentId);

    if (existingMember) {
      if (existingMember.status === JoinStatus.APPROVED) throw new ConflictException('Bạn đã là thành viên của lớp này.');
      await this.classMembersRepo.updateByIdSafe(existingMember._id.toString(), { $set: { status: JoinStatus.APPROVED } });
      return { message: 'Tham gia lớp học thành công.' };
    }

    try {
      await this.classMembersRepo.createDocument({
        classId: new Types.ObjectId(targetClass._id),
        studentId: new Types.ObjectId(studentId),
        status: JoinStatus.APPROVED,
      });
      return { message: 'Tham gia lớp học thành công.' };
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
        throw new ConflictException('Hệ thống đang xử lý yêu cầu của bạn, vui lòng không thao tác quá nhanh.');
      }
      throw error;
    }
  }

  async reviewMember(classId: string, teacherId: string, targetStudentId: string, status: JoinStatus) {
    if (status === JoinStatus.PENDING) throw new BadRequestException('Trạng thái duyệt không hợp lệ.');
    if (!Types.ObjectId.isValid(classId) || !Types.ObjectId.isValid(targetStudentId)) throw new BadRequestException('Mã ID không hợp lệ.');

    const targetClass = await this.classesRepo.findByIdSafe(classId, { select: 'teacherId' });
    if (!targetClass) throw new NotFoundException('Lớp học không tồn tại.');
    if (targetClass.teacherId.toString() !== teacherId) throw new ForbiddenException('Bạn không phải giáo viên chủ nhiệm của lớp này.');

    // FIX: Đã tạo hàm bên Repository và gọi chuẩn
    const updated = await this.classMembersRepo.updateMemberStatus(classId, targetStudentId, status);
    if (!updated) throw new NotFoundException('Không tìm thấy học sinh trong danh sách chờ.');

    return { message: `Đã ${status === JoinStatus.APPROVED ? 'chấp nhận' : 'từ chối'} học sinh thành công.` };
  }

  async getClassPreview(classId: string, userId?: string) {
    if (!Types.ObjectId.isValid(classId)) throw new BadRequestException('Mã lớp học không hợp lệ.');

    // FIX: Dùng đúng tên hàm
    const classObj = await this.classesRepo.getClassPreview(classId);
    if (!classObj) throw new NotFoundException('Lớp học không tồn tại.');

    const isOwner = userId && classObj.teacherId && classObj.teacherId.toString() === userId;
    let joinStatus = null;
    
    if (userId && !isOwner) {
      const existingMember = await this.classMembersRepo.findExistingMember(classId, userId);
      if (existingMember) joinStatus = existingMember.status;
    }

    const { teacherId, code, ...rest } = classObj;
    return {
      ...rest,
      code: isOwner ? code : undefined, 
      teacher: teacherId,
      joinStatus,
    };
  }

  async getClassMembers(classId: string, teacherId: string, queryDto: { status?: JoinStatus; page: number; limit: number }) {
    if (!Types.ObjectId.isValid(classId)) throw new BadRequestException('Mã lớp học không hợp lệ.');

    const classObj = await this.classesRepo.findByIdSafe(classId, { select: 'teacherId' });
    if (!classObj) throw new NotFoundException('Lớp học không tồn tại.');
    if (classObj.teacherId.toString() !== teacherId) throw new ForbiddenException('Chỉ giáo viên chủ nhiệm mới có quyền xem danh sách này.');

    // FIX: Dùng đúng tên hàm
    return this.classMembersRepo.findMembersWithDetailsPaginated(classId, queryDto);
  }

  async getClassesByTeacher(teacherId: string) {
    if (!Types.ObjectId.isValid(teacherId)) throw new BadRequestException('ID giáo viên không hợp lệ.');
    // FIX: Dùng đúng tên hàm
    return this.classesRepo.findClassesByTeacher(teacherId);
  }

  async getMyClasses(teacherId: string) {
    if (!Types.ObjectId.isValid(teacherId)) throw new BadRequestException('ID giáo viên không hợp lệ.');
    // FIX: Dùng đúng tên hàm
    return this.classesRepo.getTeacherClassesWithMetrics(teacherId);
  }

  async getClassDetailForTeacher(classId: string, teacherId: string) {
    if (!Types.ObjectId.isValid(classId)) throw new BadRequestException('Mã lớp học không hợp lệ.');

    const classInfo = await this.classesRepo.findByIdSafe(classId, { select: 'teacherId' });
    if (!classInfo) throw new NotFoundException('Lớp học không tồn tại.');
    if (classInfo.teacherId.toString() !== teacherId) throw new ForbiddenException('Bạn không có quyền truy cập quản trị lớp này.');

    // FIX: Dùng đúng tên hàm
    const classDetail = await this.classesRepo.getClassAdminDetails(classId);
    if (!classDetail) throw new NotFoundException('Dữ liệu lớp học bị lỗi.');
    return classDetail;
  }

  async updateClass(classId: string, teacherId: string, payload: UpdateClassPayload) {
    if (!Types.ObjectId.isValid(classId)) throw new BadRequestException('Mã lớp học không hợp lệ.');

    const targetClass = await this.classesRepo.findByIdSafe(classId, { select: 'teacherId' });
    if (!targetClass) throw new NotFoundException('Lớp học không tồn tại.');
    if (targetClass.teacherId.toString() !== teacherId) throw new ForbiddenException('Chỉ giáo viên chủ nhiệm mới được cập nhật lớp học.');

    // FIX: TS2322 - Type-safe update object building không dùng vòng lặp trick
    const updateData: UpdateQuery<ClassDocument> = {};
    if (payload.name !== undefined) updateData.name = payload.name;
    if (payload.description !== undefined) updateData.description = payload.description;
    if (payload.coverImageUrl !== undefined) updateData.coverImageUrl = payload.coverImageUrl;
    if (payload.isPublic !== undefined) updateData.isPublic = payload.isPublic;
    if (payload.isLocked !== undefined) updateData.isLocked = payload.isLocked;

    const updated = await this.classesRepo.updateByIdSafe(classId, { $set: updateData });
    if (!updated) throw new InternalServerErrorException('Cập nhật thất bại.');

    const { _id, ...rest } = updated;
    return { id: _id.toString(), ...rest };
  }

  async deleteClass(classId: string, teacherId: string) {
    if (!Types.ObjectId.isValid(classId)) throw new BadRequestException('Mã lớp học không hợp lệ.');

    const targetClass = await this.classesRepo.findByIdSafe(classId, { select: 'teacherId' });
    if (!targetClass) throw new NotFoundException('Lớp học không tồn tại.');
    if (targetClass.teacherId.toString() !== teacherId) throw new ForbiddenException('Chỉ giáo viên chủ nhiệm mới được xóa lớp học.');

    // FIX: Gọi đúng phương thức của AbstractRepository
    await this.classesRepo.executeInTransaction(async () => {
      await this.classesRepo.deleteOneSafe({ _id: new Types.ObjectId(classId) });
      await this.classMembersRepo.deleteManySafe({ classId: new Types.ObjectId(classId) });
    });

    return { message: 'Đã xóa lớp học thành công.' };
  }

  async kickStudent(classId: string, teacherId: string, studentId: string) {
    if (!Types.ObjectId.isValid(classId) || !Types.ObjectId.isValid(studentId)) throw new BadRequestException('ID không hợp lệ.');

    const targetClass = await this.classesRepo.findByIdSafe(classId, { select: 'teacherId' });
    if (!targetClass) throw new NotFoundException('Lớp học không tồn tại.');
    if (targetClass.teacherId.toString() !== teacherId) throw new ForbiddenException('Bạn không có quyền đuổi học sinh khỏi lớp này.');

    // FIX: Dùng đúng tên hàm
    const updatedMember = await this.classMembersRepo.updateMemberStatus(classId, studentId, JoinStatus.REJECTED);
    if (!updatedMember) throw new NotFoundException('Không tìm thấy học sinh trong lớp.');
    
    return { message: 'Đã mời học sinh khỏi lớp.' };
  }

  async getJoinedClasses(userId: string, page: number, limit: number) {
    if (!Types.ObjectId.isValid(userId)) throw new BadRequestException('User ID không hợp lệ.');
    // FIX: Dùng đúng tên hàm
    return this.classMembersRepo.getJoinedClassesPaginated(userId, page, limit);
  }

  async getStudentWorkspace(classId: string, studentId: string) {
    if (!Types.ObjectId.isValid(classId) || !Types.ObjectId.isValid(studentId)) throw new BadRequestException('Mã ID không hợp lệ.');

    // FIX: Dùng đúng tên hàm
    const workspaceData = await this.classMembersRepo.getStudentWorkspaceData(classId, studentId);
    if (!workspaceData) throw new ForbiddenException('Bạn không phải là thành viên chính thức của lớp này hoặc lớp không tồn tại.');

    return workspaceData;
  }

  async leaveClass(classId: string, studentId: string) {
    if (!Types.ObjectId.isValid(classId)) throw new BadRequestException('Mã lớp học không hợp lệ.');

    const existingMember = await this.classMembersRepo.findExistingMember(classId, studentId);
    if (!existingMember || existingMember.status !== JoinStatus.APPROVED) {
      throw new BadRequestException('Bạn chưa tham gia lớp này nên không thể rời đi.');
    }

    await this.classMembersRepo.updateByIdSafe(existingMember._id.toString(), { $set: { status: JoinStatus.REJECTED } });
    return { message: 'Đã rời lớp học thành công.' };
  }

  async onModuleInit() {
    await this.classesQueue.add(
      'auto_rotate_code',
      {},
      {
        repeat: { pattern: '0 2 * * 1' }, 
        jobId: 'auto_rotate_code_job', 
        removeOnComplete: true,
        removeOnFail: false,
      },
    );
    this.logger.log('Đã nạp Job "auto_rotate_code" vào BullMQ.');
  }

  async resetClassCode(classId: string, teacherId: string) {
    if (!Types.ObjectId.isValid(classId)) throw new BadRequestException('Mã lớp học không hợp lệ.');

    const targetClass = await this.classesRepo.findByIdSafe(classId, { select: 'teacherId' });
    if (!targetClass) throw new NotFoundException('Lớp học không tồn tại.');
    if (targetClass.teacherId.toString() !== teacherId) throw new ForbiddenException('Chỉ giáo viên chủ nhiệm mới được đổi mã lớp.');

    const MAX_RETRIES = 5;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const newCode = this.generateRandomCode();
        await this.classesRepo.updateByIdSafe(classId, { $set: { code: newCode } });
        return { message: 'Đổi mã bảo mật thành công.', newCode };
      } catch (error: unknown) {
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000 && attempt < MAX_RETRIES) continue;
        throw new InternalServerErrorException('Lỗi hệ thống khi sinh mã mới, vui lòng thử lại sau.');
      }
    }
  }

  async handleAutoRotateCodes() {
    this.logger.log('[Worker] Bắt đầu tiến trình Auto-Rotate mã bảo mật các lớp học...');
    try {
      const modifiedCount = await this.classesRepo.rotateAllActiveCodes(() => this.generateRandomCode());
      this.logger.log(`[Worker] Auto-Rotate hoàn tất. Đã đổi mã cho ${modifiedCount} lớp học.`);
    } catch (error: unknown) {
      this.logger.error(`[Worker] Lỗi cục bộ khi Auto-Rotate: ${error instanceof Error ? error.message : error}`);
    }
  }
}