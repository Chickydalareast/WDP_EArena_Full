import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';

import { ExamsRepository } from './exams.repository';
import { ExamPapersRepository } from './exam-papers.repository';
import { QuestionsRepository } from '../questions/questions.repository';
import { QuestionFoldersRepository } from '../questions/question-folders.repository';
import { CoursesRepository } from '../courses/courses.repository';
import { LessonsRepository } from '../courses/repositories/lessons.repository'; // [CTO UPGRADE]: Thêm Repository nối
import { ExamSubmissionsRepository } from './exam-submissions.repository';
import { UsersService } from '../users/users.service';
import { ExamMode, ExamType, ExamDocument } from './schemas/exam.schema';
import { PaperUpdateAction } from './dto';
import { UpdatePaperPointsPayload } from './interfaces/exams.interface';
import { QuestionType } from '../questions/schemas/question.schema';

export type InitManualExamPayload = {
  title: string;
  description?: string;
  totalScore: number;
  subjectId: string;
};
export type UpdatePaperQuestionsPayload = {
  action: PaperUpdateAction;
  questionId?: string;
  questionIds?: string[];
};

export type GetExamsPayload = {
  page: number;
  limit: number;
  search?: string;
  type?: ExamType;
  subjectId?: string;
};
export type UpdateExamPayload = {
  title?: string;
  description?: string;
  totalScore?: number;
};
export type GetLeaderboardPayload = {
  courseId: string;
  lessonId: string;
  page: number;
  limit: number;
  search?: string;
};

@Injectable()
export class ExamsService {
  private readonly logger = new Logger(ExamsService.name);

  constructor(
    private readonly examsRepo: ExamsRepository,
    private readonly examPapersRepo: ExamPapersRepository,
    private readonly questionsRepo: QuestionsRepository,
    private readonly coursesRepo: CoursesRepository,
    private readonly lessonsRepo: LessonsRepository, // [CTO UPGRADE]: Tiêm để fix P0
    private readonly usersService: UsersService,
    private readonly examSubmissionsRepo: ExamSubmissionsRepository,
    private readonly foldersRepo: QuestionFoldersRepository,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async initManualExam(teacherId: string, payload: InitManualExamPayload) {
    const teacher = await this.usersService.findById(teacherId);

    if (!teacher || !teacher.subjectIds?.length) {
      throw new BadRequestException(
        'Giáo viên chưa được phân công môn học nào. Không thể tạo đề.',
      );
    }

    const isAllowedSubject = teacher.subjectIds.some((subject: any) => {
      const subjectIdStr = (subject._id || subject.id || subject).toString();
      return subjectIdStr === payload.subjectId;
    });

    if (!isAllowedSubject) {
      this.logger.warn(
        `[Security Alert] Teacher ${teacherId} cố tạo đề cho môn học không được phân công: ${payload.subjectId}`,
      );
      throw new ForbiddenException(
        'Bạn không có quyền tạo đề thi cho môn học này.',
      );
    }

    const targetSubjectObjectId = new Types.ObjectId(payload.subjectId);

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
        subjectId: targetSubjectObjectId,
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

      this.logger.log(
        `[Manual Builder] Teacher ${teacherId} created Exam ${exam._id} (Subject: ${payload.subjectId})`,
      );

      return {
        message: 'Khởi tạo vỏ đề thi thành công.',
        examId: exam._id,
        paperId: paper._id,
      };
    });
  }

  private async buildPaperDetailPayload(filter: Record<string, any>) {
    const paperModel = this.examPapersRepo.modelInstance;

    const paper = await paperModel
      .findOne(filter)
      .populate('examId', 'teacherId folderId isPublished type')
      .populate(
        'questions.attachedMedia',
        'url mimetype provider originalName _id',
      )
      .select('+answerKeys')
      .lean();

    if (!paper) throw new NotFoundException('Không tìm thấy mã đề.');

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
          this.logger.warn(
            `[Data Integrity Warning] Câu hỏi con ${q.originalQuestionId} bị mồ côi trong đề`,
          );
          nestedQuestions.push(q);
        }
      }
    }

    nestedQuestions.forEach((q) => {
      if (q.type === 'PASSAGE' && q.subQuestions.length > 0) {
        q.subQuestions.sort(
          (a: any, b: any) => (a.orderIndex || 0) - (b.orderIndex || 0),
        );
      }
    });

    paper.questions = nestedQuestions;
    return paper;
  }

  async getPaperDetail(paperId: string, teacherId: string) {
    if (!Types.ObjectId.isValid(paperId))
      throw new BadRequestException('Mã đề không hợp lệ.');

    const paper = await this.buildPaperDetailPayload({
      _id: new Types.ObjectId(paperId),
    });

    const exam = paper.examId as unknown as ExamDocument;

    if (exam.teacherId.toString() !== teacherId) {
      this.logger.warn(
        `[Security Alert] User ${teacherId} cố truy cập trái phép Paper ${paperId}`,
      );
      throw new ForbiddenException(
        'Bạn không có quyền xem chi tiết đề thi này.',
      );
    }

    if (exam.type === ExamType.COURSE_QUIZ) {
      throw new ForbiddenException(
        'Không thể xem chi tiết cấu trúc đề của bài Quiz thuộc khóa học tại đây.',
      );
    }

    const folderId = exam.folderId?.toString() || null;
    paper.examId = exam._id as any;

    return { ...paper, folderId };
  }

  async getPaperDetailByExamIdForAdmin(examId: string) {
    if (!Types.ObjectId.isValid(examId))
      throw new BadRequestException('ID Đề thi không hợp lệ.');

    const paper = await this.buildPaperDetailPayload({
      examId: new Types.ObjectId(examId),
    });

    const exam = paper.examId as unknown as ExamDocument;

    const folderId = exam.folderId?.toString() || null;
    paper.examId = exam._id as any;

    return { ...paper, folderId };
  }

  async updatePaperQuestions(
    paperId: string,
    teacherId: string,
    payload: UpdatePaperQuestionsPayload,
  ) {
    const { action, questionId, questionIds } = payload;

    if (!Types.ObjectId.isValid(paperId)) {
      throw new BadRequestException('ID Đề thi không hợp lệ.');
    }

    const paperObjectId = new Types.ObjectId(paperId);

    const paper = await this.examPapersRepo.modelInstance
      .findById(paperObjectId)
      .populate('examId', 'teacherId isPublished')
      .exec();

    if (!paper) throw new NotFoundException('Mã đề không tồn tại.');

    const exam = paper.examId as unknown as ExamDocument;

    if (exam.teacherId.toString() !== teacherId)
      throw new ForbiddenException('Bạn không có quyền sửa đề thi này.');
    if (exam.isPublished)
      throw new BadRequestException(
        'Đề thi đã khóa (Published). Không thể thay đổi nội dung.',
      );

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
      const validRootsSent = questionIds.filter((id) =>
        questionMap.has(id),
      ).length;

      if (validRootsSent !== totalRootsInDB) {
        throw new BadRequestException(
          'Danh sách sắp xếp bị thiếu sót dữ liệu. Vui lòng làm mới trang và thử lại.',
        );
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
          subs.sort(
            (a: any, b: any) => (a.orderIndex || 0) - (b.orderIndex || 0),
          );

          for (const sub of subs) {
            sub.orderIndex = newOrderIndex++;
            newQuestionsArray.push(sub);
          }
        }
      }

      await this.examPapersRepo.updateByIdSafe(paperObjectId, {
        $set: { questions: newQuestionsArray },
      });

      this.logger.log(
        `[Exam Builder] User ${teacherId} reordered Paper ${paperId}`,
      );
      return { message: 'Đã lưu lại thứ tự câu hỏi mới.' };
    }

    if (!questionId || !Types.ObjectId.isValid(questionId)) {
      throw new BadRequestException('ID câu hỏi không hợp lệ.');
    }

    const questionObjectId = new Types.ObjectId(questionId);

    if (action === PaperUpdateAction.ADD) {
      const isExist = paper.questions.some(
        (q: any) => q.originalQuestionId.toString() === questionId,
      );
      if (isExist)
        throw new ConflictException(
          'Câu hỏi/Đoạn văn này đã tồn tại trong đề thi.',
        );

      const question = await this.questionsRepo.findByIdSafe(questionObjectId);
      if (!question)
        throw new NotFoundException(
          'Câu hỏi gốc không tồn tại trong Ngân hàng.',
        );
      if (question.parentPassageId)
        throw new BadRequestException(
          'Vui lòng chọn Đoạn văn mẹ để thêm vào đề, hệ thống sẽ tự động kéo theo câu hỏi con.',
        );

      const questionsToPush: any[] = [];
      const keysToPush: any[] = [];

      if (question.type === 'PASSAGE') {
        const subQuestions = await this.questionsRepo.modelInstance
          .find({ parentPassageId: questionObjectId })
          .sort({ orderIndex: 1 })
          .lean();

        if (subQuestions.length === 0)
          throw new BadRequestException(
            'Đoạn văn này chưa có câu hỏi con nào.',
          );

        questionsToPush.push({
          originalQuestionId: question._id,
          type: question.type,
          parentPassageId: null,
          orderIndex: question.orderIndex,
          content: question.content,
          explanation: question.explanation,
          difficultyLevel: question.difficultyLevel,
          answers: [],
          attachedMedia: question.attachedMedia || [],
        });

        for (const sub of subQuestions) {
          const correctAns = sub.answers.find((a: any) => a.isCorrect);
          if (!correctAns)
            throw new BadRequestException(
              `Câu hỏi con (ID: ${sub._id}) chưa set đáp án đúng.`,
            );

          questionsToPush.push({
            originalQuestionId: sub._id,
            type: sub.type,
            parentPassageId: question._id,
            orderIndex: sub.orderIndex,
            content: sub.content,
            explanation: sub.explanation,
            difficultyLevel: sub.difficultyLevel,
            answers: sub.answers.map((a: any) => ({
              id: a.id,
              content: a.content,
            })),
            attachedMedia: sub.attachedMedia || [],
          });

          keysToPush.push({
            originalQuestionId: sub._id,
            correctAnswerId: correctAns.id,
          });
        }
      } else {
        const correctAns = question.answers.find((a: any) => a.isCorrect);
        if (!correctAns)
          throw new BadRequestException(
            'Câu hỏi gốc chưa được set đáp án đúng.',
          );

        questionsToPush.push({
          originalQuestionId: question._id,
          type: question.type,
          parentPassageId: null,
          orderIndex: question.orderIndex,
          content: question.content,
          explanation: question.explanation,
          difficultyLevel: question.difficultyLevel,
          answers: question.answers.map((a: any) => ({
            id: a.id,
            content: a.content,
          })),
          attachedMedia: question.attachedMedia || [],
        });

        keysToPush.push({
          originalQuestionId: question._id,
          correctAnswerId: correctAns.id,
        });
      }

      await this.examPapersRepo.modelInstance.updateOne(
        { _id: paperObjectId },
        {
          $push: {
            questions: { $each: questionsToPush },
            answerKeys: { $each: keysToPush },
          },
        },
      );

      return {
        message: `Đã thêm thành công ${questionsToPush.length} nội dung vào đề.`,
      };
    }

    if (action === PaperUpdateAction.REMOVE) {
      const idsToRemove = [questionId];
      const childQuestions = paper.questions.filter(
        (q: any) => q.parentPassageId?.toString() === questionId,
      );

      idsToRemove.push(
        ...childQuestions.map((q: any) => q.originalQuestionId.toString()),
      );
      const objectIdsToRemove = idsToRemove.map((id) => new Types.ObjectId(id));

      await this.examPapersRepo.updateByIdSafe(paperObjectId, {
        $pull: {
          questions: { originalQuestionId: { $in: objectIdsToRemove } },
          answerKeys: { originalQuestionId: { $in: objectIdsToRemove } },
        },
      });

      return {
        message: `Đã gỡ bỏ thành công ${idsToRemove.length} nội dung khỏi đề.`,
      };
    }
  }

  async publishExam(examId: string, teacherId: string) {
    if (!Types.ObjectId.isValid(examId))
      throw new BadRequestException('ID Đề thi không hợp lệ.');

    const exam = await this.examsRepo.findByIdSafe(new Types.ObjectId(examId));
    if (!exam) throw new NotFoundException('Đề thi không tồn tại.');
    if (exam.teacherId.toString() !== teacherId)
      throw new ForbiddenException('Không có quyền thao tác.');

    if (exam.type === ExamType.COURSE_QUIZ) {
      throw new ForbiddenException(
        'Đề thi ngầm của khóa học được quản lý tự động, không thể Publish thủ công.',
      );
    }

    if (exam.isPublished)
      throw new BadRequestException('Đề thi này đã được chốt từ trước.');

    await this.examsRepo.updateByIdSafe(new Types.ObjectId(examId), {
      $set: { isPublished: true },
    });

    this.logger.log(`[Publish] Teacher ${teacherId} published Exam ${examId}.`);
    return {
      message: 'Chốt đề thi thành công! Đề thi đã sẵn sàng đưa vào khóa học.',
    };
  }

  async getExams(teacherId: string, payload: GetExamsPayload) {
    const { page = 1, limit = 10, search, type, subjectId } = payload;

    if (type === ExamType.COURSE_QUIZ) {
      throw new ForbiddenException(
        'Hệ thống không cho phép truy vấn trực tiếp kho đề thi ngầm của khóa học.',
      );
    }

    const result = await this.examsRepo.getExamsWithPagination(
      teacherId,
      page,
      limit,
      search,
      type,
      subjectId,
    );

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

  async updateExam(
    examId: string,
    teacherId: string,
    payload: UpdateExamPayload,
  ) {
    if (!Types.ObjectId.isValid(examId))
      throw new BadRequestException('Mã đề thi không hợp lệ.');

    const exam = await this.examsRepo.findByIdSafe(examId);

    if (!exam) throw new NotFoundException('Đề thi không tồn tại.');
    if (exam.teacherId.toString() !== teacherId)
      throw new ForbiddenException('Bạn không có quyền sửa đề thi này.');

    if (exam.type === ExamType.COURSE_QUIZ) {
      throw new ForbiddenException(
        'Đây là đề thi ngầm của khóa học. Vui lòng vào giao diện Course Builder để cập nhật.',
      );
    }

    if (exam.isPublished && payload.totalScore) {
      throw new BadRequestException(
        'Đề thi đã được phát hành, không thể thay đổi điểm số tổng.',
      );
    }

    const updated = await this.examsRepo.updateByIdSafe(examId, {
      $set: payload,
    });
    return { message: 'Cập nhật thông tin đề thi thành công.', exam: updated };
  }

  async getLeaderboard(teacherId: string, payload: GetLeaderboardPayload) {
    const { courseId, lessonId, page, limit, search } = payload;

    if (
      !Types.ObjectId.isValid(courseId) ||
      !Types.ObjectId.isValid(lessonId)
    ) {
      throw new BadRequestException('ID không hợp lệ.');
    }

    const course = await this.coursesRepo.findByIdSafe(courseId, {
      select: 'teacherId',
    });
    if (!course || course.teacherId.toString() !== teacherId) {
      throw new ForbiddenException(
        'Bạn không có quyền xem thống kê của khóa học này.',
      );
    }

    const result = await this.examSubmissionsRepo.getLeaderboardData(
      courseId,
      lessonId,
      page,
      limit,
      search,
    );

    return {
      items: result.items,
      meta: {
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }

  async deleteExam(examId: string, teacherId: string) {
    if (!Types.ObjectId.isValid(examId))
      throw new BadRequestException('Mã đề thi không hợp lệ.');

    const exam = await this.examsRepo.findByIdSafe(new Types.ObjectId(examId));

    if (!exam) throw new NotFoundException('Đề thi không tồn tại.');
    if (exam.teacherId.toString() !== teacherId)
      throw new ForbiddenException('Bạn không có quyền xóa đề thi này.');

    if (exam.type === ExamType.COURSE_QUIZ) {
      throw new ForbiddenException(
        'Đây là đề thi ngầm. Bạn phải xóa Bài học (Lesson) tương ứng trong khóa học để dọn dẹp đề này.',
      );
    }

    if (exam.isPublished) {
      throw new BadRequestException(
        'Đề thi đã được đưa vào khóa học. Không thể xóa để bảo toàn lịch sử.',
      );
    }

    return this.examsRepo.executeInTransaction(async () => {
      await this.examsRepo.deleteOneSafe({ _id: exam._id });
      await this.examPapersRepo.deleteManySafe({ examId: exam._id });

      this.logger.log(
        `[Delete] Teacher ${teacherId} đã xóa vĩnh viễn Exam ${examId}`,
      );
      return { message: 'Xóa đề thi thành công.' };
    });
  }

  async updatePaperPoints(
    paperId: string,
    teacherId: string,
    payload: UpdatePaperPointsPayload,
  ) {
    if (!Types.ObjectId.isValid(paperId))
      throw new BadRequestException('ID Đề thi không hợp lệ.');
    const paperObjId = new Types.ObjectId(paperId);

    const paper = await this.examPapersRepo.modelInstance
      .findById(paperObjId)
      .populate('examId', 'teacherId isPublished totalScore')
      .lean()
      .exec();

    if (!paper) throw new NotFoundException('Mã đề không tồn tại.');

    const exam = paper.examId as any;
    if (exam.teacherId.toString() !== teacherId)
      throw new ForbiddenException('Bạn không có quyền sửa đề thi này.');
    if (exam.isPublished)
      throw new BadRequestException(
        'Đề thi đã khóa (Published). Không thể sửa điểm.',
      );

    let updatedQuestions = [...paper.questions];

    if (payload.divideEqually) {
      if (!exam.totalScore || exam.totalScore <= 0) {
        throw new BadRequestException(
          'Tổng điểm của đề thi (Exam) phải lớn hơn 0 để có thể chia đều.',
        );
      }

      const answerableQuestions = updatedQuestions.filter(
        (q) => q.type !== QuestionType.PASSAGE,
      );

      if (answerableQuestions.length === 0) {
        throw new BadRequestException(
          'Đề thi chưa có câu hỏi nào để tính điểm.',
        );
      }

      const pointPerQuestion = Number(
        (exam.totalScore / answerableQuestions.length).toFixed(2),
      );

      updatedQuestions = updatedQuestions.map((q) => {
        if (q.type !== QuestionType.PASSAGE) q.points = pointPerQuestion;
        return q;
      });
    } else if (payload.pointsData && payload.pointsData.length > 0) {
      const pointsMap = new Map<string, number>();
      payload.pointsData.forEach((p) => pointsMap.set(p.questionId, p.points));

      updatedQuestions = updatedQuestions.map((q) => {
        const qIdStr = q.originalQuestionId.toString();
        if (pointsMap.has(qIdStr)) {
          q.points = pointsMap.get(qIdStr)!;
        }
        return q;
      });
    } else {
      throw new BadRequestException(
        'Vui lòng chọn cờ "Chia đều điểm" hoặc gửi mảng danh sách điểm cụ thể.',
      );
    }

    await this.examPapersRepo.updateByIdSafe(paperObjId, {
      $set: { questions: updatedQuestions },
    });

    this.logger.log(
      `[Exam Builder] Teacher ${teacherId} updated points for Paper ${paperId}`,
    );

    return { message: 'Cập nhật điểm số thành công.' };
  }

  // [CTO UPGRADE - FIXED P0 BUG]: Map chính xác examId từ khóa học để unpublish. Không quét mù.
  async unpublishAllQuizzesByCourse(courseId: string): Promise<void> {
    const courseObjId = new Types.ObjectId(courseId);

    // Lấy tất cả Lesson của khóa học có dính tới Exam
    const lessons = await this.lessonsRepo.modelInstance
      .find({ courseId: courseObjId, examId: { $ne: null } })
      .select('examId')
      .lean()
      .exec();

    const examIdsToUnpublish = lessons.map((l: any) => l.examId);

    // Guard: Nếu khóa học chưa có bài Quiz nào thì không cần gọi DB update
    if (examIdsToUnpublish.length === 0) return;

    const result = await this.examsRepo.modelInstance.updateMany(
      {
        _id: { $in: examIdsToUnpublish },
        type: ExamType.COURSE_QUIZ,
      },
      { $set: { isPublished: false } },
    );

    this.logger.log(
      `[Quiz Sync] Unpublished ${result.modifiedCount} quiz exams for course ${courseId}`,
    );
  }
}
