import { BadRequestException, ConflictException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { ExamsRepository } from './exams.repository';
import { ExamPapersRepository } from './exam-papers.repository';
import { QuestionsRepository } from '../questions/questions.repository';
import { PaperUpdateAction } from './dto/update-paper-questions.dto';
import { CreateExamAssignmentDto } from './dto/create-exam-assignment.dto';

@Injectable()
export class ExamsService {
  private readonly logger = new Logger(ExamsService.name);
  classesRepo: any;
  examAssignmentsRepo: any;

  constructor(
    private readonly examsRepo: ExamsRepository,
    private readonly examPapersRepo: ExamPapersRepository,
    private readonly questionsRepo: QuestionsRepository,
  ) { }

  async initManualExam(teacherId: string, payload: any) {
    const exam = await this.examsRepo.create({
      ...payload,
      teacherId: new Types.ObjectId(teacherId),
      subjectId: new Types.ObjectId(payload.subjectId),
      type: 'PRACTICE', 
      isPublished: false,
    } as any);

    const paper = await this.examPapersRepo.create({
      examId: exam._id,
      code: '101', // Đã sửa: paperCode -> code
      questions: [], // Đã sửa: questionsSnapshot -> questions
    } as any);

    this.logger.log(`[Manual Builder] Giáo viên ${teacherId} đã khởi tạo Exam: ${exam._id}`);

    return {
      examId: exam._id,
      paperId: paper._id,
      message: 'Khởi tạo thành công. Sẵn sàng thêm câu hỏi.'
    };
  }

  async updatePaperQuestions(paperId: string, teacherId: string, action: PaperUpdateAction, questionId: string) {
    if (!Types.ObjectId.isValid(paperId) || !Types.ObjectId.isValid(questionId)) {
      throw new BadRequestException('ID không hợp lệ.');
    }

    const paperObjectId = new Types.ObjectId(paperId);
    const questionObjectId = new Types.ObjectId(questionId);

    const paper = await (this.examPapersRepo as any).model
      .findById(paperObjectId)
      .populate('examId', 'teacherId isPublished')
      .exec();

    if (!paper) throw new NotFoundException('Mã đề không tồn tại.');

    if (paper.examId.teacherId.toString() !== teacherId) {
      throw new ForbiddenException('Bạn không có quyền sửa đề thi này.');
    }

    if (paper.examId.isPublished) {
      throw new BadRequestException('Đề thi đã được giao cho lớp. Không thể thêm/xóa câu hỏi nữa.');
    }

    if (action === PaperUpdateAction.ADD) {
      // Đã sửa: questionsSnapshot -> questions
      const isExist = paper.questions.some(
        (q: any) => q.originalId.toString() === questionId
      );
      if (isExist) throw new ConflictException('Câu hỏi này đã có trong đề thi.');

      const question = await this.questionsRepo.findOne({ _id: questionObjectId } as any);
      if (!question) throw new NotFoundException('Câu hỏi gốc không tồn tại trong Ngân hàng.');

      // Đã cập nhật: Map data snapshot theo schema Question mới
      const snapshot = {
        originalId: question._id,
        content: question.content,
        answers: question.answers,
        difficultyLevel: question.difficultyLevel,
      };

      await (this.examPapersRepo as any).model.updateOne(
        { _id: paperObjectId },
        { $push: { questions: snapshot } } // Đã sửa: questionsSnapshot -> questions
      );

      return { message: 'Đã thêm câu hỏi vào đề.' };
    }

    if (action === PaperUpdateAction.REMOVE) {
      await (this.examPapersRepo as any).model.updateOne(
        { _id: paperObjectId },
        { $pull: { questions: { originalId: questionObjectId } } } // Đã sửa: questionsSnapshot -> questions
      );

      return { message: 'Đã xóa câu hỏi khỏi đề.' };
    }
  }

  async assignExamToClass(teacherId: string, dto: CreateExamAssignmentDto) {
    const { examId, classId, startTime, endTime, timeLimit, maxAttempts } = dto;

    if (new Date(startTime) >= new Date(endTime)) {
      throw new BadRequestException('Thời gian kết thúc phải diễn ra sau thời gian bắt đầu.');
    }

    const targetClass = await this.classesRepo.findOne({ _id: new Types.ObjectId(classId) } as any);
    if (!targetClass || targetClass.teacherId.toString() !== teacherId) {
      throw new ForbiddenException('Bạn không có quyền giao đề cho lớp học này.');
    }

    const exam = await this.examsRepo.findOne({ _id: new Types.ObjectId(examId) } as any);
    if (!exam || exam.teacherId.toString() !== teacherId) {
      throw new ForbiddenException('Bạn không có quyền sử dụng đề thi này.');
    }

    const paper = await (this.examPapersRepo as any).model.findOne({ examId: exam._id }).lean();
    
    // Đã sửa: questionsSnapshot.length -> questions.length
    if (!paper || paper.questions.length === 0) {
      throw new BadRequestException('Không thể giao một đề thi rỗng. Vui lòng thêm câu hỏi trước.');
    }

    const assignment = await this.examAssignmentsRepo.create({
      examId: exam._id,
      classId: targetClass._id,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      timeLimit,
      maxAttempts,
    } as any);

    await (this.examsRepo as any).model.updateOne(
      { _id: exam._id },
      { $set: { isPublished: true } } 
    );

    this.logger.log(`[Assign] Giáo viên ${teacherId} đã giao đề ${examId} cho lớp ${classId}`);
    return { message: 'Giao đề thi thành công.', assignmentId: assignment._id };
  }
}