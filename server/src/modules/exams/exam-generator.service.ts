import { BadRequestException, Injectable, Logger, InternalServerErrorException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Types } from 'mongoose';
import { QuestionsRepository } from '../questions/questions.repository';
import { ExamsRepository } from './exams.repository';
import { ExamPapersRepository } from './exam-papers.repository';
import { ExamMatricesService } from './exam-matrices.service';
import { QuestionFoldersRepository } from '../questions/question-folders.repository';
import { KnowledgeTopicsRepository } from '../taxonomy/knowledge-topics.repository';
import { RedisService } from '../../common/redis/redis.service';
import { FillExistingPaperPayload, GenerateDynamicExamPayload, PreviewRulePayload, PreviewDynamicExamPayload } from './interfaces/exam-generator.interface';
import { ExamMode, ExamType } from './schemas/exam.schema';
import { DifficultyLevel, QuestionType } from '../questions/schemas/question.schema';

@Injectable()
export class ExamGeneratorService {
  private readonly logger = new Logger(ExamGeneratorService.name);

  constructor(
    private readonly questionsRepo: QuestionsRepository,
    private readonly examsRepo: ExamsRepository,
    private readonly examPapersRepo: ExamPapersRepository,
    private readonly matricesService: ExamMatricesService,
    private readonly foldersRepo: QuestionFoldersRepository,
    private readonly topicsRepo: KnowledgeTopicsRepository,
    private readonly redisService: RedisService,
  ) { }

  // [PERF 2.1]: Cache hierarchy expansion trong Redis TTL 1h.
  // Folder/topic tree thay đổi rất ít — query DB mỗi JIT generation là lãng phí.
  // Cache key stable: sort ids trước để deterministic dù thứ tự input khác nhau.
  private async expandHierarchyIds(
    repo: any,
    collectionPrefix: 'folder' | 'topic',
    inputIds?: string[],
  ): Promise<string[]> {
    if (!inputIds || inputIds.length === 0) return [];

    const sortedIds = [...inputIds].sort();
    const cacheKey = `hierarchy:${collectionPrefix}:${sortedIds.join(',')}`;
    const HIERARCHY_CACHE_TTL_SECONDS = 3600; // 1 giờ

    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as string[];
    }

    const objIds = sortedIds.map(id => new Types.ObjectId(id));
    const childNodes = await repo.modelInstance
      .find({ ancestors: { $in: objIds } })
      .select('_id')
      .lean()
      .exec();

    const expanded = [...new Set([...sortedIds, ...childNodes.map((n: any) => n._id.toString())])];

    await this.redisService.set(cacheKey, JSON.stringify(expanded), HIERARCHY_CACHE_TTL_SECONDS);

    return expanded;
  }

  private shuffleArray<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  private mapQuestionToPaper(rawQ: any, parentPassageId: Types.ObjectId | null, questionsArray: any[], keysArray: any[], orderIdx: number) {
    const isPassageMother = rawQ.type === QuestionType.PASSAGE;
    let answers: any[] = [];

    if (!isPassageMother) {
      const correctAnswer = rawQ.answers?.find((a: any) => a.isCorrect);
      if (!correctAnswer) throw new InternalServerErrorException(`Câu hỏi gốc ID ${rawQ._id} bị lỗi dữ liệu (không set đáp án đúng).`);

      answers = this.shuffleArray(rawQ.answers).map((opt: any) => ({
        id: opt.id,
        content: opt.content,
      }));
      keysArray.push({
        originalQuestionId: rawQ._id,
        correctAnswerId: correctAnswer.id,
      });
    }

    questionsArray.push({
      originalQuestionId: rawQ._id,
      type: rawQ.type,
      parentPassageId: parentPassageId,
      orderIndex: orderIdx,
      explanation: rawQ.explanation || null,
      content: rawQ.content,
      difficultyLevel: rawQ.difficultyLevel,
      answers: answers,
      attachedMedia: rawQ.attachedMedia || [],
      points: null,
    });
  }

  private async buildQuestionsFromSections(
    teacherObjId: Types.ObjectId,
    sectionsToProcess: any[],
    initialExcludeIds: Set<string>,
    startOrderIndex: number
  ) {
    const pickedQuestionIds = new Set<string>(initialExcludeIds);
    const finalPaperQuestions: any[] = [];
    const finalAnswerKeys: any[] = [];
    let globalOrderIndex = startOrderIndex;

    for (const section of sectionsToProcess) {
      // [PERF 2.2]: Parallel hóa tầng I/O (expand hierarchy + fetch pool) cho tất cả rules
      // trong cùng một section. Snapshot excludeIds tại đầu section — đủ an toàn vì
      // các rules trong cùng section không share pool nguồn với nhau.
      // Phần PICK + FILL vẫn sequential để đảm bảo dedup chính xác.
      const excludeObjIdsSnapshot = Array.from(pickedQuestionIds).map(id => new Types.ObjectId(id));

      const ruleCandidates = await Promise.all(
        section.rules.map(async (rule: any) => {
          const [expandedFolderIds, expandedTopicIds] = await Promise.all([
            this.expandHierarchyIds(this.foldersRepo, 'folder', rule.folderIds),
            this.expandHierarchyIds(this.topicsRepo, 'topic', rule.topicIds),
          ]);

          const mappedRule = {
            folderIds: expandedFolderIds.map(id => new Types.ObjectId(id)),
            topicIds: expandedTopicIds.map(id => new Types.ObjectId(id)),
            difficulties: rule.difficulties || [],
            tags: rule.tags || [],
            limit: rule.limit,
          };

          const candidates = await this.questionsRepo.getCandidatePoolForRule(
            teacherObjId,
            mappedRule,
            excludeObjIdsSnapshot,
            3,
          );

          return { rule, candidates };
        }),
      );

      // Sequential pick-and-fill để dedup set được cập nhật chính xác theo từng rule
      for (const { rule, candidates } of ruleCandidates) {
        let currentSlotFilled = 0;
        const targetLimit = rule.limit;

        for (const passage of candidates.passages) {
          const childCount = passage.children.length;
          if (currentSlotFilled + childCount <= targetLimit) {
            this.mapQuestionToPaper(passage, null, finalPaperQuestions, finalAnswerKeys, globalOrderIndex++);
            pickedQuestionIds.add(passage._id.toString());

            for (const child of passage.children) {
              this.mapQuestionToPaper(child, passage._id, finalPaperQuestions, finalAnswerKeys, globalOrderIndex++);
              pickedQuestionIds.add(child._id.toString());
            }
            currentSlotFilled += childCount;
          }
          if (currentSlotFilled === targetLimit) break;
        }

        if (currentSlotFilled < targetLimit) {
          for (const flat of candidates.flats) {
            if (currentSlotFilled < targetLimit) {
              this.mapQuestionToPaper(flat, null, finalPaperQuestions, finalAnswerKeys, globalOrderIndex++);
              pickedQuestionIds.add(flat._id.toString());
              currentSlotFilled++;
            } else {
              break;
            }
          }
        }

        if (currentSlotFilled < targetLimit) {
          throw new BadRequestException(
            `Ngân hàng không đủ dữ liệu. Yêu cầu ${targetLimit} câu nhưng chỉ tìm được ${currentSlotFilled} câu cho Section "${section.name}".`
          );
        }
      }
    }

    return { finalPaperQuestions, finalAnswerKeys };
  }

  private async resolveSectionsToProcess(teacherId: string, matrixId?: string, adHocSections?: any[]) {
    // [FIX #1.3]: Defense-in-depth — enforce mutually exclusive ở service layer.
    // DTO đã validate nhưng service phải tự bảo vệ khi bị gọi trực tiếp (worker, internal call).
    const hasMatrix = !!matrixId;
    const hasAdHoc = Array.isArray(adHocSections) && adHocSections.length > 0;
    if (hasMatrix && hasAdHoc) {
      throw new BadRequestException(
        'Cấu hình nguồn đề không hợp lệ: không được cung cấp cả "matrixId" lẫn "adHocSections" cùng lúc.'
      );
    }

    let sectionsToProcess = (adHocSections || []).map(sec => ({
      ...sec,
      orderIndex: sec.orderIndex ?? 0,
    }));
    let subjectId: Types.ObjectId | null = null;

    if (matrixId) {
      const template = await this.matricesService.getMatrixDetail(matrixId, teacherId);
      sectionsToProcess = template.sections.map((sec: any) => ({
        name: sec.name,
        orderIndex: sec.orderIndex,
        rules: sec.rules.map((rule: any) => ({
          folderIds: rule.folderIds?.map((id: Types.ObjectId) => id.toString()) || [],
          topicIds: rule.topicIds?.map((id: Types.ObjectId) => id.toString()) || [],
          difficulties: rule.difficulties || [],
          tags: rule.tags || [],
          limit: rule.limit,
        })),
      }));
      subjectId = template.subjectId;
    }

    if (!sectionsToProcess.length) {
      throw new BadRequestException('Không có dữ liệu Ma trận để xử lý.');
    }

    return { sectionsToProcess, subjectId };
  }

  async previewDynamicExam(payload: PreviewDynamicExamPayload) {
    const { teacherId, matrixId, adHocSections } = payload;
    const teacherObjId = new Types.ObjectId(teacherId);

    const { sectionsToProcess } = await this.resolveSectionsToProcess(teacherId, matrixId, adHocSections);

    const { finalPaperQuestions, finalAnswerKeys } = await this.buildQuestionsFromSections(
      teacherObjId,
      sectionsToProcess,
      new Set<string>(),
      1
    );

    this.logger.log(`[Dry-Run Preview] Teacher ${teacherId} generated a preview. Questions: ${finalPaperQuestions.length}`);

    return {
      message: 'Tạo bản xem trước thành công (Dry-Run). Dữ liệu chưa được lưu.',
      totalItems: finalPaperQuestions.length,
      totalActualQuestions: finalAnswerKeys.length,
      previewData: {
        questions: finalPaperQuestions,
        answerKeys: finalAnswerKeys,
      }
    };
  }

  async generateDynamicExam(payload: GenerateDynamicExamPayload) {
    const { teacherId, title, totalScore, matrixId, adHocSections } = payload;
    const teacherObjId = new Types.ObjectId(teacherId);

    const { sectionsToProcess, subjectId } = await this.resolveSectionsToProcess(teacherId, matrixId, adHocSections);

    const { finalPaperQuestions, finalAnswerKeys } = await this.buildQuestionsFromSections(
      teacherObjId,
      sectionsToProcess,
      new Set<string>(),
      1
    );

    if (totalScore > 0 && finalAnswerKeys.length > 0) {
      const scorePerQuestion = Number((totalScore / finalAnswerKeys.length).toFixed(2));
      finalPaperQuestions.forEach(q => {
        if (q.type !== QuestionType.PASSAGE) q.points = scorePerQuestion;
      });
    }

    return this.examsRepo.executeInTransaction(async () => {
      const exam = await this.examsRepo.createDocument({
        title,
        description: `Sinh từ động cơ Ma trận. ${matrixId ? `Template ID: ${matrixId}` : 'Ad-hoc Matrix'}.`,
        teacherId: teacherObjId,
        subjectId: subjectId || new Types.ObjectId(),
        totalScore,
        type: ExamType.PRACTICE,
        mode: ExamMode.DYNAMIC,
        isPublished: false,
      });

      const examPaper = await this.examPapersRepo.createDocument({
        examId: exam._id,
        questions: finalPaperQuestions,
        answerKeys: finalAnswerKeys,
      });

      return {
        message: 'Sinh đề thi mới bằng Rule Engine thành công',
        examId: exam._id,
        paperId: examPaper._id,
        totalItems: finalPaperQuestions.length,
        totalActualQuestions: finalAnswerKeys.length,
      };
    });
  }

  async fillExistingPaperFromMatrix(payload: FillExistingPaperPayload) {
    const { teacherId, paperId, matrixId, adHocSections } = payload;
    const paperObjId = new Types.ObjectId(paperId);
    const teacherObjId = new Types.ObjectId(teacherId);

    const paper = await this.examPapersRepo.modelInstance
      .findById(paperObjId)
      .populate('examId', 'teacherId isPublished')
      .lean()
      .exec() as any;

    if (!paper) throw new NotFoundException('Mã đề không tồn tại.');
    if (paper.examId.teacherId.toString() !== teacherId) throw new ForbiddenException('Bạn không có quyền sửa đề thi này.');
    if (paper.examId.isPublished) throw new BadRequestException('Đề thi đã khóa (Published). Không thể đắp thêm câu hỏi.');

    const { sectionsToProcess } = await this.resolveSectionsToProcess(teacherId, matrixId, adHocSections);

    const existingExcludeIds = new Set<string>();
    let maxOrderIndex = 0;

    for (const q of paper.questions) {
      existingExcludeIds.add(q.originalQuestionId.toString());
      if (q.orderIndex > maxOrderIndex) {
        maxOrderIndex = q.orderIndex;
      }
    }

    const startOrderIndex = maxOrderIndex + 1;
    const { finalPaperQuestions, finalAnswerKeys } = await this.buildQuestionsFromSections(
      teacherObjId,
      sectionsToProcess,
      existingExcludeIds,
      startOrderIndex
    );

    await this.examPapersRepo.updateByIdSafe(paperObjId, {
      $push: {
        questions: { $each: finalPaperQuestions },
        answerKeys: { $each: finalAnswerKeys }
      }
    });

    this.logger.log(`[Builder] Teacher ${teacherId} đắp thêm ${finalAnswerKeys.length} câu vào Paper ${paperId} bằng Matrix`);

    return {
      message: `Đã bốc thành công ${finalAnswerKeys.length} câu hỏi mới vào đề thi hiện tại.`,
      addedItems: finalPaperQuestions.length,
      addedActualQuestions: finalAnswerKeys.length,
    };
  }

  async previewRuleAvailability(payload: PreviewRulePayload) {
    const { teacherId, paperId, rule } = payload;
    const paperObjId = new Types.ObjectId(paperId);
    const teacherObjId = new Types.ObjectId(teacherId);

    const paper = await this.examPapersRepo.modelInstance
      .findById(paperObjId)
      .populate('examId', 'teacherId isPublished')
      .select('questions examId')
      .lean()
      .exec() as any;

    if (!paper) throw new NotFoundException('Mã đề không tồn tại.');
    if (paper.examId.teacherId.toString() !== teacherId) {
      throw new ForbiddenException('Bạn không có quyền thao tác trên đề thi này.');
    }
    if (paper.examId.isPublished) {
      throw new BadRequestException('Đề thi đã khóa (Published). Không thể thay đổi rule.');
    }

    const excludeIds = paper.questions.map((q: any) => q.originalQuestionId);

    const [expandedFolderIds, expandedTopicIds] = await Promise.all([
      this.expandHierarchyIds(this.foldersRepo, 'folder', rule.folderIds),
      this.expandHierarchyIds(this.topicsRepo, 'topic', rule.topicIds)
    ]);

    const mappedRule = {
      folderIds: expandedFolderIds.map(id => new Types.ObjectId(id)),
      topicIds: expandedTopicIds.map(id => new Types.ObjectId(id)),
      difficulties: rule.difficulties || [],
      tags: rule.tags || [],
    };

    const availableCount = await this.questionsRepo.countAvailableQuestionsForRule(
      teacherObjId,
      mappedRule,
      excludeIds
    );

    return {
      message: 'Lấy số lượng câu hỏi khả dụng thành công.',
      availableQuestionsCount: availableCount,
    };
  }

  async generateJitPaperFromMatrix(
    teacherId: string,
    totalScore: number,
    matrixId?: string,
    adHocSections?: any[]
  ) {
    const { sectionsToProcess } = await this.resolveSectionsToProcess(teacherId, matrixId, adHocSections);

    const { finalPaperQuestions, finalAnswerKeys } = await this.buildQuestionsFromSections(
      new Types.ObjectId(teacherId),
      sectionsToProcess,
      new Set<string>(),
      1
    );

    if (totalScore > 0 && finalAnswerKeys.length > 0) {
      const scorePerQuestion = Number((totalScore / finalAnswerKeys.length).toFixed(2));
      finalPaperQuestions.forEach(q => {
        if (q.type !== QuestionType.PASSAGE) q.points = scorePerQuestion;
      });
    }

    return {
      questions: finalPaperQuestions,
      answerKeys: finalAnswerKeys
    };
  }

  async countAvailableForRule(
    teacherId: string,
    rule: {
      folderIds?: string[];
      topicIds?: string[];
      difficulties?: DifficultyLevel[];
      tags?: string[];
      limit: number;
    },
  ): Promise<number> {
    const teacherObjId = new Types.ObjectId(teacherId);

    const [expandedFolderIds, expandedTopicIds] = await Promise.all([
      this.expandHierarchyIds(this.foldersRepo, 'folder', rule.folderIds),
      this.expandHierarchyIds(this.topicsRepo, 'topic', rule.topicIds),
    ]);

    const mappedRule = {
      folderIds: expandedFolderIds.map(id => new Types.ObjectId(id)),
      topicIds: expandedTopicIds.map(id => new Types.ObjectId(id)),
      difficulties: rule.difficulties || [],
      tags: rule.tags || [],
      limit: rule.limit,
    };

    return this.questionsRepo.countAvailableQuestionsForRule(
      teacherObjId,
      mappedRule,
      [],
    );
  }
}