import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { AbstractRepository } from '../../common/database/abstract.repository';
import { ExamSubmission, ExamSubmissionDocument, SubmissionStatus } from './schemas/exam-submission.schema';
import { RedisService } from 'src/common/redis/redis.service';

@Injectable()
export class ExamSubmissionsRepository 
  extends AbstractRepository<ExamSubmissionDocument> 
  implements OnModuleInit
{
  protected readonly logger = new Logger(ExamSubmissionsRepository.name);

  constructor(
    @InjectModel(ExamSubmission.name) private readonly submissionModel: Model<ExamSubmissionDocument>,
    @InjectConnection() connection: Connection,
    private readonly redisService: RedisService 
  ) {
    super(submissionModel, connection);
  }

  async onModuleInit() {
    try {
      this.logger.log('Đang đồng bộ hóa Indexes cho bảng ExamSubmissions...');
      
      // Hàm syncIndexes() sẽ so sánh Schema hiện tại và DB. 
      // Nó sẽ TỰ ĐỘNG XÓA các index cũ (như assignmentId_1_studentId_1) 
      // và build các index PartialFilter mới mà chúng ta vừa định nghĩa.
      await this.submissionModel.syncIndexes();
      
      this.logger.log('Đồng bộ hóa Indexes thành công! Đã dọn sạch các Index rác.');
    } catch (error: any) {
      this.logger.error(`Lỗi khi sync Indexes: ${error.message}`, error.stack);
    }
  }

  async initSubmission(
    examId: string, 
    examPaperId: string, 
    studentId: string, 
    questionIds: Types.ObjectId[]
  ): Promise<ExamSubmissionDocument> {
    const initialAnswers = questionIds.map(qId => ({
      questionId: qId,
      selectedAnswerId: null,
    }));

    return this.create({
      examId: new Types.ObjectId(examId),
      examPaperId: new Types.ObjectId(examPaperId),
      studentId: new Types.ObjectId(studentId),
      answers: initialAnswers,
      status: SubmissionStatus.IN_PROGRESS,
      score: null,
      submittedAt: null,
    } as any);
  }

  async atomicAutoSave(
    submissionId: string, 
    questionId: string, 
    selectedAnswerId: string
  ): Promise<boolean> {
    const result = await this.submissionModel.updateOne(
      {
        _id: new Types.ObjectId(submissionId),
        'answers.questionId': new Types.ObjectId(questionId),
        status: SubmissionStatus.IN_PROGRESS,
      },
      {
        $set: { 'answers.$.selectedAnswerId': selectedAnswerId }
      }
    );

    return result.modifiedCount > 0;
  }

  async saveDraftToRedis(submissionId: string, questionId: string, selectedAnswerId: string): Promise<void> {
    const redisKey = `exam:submission:${submissionId}`;
    
    // [CTO FIX] Gọi trực tiếp wrapper method của bạn, không dùng getClient()
    await this.redisService.hset(redisKey, questionId, selectedAnswerId);
    await this.redisService.expire(redisKey, 10800); 
  }

  async getDraftAnswersFromRedis(submissionId: string): Promise<Record<string, string>> {
    const redisKey = `exam:submission:${submissionId}`;
    return this.redisService.hgetall(redisKey);
  }

  async syncRedisToMongoOnSubmit(submissionId: string, studentId: string): Promise<boolean> {
    const redisKey = `exam:submission:${submissionId}`;

    // [CTO FIX] Dùng hàm hgetall của bạn
    const draftAnswers = await this.redisService.hgetall(redisKey);
    
    if (!draftAnswers || Object.keys(draftAnswers).length === 0) {
       return this.markAsCompleted(submissionId, studentId);
    }

    const bulkOps = [];
    for (const [qId, aId] of Object.entries(draftAnswers)) {
      bulkOps.push({
        updateOne: {
          filter: { 
            _id: new Types.ObjectId(submissionId),
            studentId: new Types.ObjectId(studentId),
            status: SubmissionStatus.IN_PROGRESS,
            'answers.questionId': new Types.ObjectId(qId) 
          },
          update: { $set: { 'answers.$.selectedAnswerId': aId } }
        }
      });
    }

    if (bulkOps.length > 0) {
      await this.submissionModel.bulkWrite(bulkOps, { ordered: false });
    }

    const success = await this.markAsCompleted(submissionId, studentId);

    if (success) await this.redisService.del(redisKey); // Xóa rác

    return success;
  }

  private async markAsCompleted(submissionId: string, studentId: string): Promise<boolean> {
    const result = await this.submissionModel.updateOne(
      { 
        _id: new Types.ObjectId(submissionId),
        studentId: new Types.ObjectId(studentId),
        status: SubmissionStatus.IN_PROGRESS 
      },
      { 
        $set: { status: SubmissionStatus.COMPLETED, submittedAt: new Date() } 
      }
    );
    return result.modifiedCount > 0;
  }

  // =========================================================================
  // LEADERBOARD METHODS
  // =========================================================================
  
  async getLeaderboardData(courseId: string, lessonId: string, page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;
    const pipeline: any[] = [
      {
        $match: {
          courseId: new Types.ObjectId(courseId),
          lessonId: new Types.ObjectId(lessonId),
          status: SubmissionStatus.COMPLETED
        }
      },
      { $sort: { score: -1, submittedAt: 1 } },
      {
        $group: {
          _id: '$studentId',
          bestScore: { $first: '$score' },
          submissionId: { $first: '$_id' },
          submittedAt: { $first: '$submittedAt' },
          attemptNumber: { $first: '$attemptNumber' }
        }
      },
      {
        $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'studentInfo' }
      },
      { $unwind: '$studentInfo' }
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'studentInfo.fullName': { $regex: search, $options: 'i' } },
            { 'studentInfo.email': { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    pipeline.push(
      { $sort: { bestScore: -1, submittedAt: 1 } },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [
            { $skip: skip }, { $limit: limit },
            {
              $project: {
                _id: 0, studentId: '$_id', fullName: '$studentInfo.fullName',
                email: '$studentInfo.email', avatar: '$studentInfo.avatar',
                bestScore: 1, submissionId: 1, submittedAt: 1, attemptNumber: 1
              }
            }
          ]
        }
      }
    );

    // Lưu ý: Đã đổi this.model thành this.submissionModel để đồng bộ với constructor
    const [result] = await this.submissionModel.aggregate(pipeline);
    return {
      items: result?.data || [],
      total: result?.metadata[0]?.total || 0,
    };
  }

  // =========================================================================
  // STUDENT HISTORY & SUBMISSION METHODS (NEW)
  // =========================================================================

  // Lấy phiên làm bài gần nhất của học viên
  async findLatestSubmission(studentId: string, lessonId: string): Promise<ExamSubmissionDocument | null> {
    return this.submissionModel.findOne({
      studentId: new Types.ObjectId(studentId),
      lessonId: new Types.ObjectId(lessonId)
    })
    .sort({ attemptNumber: -1 })
    .lean()
    .exec() as Promise<ExamSubmissionDocument | null>;
  }

  // Lấy lịch sử thi có phân trang (Tối ưu payload, bỏ mảng answers)
  // async getStudentHistoryData(studentId: string, page: number, limit: number) {
  //   const skip = (page - 1) * limit;
  //   const [result] = await this.submissionModel.aggregate([
  //     { $match: { studentId: new Types.ObjectId(studentId) } },
  //     { $sort: { createdAt: -1 } },
  //     {
  //       $facet: {
  //         metadata: [{ $count: 'total' }],
  //         data: [
  //           { $skip: skip },
  //           { $limit: limit },
  //           {
  //             $lookup: { from: 'courses', localField: 'courseId', foreignField: '_id', as: 'course' }
  //           },
  //           {
  //             $lookup: { from: 'course_lessons', localField: 'lessonId', foreignField: '_id', as: 'lesson' }
  //           },
  //           { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
  //           { $unwind: { path: '$lesson', preserveNullAndEmptyArrays: true } },
  //           {
  //             $project: {
  //               answers: 0, // Không lấy chi tiết bài làm để giảm tải
  //               __v: 0
  //             }
  //           }
  //         ]
  //       }
  //     }
  //   ]);

  //   const total = result.metadata[0]?.total || 0;
  //   return {
  //     items: result.data || [],
  //     meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
  //   };
  // }

  // ... (Các hàm khác giữ nguyên)

  // Lấy lịch sử thi có phân trang (Hỗ trợ filter linh hoạt)
  async getStudentHistoryData(studentId: string, page: number, limit: number, courseId?: string, lessonId?: string) {
    const skip = (page - 1) * limit;

    // Build Match Stage động
    const matchStage: any = { studentId: new Types.ObjectId(studentId) };
    
    if (courseId) {
      matchStage.courseId = new Types.ObjectId(courseId);
    }
    if (lessonId) {
      matchStage.lessonId = new Types.ObjectId(lessonId);
    }

    const [result] = await this.model.aggregate([
      { $match: matchStage },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: { from: 'courses', localField: 'courseId', foreignField: '_id', as: 'course' }
            },
            {
              $lookup: { from: 'course_lessons', localField: 'lessonId', foreignField: '_id', as: 'lesson' }
            },
            { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$lesson', preserveNullAndEmptyArrays: true } },
            {
              $project: {
                answers: 0, // Cắt bỏ array khổng lồ
                __v: 0
              }
            }
          ]
        }
      }
    ]);

    const total = result.metadata[0]?.total || 0;
    return {
      items: result.data || [],
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }
}