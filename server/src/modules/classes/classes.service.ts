import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException
} from '@nestjs/common';
import { Types } from 'mongoose';
import { ClassesRepository, ClassResponse } from './classes.repository';
import { ClassMembersRepository } from './class-members.repository';
import { ClassDocument } from './schemas/class.schema';
import { JoinStatus } from './schemas/class-member.schema';

//import { ExamAssignmentsRepository } from '../exams/exam-assignments.repository'; 

export type CreateClassPayload = {
  name: string;
  description?: string;
  coverImageId?: string;
  isPublic?: boolean;
  teacherId: string;
};

export type SearchClassQuery = {
  keyword?: string;
  page?: number;
  limit?: number;
};

@Injectable()
export class ClassesService {
  private readonly logger = new Logger(ClassesService.name);

  constructor(
    private readonly classesRepo: ClassesRepository,
    private readonly classMembersRepo: ClassMembersRepository,
    //private readonly examAssignmentsRepo: ExamAssignmentsRepository,
  ) { }

  private generateRandomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length: 6 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
  }

  async createClass(payload: CreateClassPayload): Promise<ClassDocument> {
    const { teacherId, coverImageId, ...rest } = payload;

    if (!teacherId || !Types.ObjectId.isValid(teacherId)) {
      throw new BadRequestException('ID giáo viên không hợp lệ hoặc bị thiếu.');
    }

    const MAX_RETRIES = 5;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      const code = this.generateRandomCode();

      try {
        const classData = {
          ...rest,
          code,
          teacherId: new Types.ObjectId(teacherId),
          coverImageId: coverImageId ? new Types.ObjectId(coverImageId) : null,
          isLocked: false,
          isPublic: payload.isPublic ?? true,
        };

        return await this.classesRepo.create(classData as any);
      } catch (error: any) {
        if (error.code === 11000 && error.keyPattern && error.keyPattern.code) {
          this.logger.warn(`Va chạm mã Code [${code}] khi tạo lớp. Đang retry lần ${attempt}...`);
          if (attempt === MAX_RETRIES) {
            throw new InternalServerErrorException('Hệ thống đang quá tải, không thể khởi tạo mã lớp học. Vui lòng thử lại.');
          }
          continue;
        }
        throw error;
      }
    }

    throw new InternalServerErrorException('Unexpected error in createClass.');
  }

  async searchPublicClasses(query: SearchClassQuery): Promise<any[]> {
    return this.classesRepo.searchPublicClasses(query);
  }

  async requestJoin(classId: string, studentId: string) {
    if (!Types.ObjectId.isValid(classId)) throw new BadRequestException('Mã lớp học không hợp lệ.');

    const targetClass = await this.classesRepo.findOne({ _id: new Types.ObjectId(classId) } as any);

    if (targetClass.isLocked) throw new ForbiddenException('Lớp học đã bị khóa, không nhận thêm thành viên.');
    if (targetClass.teacherId.toString() === studentId) throw new BadRequestException('Giáo viên không thể tự tham gia lớp của mình.');

    const existingMember = await this.classMembersRepo.findExistingMember(classId, studentId);

    if (existingMember) {
      throw new ConflictException(`Bạn đã gửi yêu cầu hoặc đã ở trong lớp này (Trạng thái: ${existingMember.status}).`);
    }

    return this.classMembersRepo.create({
      classId: targetClass._id,
      studentId: new Types.ObjectId(studentId),
      status: JoinStatus.PENDING,
      isActive: true,
    } as any);
  }

  async joinByCode(code: string, studentId: string) {
    const targetClass = await this.classesRepo.findByCode(code);
    if (!targetClass) throw new NotFoundException('Mã lớp học không tồn tại.');
    if (targetClass.isLocked) throw new ForbiddenException('Lớp học đã bị khóa.');
    if (targetClass.teacherId.toString() === studentId) throw new BadRequestException('Giáo viên không thể tự tham gia lớp của mình.');

    const existingMember = await this.classMembersRepo.findExistingMember(targetClass._id.toString(), studentId);

    if (existingMember) {
      if (existingMember.status === JoinStatus.APPROVED) throw new ConflictException('Bạn đã là thành viên của lớp này.');

      return this.classMembersRepo.findOneAndUpdate(
        { _id: new Types.ObjectId(existingMember._id) } as any,
        { $set: { status: JoinStatus.APPROVED } } as any
      );
    }

    return this.classMembersRepo.create({
      classId: targetClass._id,
      studentId: new Types.ObjectId(studentId),
      status: JoinStatus.APPROVED,
      isActive: true,
    } as any);
  }

  async reviewMember(classId: string, teacherId: string, targetStudentId: string, status: JoinStatus) {
    if (status === JoinStatus.PENDING) throw new BadRequestException('Trạng thái duyệt không hợp lệ.');
    if (!Types.ObjectId.isValid(classId)) throw new BadRequestException('Mã lớp học không hợp lệ.');

    const targetClass = await this.classesRepo.findOne({ _id: new Types.ObjectId(classId) } as any);

    if (targetClass.teacherId.toString() !== teacherId) {
      throw new ForbiddenException('Bạn không phải giáo viên chủ nhiệm của lớp này.');
    }

    await this.classMembersRepo.findOneAndUpdate(
      {
        classId: targetClass._id,
        studentId: new Types.ObjectId(targetStudentId)
      } as any,
      { $set: { status } } as any
    );

    return { message: `Đã ${status === JoinStatus.APPROVED ? 'chấp nhận' : 'từ chối'} học sinh thành công.` };
  }

  async getClassPreview(classId: string) {
    if (!Types.ObjectId.isValid(classId)) {
      throw new BadRequestException('Mã lớp học không hợp lệ.');
    }

    const classObj = await this.classesRepo.getClassPreview(classId);

    if (!classObj) {
      throw new NotFoundException('Lớp học không tồn tại.');
    }

    const { teacherId, ...rest } = classObj;
    return {
      ...rest,
      teacher: teacherId,
    };
  }

  async getClassMembers(classId: string, teacherId: string, status?: JoinStatus) {
    if (!Types.ObjectId.isValid(classId)) {
      throw new BadRequestException('Mã lớp học không hợp lệ.');
    }

    const classObj = await this.classesRepo.findOne({ _id: new Types.ObjectId(classId) } as any);

    if (classObj.teacherId.toString() !== teacherId) {
      throw new ForbiddenException('Chỉ giáo viên chủ nhiệm mới có quyền xem danh sách này.');
    }

    const members = await this.classMembersRepo.findMembersWithDetails(classId, status);

    return members.map((member: any) => ({
      joinRequestId: member._id,
      status: member.status,
      requestedAt: member.createdAt,
      student: member.studentId,
    }));
  }

  async getClassesByTeacher(teacherId: string): Promise<ClassResponse[]> {
    if (!Types.ObjectId.isValid(teacherId)) {
      throw new BadRequestException('ID giáo viên không hợp lệ.');
    }

    return this.classesRepo.findClassesByTeacher(teacherId);
  }

  //   async getClassAssignments(classId: string, userId: string) {
  //     if (!Types.ObjectId.isValid(classId)) throw new BadRequestException('ID lớp không hợp lệ.');
  //     const classObjectId = new Types.ObjectId(classId);

  //     const classObj = await this.classesRepo.findOne({ _id: classObjectId } as any);
  //     if (!classObj) throw new NotFoundException('Lớp học không tồn tại.');

  //     const isTeacher = classObj.teacherId.toString() === userId;

  //     if (!isTeacher) {
  //       const member = await this.classMembersRepo.findExistingMember(classId, userId);

  //       if (!member || member.status !== JoinStatus.APPROVED) {
  //         throw new ForbiddenException('Bạn chưa là thành viên chính thức của lớp này.');
  //       }
  //     }

  //     const assignments = await (this.examAssignmentsRepo as any).model
  //       .find({ classId: classObjectId })
  //       .populate({
  //         path: 'examId',
  //         select: 'title description isPublished' 
  //       })
  //       .sort({ createdAt: -1 })
  //       .lean()
  //       .exec();

  //     return assignments.map((assign: any) => ({
  //       assignmentId: assign._id,
  //       examTitle: assign.examId?.title,
  //       description: assign.examId?.description,
  //       startTime: assign.startTime,
  //       endTime: assign.endTime,
  //       timeLimit: assign.timeLimit,
  //     }));
  //   }
}