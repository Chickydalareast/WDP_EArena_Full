import { BadRequestException, ConflictException, ForbiddenException, Injectable, Logger, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';

import { ExamsRepository } from './exams.repository';
import { ExamPapersRepository } from './exam-papers.repository';
import { QuestionsRepository } from '../questions/questions.repository';
import { QuestionFoldersRepository } from '../questions/question-folders.repository';
import { CoursesRepository } from '../courses/courses.repository';
import { ExamSubmissionsRepository } from './exam-submissions.repository';
import { UsersService } from '../users/users.service';
import { ExamMode, ExamType } from './schemas/exam.schema';
import { PaperUpdateAction } from './dto';

export type InitManualExamPayload = {
  title: string;
  description?: string;
  totalScore: number;
};

export type UpdatePaperQuestionsPayload = {
  action: PaperUpdateAction;
  questionId?: string;
  questionIds?: string[];
};

export type GetExamsPayload = { page: number; limit: number; search?: string; type?: ExamType; subjectId?: string; };
export type UpdateExamPayload = { title?: string; description?: string; totalScore?: number; };
export type GetLeaderboardPayload = { courseId: string; lessonId: string; page: number; limit: number; search?: string; };

@Injectable()
export class ExamsService {
  private readonly logger = new Logger(ExamsService.name);

  constructor(
    private readonly examsRepo: ExamsRepository,
    private readonly examPapersRepo: ExamPapersRepository,
    private readonly questionsRepo: QuestionsRepository,
    private readonly coursesRepo: CoursesRepository,
    private readonly usersService: UsersService,
    private readonly examSubmissionsRepo: ExamSubmissionsRepository,
    private readonly foldersRepo: QuestionFoldersRepository,
    @InjectConnection() private readonly connection: Connection,
  ) { }

  async initManualExam(teacherId: string, payload: InitManualExamPayload) {
    const teacher = await this.usersService.findById(teacherId);
    if (!teacher || !teacher.subjectIds?.length) {
      throw new BadRequestException('Giáo viên chưa được phân công môn học nào.');
    }

    const targetSubjectId = teacher.subjectIds[0];

    return this.examsRepo.executeInTransaction(async () => {
      const folder = await this.foldersRepo.createDocument({
        name: `Tài nguyên: ${payload.title}`,
        description: 'Thư mục tự động sinh để chứa câu hỏi cho đề thi này.',
        ownerId: new Types.ObjectId(teacherId),
        parentId: null,
      });

      const exam = await this.examsRepo.createDocument({
        title: payload.title,
        description: payload.description,
        totalScore: payload.totalScore,
        teacherId: new Types.ObjectId(teacherId),
        subjectId: targetSubjectId,
        type: ExamType.PRACTICE,
        mode: ExamMode.STATIC,
        isPublished: false,
        folderId: folder._id,
      });

      const paper = await this.examPapersRepo.createDocument({
        examId: exam._id,
        questions: [],
        answerKeys: [],
      });

      this.logger.log(`[Manual Builder] Teacher ${teacherId} created Exam ${exam._id} + Paper 000`);
      return { examId: exam._id, paperId: paper._id, message: 'Khởi tạo thành công.' };
    });
  }

  async getPaperDetail(paperId: string, teacherId: string) {
    if (!Types.ObjectId.isValid(paperId)) throw new BadRequestException('Mã đề không hợp lệ.');

    const paperModel = (this.examPapersRepo as any).model;

    const paper = await paperModel
      .findById(new Types.ObjectId(paperId))
      .populate('examId', 'teacherId folderId isPublished')
      .populate('questions.attachedMedia', 'url mimetype provider originalName _id')
      .select('+answerKeys')
      .lean();

    if (!paper) throw new NotFoundException('Không tìm thấy mã đề.');

    if (paper.examId.teacherId.toString() !== teacherId) {
      this.logger.warn(`[Security Alert] User ${teacherId} cố truy cập trái phép Paper ${paperId}`);
      throw new ForbiddenException('Bạn không có quyền xem chi tiết đề thi này.');
    }

    const nestedQuestions: any[] = [];
    const passageMap = new Map<string, any>();

    for (const q of paper.questions) {
      if (q.type === 'PASSAGE') {
        const passageObj = { ...q, subQuestions: [] };
        passageMap.set(q.originalQuestionId.toString(), passageObj);
        nestedQuestions.push(passageObj);
      } else if (!q.parentPassageId) {
        nestedQuestions.push(q);
      }
    }

    for (const q of paper.questions) {
      if (q.parentPassageId) {
        const parentIdStr = q.parentPassageId.toString();
        const parentPassage = passageMap.get(parentIdStr);

        if (parentPassage) {
          parentPassage.subQuestions.push(q);
        } else {
          this.logger.warn(`[Data Integrity Warning] Câu hỏi con ${q.originalQuestionId} bị mồ côi trong đề ${paperId}`);
          nestedQuestions.push(q);
        }
      }
    }

    nestedQuestions.forEach(q => {
      if (q.type === 'PASSAGE' && q.subQuestions.length > 0) {
        q.subQuestions.sort((a: any, b: any) => (a.orderIndex || 0) - (b.orderIndex || 0));
      }
    });

    paper.questions = nestedQuestions;

    const folderId = paper.examId.folderId?.toString() || null;
    paper.examId = paper.examId._id;

    return { ...paper, folderId };
  }

  async updatePaperQuestions(paperId: string, teacherId: string, payload: UpdatePaperQuestionsPayload) {
    const { action, questionId, questionIds } = payload;

    if (!Types.ObjectId.isValid(paperId)) {
      throw new BadRequestException('ID Đề thi không hợp lệ.');
    }

    const paperObjectId = new Types.ObjectId(paperId);

    const paper = await (this.examPapersRepo as any).modelInstance
      .findById(paperObjectId)
      .populate('examId', 'teacherId isPublished')
      .exec();

    if (!paper) throw new NotFoundException('Mã đề không tồn tại.');
    if (paper.examId.teacherId.toString() !== teacherId) throw new ForbiddenException('Bạn không có quyền sửa đề thi này.');
    if (paper.examId.isPublished) throw new BadRequestException('Đề thi đã khóa (Published). Không thể thay đổi nội dung.');

    // ==========================================
    // ACTION: REORDER (SẮP XẾP LẠI THỨ TỰ)
    // ==========================================
    if (action === PaperUpdateAction.REORDER) {
      if (!questionIds || questionIds.length === 0) {
        throw new BadRequestException('Danh sách ID không hợp lệ.');
      }

      const currentQuestions = paper.questions;
      const questionMap = new Map<string, any>();
      const subQuestionsMap = new Map<string, any[]>();

      for (const q of currentQuestions) {
        const idStr = q.originalQuestionId.toString();
        if (q.parentPassageId) {
          const parentIdStr = q.parentPassageId.toString();
          if (!subQuestionsMap.has(parentIdStr)) {
            subQuestionsMap.set(parentIdStr, []);
          }
          subQuestionsMap.get(parentIdStr)!.push(q);
        } else {
          questionMap.set(idStr, q);
        }
      }

      const totalRootsInDB = Array.from(questionMap.keys()).length;
      const validRootsSent = questionIds.filter(id => questionMap.has(id)).length;

      if (validRootsSent !== totalRootsInDB) {
        throw new BadRequestException('Danh sách sắp xếp bị thiếu sót dữ liệu. Vui lòng làm mới trang và thử lại.');
      }

      const newQuestionsArray: any[] = [];
      let newOrderIndex = 1;

      for (const rootId of questionIds) {
        const rootQ = questionMap.get(rootId);
        if (!rootQ) continue;

        rootQ.orderIndex = newOrderIndex++;
        newQuestionsArray.push(rootQ);

        if (rootQ.type === 'PASSAGE') {
          const subs = subQuestionsMap.get(rootId) || [];
          subs.sort((a: any, b: any) => (a.orderIndex || 0) - (b.orderIndex || 0));

          for (const sub of subs) {
            sub.orderIndex = newOrderIndex++;
            newQuestionsArray.push(sub);
          }
        }
      }

      await (this.examPapersRepo as any).updateByIdSafe(paperObjectId, {
        $set: { questions: newQuestionsArray }
      });

      this.logger.log(`[Exam Builder] User ${teacherId} reordered Paper ${paperId}`);
      return { message: 'Đã lưu lại thứ tự câu hỏi mới.' };
    }

    // ==========================================
    // ACTION: ADD & REMOVE
    // ==========================================

    if (!questionId || !Types.ObjectId.isValid(questionId)) {
      throw new BadRequestException('ID câu hỏi không hợp lệ.');
    }

    const questionObjectId = new Types.ObjectId(questionId);

    if (action === PaperUpdateAction.ADD) {
      const isExist = paper.questions.some((q: any) => q.originalQuestionId.toString() === questionId);
      if (isExist) throw new ConflictException('Câu hỏi/Đoạn văn này đã tồn tại trong đề thi.');

      const question = await (this.questionsRepo as any).findByIdSafe(questionObjectId);
      if (!question) throw new NotFoundException('Câu hỏi gốc không tồn tại trong Ngân hàng.');
      if (question.parentPassageId) throw new BadRequestException('Vui lòng chọn Đoạn văn mẹ để thêm vào đề, hệ thống sẽ tự động kéo theo câu hỏi con.');

      const questionsToPush: any[] = [];
      const keysToPush: any[] = [];

      if (question.type === 'PASSAGE') {
        const subQuestions = await (this.questionsRepo as any).model
          .find({ parentPassageId: questionObjectId })
          .sort({ orderIndex: 1 })
          .lean();

        if (subQuestions.length === 0) throw new BadRequestException('Đoạn văn này chưa có câu hỏi con nào.');

        questionsToPush.push({
          originalQuestionId: question._id,
          type: question.type,
          parentPassageId: null,
          orderIndex: question.orderIndex,
          content: question.content,
          explanation: question.explanation,
          difficultyLevel: question.difficultyLevel,
          answers: [],
          attachedMedia: question.attachedMedia || []
        });

        for (const sub of subQuestions) {
          const correctAns = sub.answers.find((a: any) => a.isCorrect);
          if (!correctAns) throw new BadRequestException(`Câu hỏi con (ID: ${sub._id}) chưa set đáp án đúng.`);

          questionsToPush.push({
            originalQuestionId: sub._id,
            type: sub.type,
            parentPassageId: question._id,
            orderIndex: sub.orderIndex,
            content: sub.content,
            explanation: sub.explanation,
            difficultyLevel: sub.difficultyLevel,
            answers: sub.answers.map((a: any) => ({ id: a.id, content: a.content })),
            attachedMedia: sub.attachedMedia || []
          });

          keysToPush.push({ originalQuestionId: sub._id, correctAnswerId: correctAns.id });
        }
      } else {
        const correctAns = question.answers.find((a: any) => a.isCorrect);
        if (!correctAns) throw new BadRequestException('Câu hỏi gốc chưa được set đáp án đúng.');

        questionsToPush.push({
          originalQuestionId: question._id,
          type: question.type,
          parentPassageId: null,
          orderIndex: question.orderIndex,
          content: question.content,
          explanation: question.explanation,
          difficultyLevel: question.difficultyLevel,
          answers: question.answers.map((a: any) => ({ id: a.id, content: a.content })),
          attachedMedia: question.attachedMedia || []
        });

        keysToPush.push({ originalQuestionId: question._id, correctAnswerId: correctAns.id });
      }

      await (this.examPapersRepo as any).modelInstance.updateOne(
        { _id: paperObjectId },
        {
          $push: {
            questions: { $each: questionsToPush },
            answerKeys: { $each: keysToPush }
          }
        }
      );

      return { message: `Đã thêm thành công ${questionsToPush.length} nội dung vào đề.` };
    }

    if (action === PaperUpdateAction.REMOVE) {
      const idsToRemove = [questionId];
      const childQuestions = paper.questions.filter(
        (q: any) => q.parentPassageId?.toString() === questionId
      );

      idsToRemove.push(...childQuestions.map((q: any) => q.originalQuestionId.toString()));
      const objectIdsToRemove = idsToRemove.map(id => new Types.ObjectId(id));

      await (this.examPapersRepo as any).updateByIdSafe(paperObjectId, {
        $pull: {
          questions: { originalQuestionId: { $in: objectIdsToRemove } },
          answerKeys: { originalQuestionId: { $in: objectIdsToRemove } }
        }
      });

      return { message: `Đã gỡ bỏ thành công ${idsToRemove.length} nội dung khỏi đề.` };
    }
  }

  async publishExam(examId: string, teacherId: string) {
    if (!Types.ObjectId.isValid(examId)) throw new BadRequestException('ID Đề thi không hợp lệ.');

    const exam = await (this.examsRepo as any).findByIdSafe(new Types.ObjectId(examId));
    if (!exam) throw new NotFoundException('Đề thi không tồn tại.');
    if (exam.teacherId.toString() !== teacherId) throw new ForbiddenException('Không có quyền thao tác.');
    if (exam.isPublished) throw new BadRequestException('Đề thi này đã được chốt từ trước.');

    await (this.examsRepo as any).updateByIdSafe(new Types.ObjectId(examId), { $set: { isPublished: true } });

    this.logger.log(`[Publish] Teacher ${teacherId} published Exam ${examId}.`);
    return { message: 'Chốt đề thi thành công! Đề thi đã sẵn sàng đưa vào khóa học.' };
  }

// ... (Bên trong ExamsService)

  async getExams(teacherId: string, payload: GetExamsPayload) {
    const { page = 1, limit = 10, search, type, subjectId } = payload;
    
    // Gọi hàm chuyên biệt từ Repo, không dùng as any
    const result = await this.examsRepo.getExamsWithPagination(teacherId, page, limit, search, type, subjectId);

    const mappedItems = result.items.map((item: any) => {
      const { _id, ...rest } = item;
      return { id: _id.toString(), ...rest };
    });

    return {
      items: mappedItems,
      meta: {
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }

  async updateExam(examId: string, teacherId: string, payload: UpdateExamPayload) {
    if (!Types.ObjectId.isValid(examId)) throw new BadRequestException('Mã đề thi không hợp lệ.');

    // Dùng hàm chuẩn của AbstractRepository
    const exam = await this.examsRepo.findByIdSafe(examId);

    if (!exam) throw new NotFoundException('Đề thi không tồn tại.');
    if (exam.teacherId.toString() !== teacherId) throw new ForbiddenException('Bạn không có quyền sửa đề thi này.');
    if (exam.isPublished && payload.totalScore) {
      throw new BadRequestException('Đề thi đã được phát hành, không thể thay đổi điểm số tổng.');
    }

    // Tái sử dụng updateByIdSafe thay vì gọi model.findOneAndUpdate
    const updated = await this.examsRepo.updateByIdSafe(examId, { $set: payload });
    return { message: 'Cập nhật thông tin đề thi thành công.', exam: updated };
  }

  async getLeaderboard(teacherId: string, payload: GetLeaderboardPayload) {
    const { courseId, lessonId, page, limit, search } = payload;

    if (!Types.ObjectId.isValid(courseId) || !Types.ObjectId.isValid(lessonId)) {
      throw new BadRequestException('ID không hợp lệ.');
    }

    // Bỏ as any khi gọi khóa học
    const course = await this.coursesRepo.findByIdSafe(courseId, { select: 'teacherId' });
    if (!course || course.teacherId.toString() !== teacherId) {
      throw new ForbiddenException('Bạn không có quyền xem thống kê của khóa học này.');
    }

    // Tầng Service gọi Repo, mỏng nhẹ, dễ test
    const result = await this.examSubmissionsRepo.getLeaderboardData(courseId, lessonId, page, limit, search);

    return {
      items: result.items,
      meta: {
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit)
      }
    };
  }

  async deleteExam(examId: string, teacherId: string) {
    if (!Types.ObjectId.isValid(examId)) throw new BadRequestException('Mã đề thi không hợp lệ.');

    const exam = await (this.examsRepo as any).findByIdSafe(new Types.ObjectId(examId));

    if (!exam) throw new NotFoundException('Đề thi không tồn tại.');
    if (exam.teacherId.toString() !== teacherId) throw new ForbiddenException('Bạn không có quyền xóa đề thi này.');

    if (exam.isPublished) {
      throw new BadRequestException('Đề thi đã được đưa vào khóa học. Không thể xóa để bảo toàn lịch sử.');
    }

    return this.examsRepo.executeInTransaction(async () => {
      await this.examsRepo.deleteOneSafe({ _id: exam._id });
      await this.examPapersRepo.deleteManySafe({ examId: exam._id });

      this.logger.log(`[Delete] Teacher ${teacherId} đã xóa vĩnh viễn Exam ${examId}`);
      return { message: 'Xóa đề thi thành công.' };
    });
  }


}