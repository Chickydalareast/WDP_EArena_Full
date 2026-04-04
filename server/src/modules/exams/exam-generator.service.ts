import {
  BadRequestException,
  Injectable,
  Logger,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import {
  QuestionsRepository,
  RepositoryRuleFilter,
} from '../questions/questions.repository';
import { ExamsRepository } from './exams.repository';
import { ExamPapersRepository } from './exam-papers.repository';
import { ExamMatricesService } from './exam-matrices.service';
import { QuestionFoldersRepository } from '../questions/question-folders.repository';
import { KnowledgeTopicsRepository } from '../taxonomy/knowledge-topics.repository';
import { RedisService } from '../../common/redis/redis.service';
import {
  FillExistingPaperPayload,
  GenerateDynamicExamPayload,
  PreviewRulePayload,
  PreviewDynamicExamPayload,
  GenerateRawPaperPayload,
} from './interfaces/exam-generator.interface';
import { ExamMode, ExamType } from './schemas/exam.schema';
import {
  DifficultyLevel,
  QuestionType,
} from '../questions/schemas/question.schema';
import { CandidatePool } from './interfaces/exam-generator.interface';
import { RuleQuestionType, MatrixSectionPayload } from './interfaces/exam-matrix.interface';

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

  async generateRawPaperContent(payload: GenerateRawPaperPayload) {
    const { sectionsToProcess } = await this.resolveSectionsToProcess(
      payload.teacherId,
      payload.matrixId,
      payload.adHocSections,
    );

    const teacherObjId = new Types.ObjectId(payload.teacherId);
    const pickedQuestionIds = new Set<string>();

    const { finalPaperQuestions, finalAnswerKeys } = await this.buildQuestionsFromSections(
      teacherObjId,
      sectionsToProcess,
      pickedQuestionIds,
      1,
    );

    this.applyScoring(payload.totalScore, finalPaperQuestions, finalAnswerKeys);

    return {
      questions: finalPaperQuestions,
      answerKeys: finalAnswerKeys,
    };
  }

  private async expandHierarchyIds(
    repo: any,
    collectionPrefix: 'folder' | 'topic',
    inputIds?: string[],
  ): Promise<string[]> {
    if (!inputIds || inputIds.length === 0) return [];

    const sortedIds = [...inputIds].sort();
    const cacheKey = `hierarchy:${collectionPrefix}:${sortedIds.join(',')}`;
    const HIERARCHY_CACHE_TTL_SECONDS = 60;

    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as string[];
    }

    const objIds = sortedIds.map((id) => new Types.ObjectId(id));

    const childNodes = await repo.modelInstance
      .find({ ancestors: { $in: objIds } })
      .select('_id')
      .lean()
      .exec();

    const expanded = [
      ...new Set([
        ...sortedIds,
        ...childNodes.map((n: any) => n._id.toString()),
      ]),
    ];

    await this.redisService.set(
      cacheKey,
      JSON.stringify(expanded),
      HIERARCHY_CACHE_TTL_SECONDS,
    );

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

  private mapQuestionToPaper(
    rawQ: any,
    parentPassageId: Types.ObjectId | null,
    questionsArray: any[],
    keysArray: any[],
    orderIdx: number,
  ) {
    const isPassageMother = rawQ.type === QuestionType.PASSAGE;
    let answers: any[] = [];

    if (!isPassageMother) {
      const correctAnswer = rawQ.answers?.find((a: any) => a.isCorrect);
      if (!correctAnswer)
        throw new InternalServerErrorException(
          `Câu hỏi gốc ID ${rawQ._id} bị lỗi dữ liệu (không set đáp án đúng).`,
        );

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
    teacherId: Types.ObjectId,
    sections: MatrixSectionPayload[],
    excludeQuestionIds: Set<string>,
    startOrderIndex: number,
  ): Promise<{ finalPaperQuestions: any[]; finalAnswerKeys: any[] }> {
    const finalPaperQuestions: any[] = [];
    const finalAnswerKeys: any[] = [];
    let orderIndex = startOrderIndex;
    const excludeObjIds = Array.from(excludeQuestionIds).map((id) => new Types.ObjectId(id));

    const poolPromises: Promise<{ ruleKey: string; pool: CandidatePool }>[] = [];
    for (let sIdx = 0; sIdx < sections.length; sIdx++) {
      const section = sections[sIdx];
      for (let rIdx = 0; rIdx < section.rules.length; rIdx++) {
        const rule = section.rules[rIdx];
        poolPromises.push(
          (async () => {
            const [expandedFolderIds, expandedTopicIds] = await Promise.all([
              this.expandHierarchyIds(this.foldersRepo, 'folder', rule.folderIds),
              this.expandHierarchyIds(this.topicsRepo, 'topic', rule.topicIds),
            ]);

            const mappedRule: RepositoryRuleFilter = {
              questionType: rule.questionType ?? RuleQuestionType.MIXED,
              subQuestionLimit: rule.subQuestionLimit,
              folderIds: expandedFolderIds.map((id) => new Types.ObjectId(id)),
              topicIds: expandedTopicIds.map((id) => new Types.ObjectId(id)),
              difficulties: rule.difficulties || [],
              tags: rule.tags || [],
              limit: rule.limit,
            };
            const pool = await this.questionsRepo.getCandidatePoolForRule(teacherId, mappedRule, excludeObjIds);
            return { ruleKey: `${sIdx}_${rIdx}`, pool };
          })(),
        );
      }
    }

    const resolvedPools = await Promise.all(poolPromises);
    const poolsMap = new Map<string, CandidatePool>();
    resolvedPools.forEach(p => poolsMap.set(p.ruleKey, p.pool));

    for (let sIdx = 0; sIdx < sections.length; sIdx++) {
      const section = sections[sIdx];
      for (let rIdx = 0; rIdx < section.rules.length; rIdx++) {
        const rule = section.rules[rIdx];
        const pool = poolsMap.get(`${sIdx}_${rIdx}`);
        if (!pool) continue;

        let itemsPickedInRule = 0;
        const targetLimit = rule.limit;

        if (rule.questionType === RuleQuestionType.FLAT) {
          const availableFlats = this.shuffleArray([...(pool.flats || [])]);
          while (availableFlats.length > 0 && itemsPickedInRule < targetLimit) {
            const flatQ = availableFlats.pop()!;
            this.mapQuestionToPaper(flatQ, null, finalPaperQuestions, finalAnswerKeys, orderIndex++);
            itemsPickedInRule++;
          }
        }

        else if (rule.questionType === RuleQuestionType.PASSAGE) {
          const availablePassages = this.shuffleArray([...(pool.passages || [])]);
          while (availablePassages.length > 0 && itemsPickedInRule < targetLimit) {
            const passage = availablePassages.pop()!;

            this.mapQuestionToPaper(passage, null, finalPaperQuestions, finalAnswerKeys, orderIndex++);

            for (const child of passage.childQuestions) {
              this.mapQuestionToPaper(child, passage._id, finalPaperQuestions, finalAnswerKeys, orderIndex++);
            }

            itemsPickedInRule++;
          }
        }

        else {
          const availableFlats = this.shuffleArray([...(pool.flats || [])]);
          const availablePassages = this.shuffleArray([...(pool.passages || [])]);

          while (itemsPickedInRule < targetLimit) {
            if (availableFlats.length > 0) {
              const flatQ = availableFlats.pop()!;
              this.mapQuestionToPaper(flatQ, null, finalPaperQuestions, finalAnswerKeys, orderIndex++);
              itemsPickedInRule++;
            } else if (availablePassages.length > 0) {
              const passage = availablePassages.pop()!;
              const slotsNeeded = targetLimit - itemsPickedInRule;
              const childCount = passage.childQuestions?.length || 0;

              if (childCount > 0 && childCount <= slotsNeeded) {
                this.mapQuestionToPaper(passage, null, finalPaperQuestions, finalAnswerKeys, orderIndex++);
                for (const child of passage.childQuestions) {
                  this.mapQuestionToPaper(child, passage._id, finalPaperQuestions, finalAnswerKeys, orderIndex++);
                }
                itemsPickedInRule += childCount;
              } else {
                continue;
              }
            } else {
              break;
            }
          }
        }

        if (itemsPickedInRule < targetLimit) {
          const unit = rule.questionType === RuleQuestionType.PASSAGE ? 'Bài đọc' : 'Câu hỏi đơn (hoặc slot trống)';
          throw new BadRequestException(
            `Lỗi sinh đề: Phần "${section.name}" yêu cầu ${targetLimit} ${unit}, nhưng kho chỉ đáp ứng được ${itemsPickedInRule}. ` +
            `Vui lòng kiểm tra lại bộ lọc hoặc bổ sung câu hỏi vào ngân hàng.`
          );
        }
      }
    }

    return { finalPaperQuestions, finalAnswerKeys };
  }

  private applyScoring(totalScore: number, finalPaperQuestions: any[], finalAnswerKeys: any[]) {
    if (totalScore <= 0 || finalAnswerKeys.length === 0) return;

    const scorePerQuestion = parseFloat((totalScore / finalAnswerKeys.length).toFixed(2));
    finalPaperQuestions.forEach((q) => {
      if (q.type !== QuestionType.PASSAGE) {
        q.points = scorePerQuestion;
      } else {
        q.points = null;
      }
    });
  }

  private async resolveSectionsToProcess(
    teacherId: string,
    matrixId?: string,
    adHocSections?: any[],
  ) {
    const hasMatrix = !!matrixId;
    const hasAdHoc = Array.isArray(adHocSections) && adHocSections.length > 0;

    let sectionsToProcess: any[] = [];
    let subjectId: Types.ObjectId | null = null;

    if (hasAdHoc) {
      sectionsToProcess = adHocSections.map((sec) => ({
        name: sec.name,
        orderIndex: sec.orderIndex ?? 0,
        rules: sec.rules.map((rule: any) => ({
          questionType: rule.questionType ?? RuleQuestionType.MIXED,
          subQuestionLimit: rule.questionType === RuleQuestionType.PASSAGE ? rule.subQuestionLimit : undefined,
          folderIds: rule.folderIds || [],
          topicIds: rule.topicIds || [],
          difficulties: rule.difficulties || [],
          tags: rule.tags || [],
          limit: rule.limit,
        })),
      }));

      if (hasMatrix) {
        try {
          const template = await this.matricesService.getMatrixDetail(matrixId, teacherId);
          subjectId = template.subjectId;
        } catch {
          // Bỏ qua nếu Matrix gốc đã bị giáo viên xóa mất
        }
      }
    } else if (hasMatrix) {
      const template = await this.matricesService.getMatrixDetail(matrixId, teacherId);
      sectionsToProcess = template.sections.map((sec: any) => ({
        name: sec.name,
        orderIndex: sec.orderIndex,
        rules: sec.rules.map((rule: any) => ({
          questionType: rule.questionType ?? RuleQuestionType.MIXED,
          subQuestionLimit: rule.questionType === RuleQuestionType.PASSAGE ? rule.subQuestionLimit : undefined,
          folderIds: rule.folderIds?.map((id: Types.ObjectId) => id.toString()) || [],
          topicIds: rule.topicIds?.map((id: Types.ObjectId) => id.toString()) || [],
          difficulties: rule.difficulties || [],
          tags: rule.tags || [],
          limit: rule.limit,
        })),
      }));
      subjectId = template.subjectId;
    } else {
      throw new BadRequestException('Đề thi không có cấu trúc Ma trận lưu trữ (Thiếu cả Snapshot và Library Link).');
    }

    return { sectionsToProcess, subjectId };
  }

  async previewDynamicExam(payload: PreviewDynamicExamPayload) {
    const { teacherId, matrixId, adHocSections } = payload;
    const teacherObjId = new Types.ObjectId(teacherId);

    const { sectionsToProcess } = await this.resolveSectionsToProcess(
      teacherId,
      matrixId,
      adHocSections,
    );

    const { finalPaperQuestions, finalAnswerKeys } =
      await this.buildQuestionsFromSections(
        teacherObjId,
        sectionsToProcess,
        new Set<string>(),
        1,
      );

    this.logger.log(
      `[Dry-Run Preview] Teacher ${teacherId} generated a preview. Questions: ${finalPaperQuestions.length}`,
    );

    return {
      message: 'Tạo bản xem trước thành công (Dry-Run). Dữ liệu chưa được lưu.',
      totalItems: finalPaperQuestions.length,
      totalActualQuestions: finalAnswerKeys.length,
      previewData: {
        questions: finalPaperQuestions,
        answerKeys: finalAnswerKeys,
      },
    };
  }

  async generateDynamicExam(payload: GenerateDynamicExamPayload) {
    const { teacherId, title, totalScore, matrixId, adHocSections } = payload;
    const teacherObjId = new Types.ObjectId(teacherId);

    const { sectionsToProcess, subjectId } =
      await this.resolveSectionsToProcess(teacherId, matrixId, adHocSections);

    const { finalPaperQuestions, finalAnswerKeys } =
      await this.buildQuestionsFromSections(
        teacherObjId,
        sectionsToProcess,
        new Set<string>(),
        1,
      );

    this.applyScoring(totalScore, finalPaperQuestions, finalAnswerKeys);

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

    const paper = (await this.examPapersRepo.modelInstance
      .findById(paperObjId)
      .populate('examId', 'teacherId isPublished')
      .lean()
      .exec()) as any;

    if (!paper) throw new NotFoundException('Mã đề không tồn tại.');
    if (paper.examId.teacherId.toString() !== teacherId)
      throw new ForbiddenException('Bạn không có quyền sửa đề thi này.');
    if (paper.examId.isPublished)
      throw new BadRequestException(
        'Đề thi đã khóa (Published). Không thể đắp thêm câu hỏi.',
      );

    const { sectionsToProcess } = await this.resolveSectionsToProcess(
      teacherId,
      matrixId,
      adHocSections,
    );

    const existingExcludeIds = new Set<string>();
    let maxOrderIndex = 0;

    for (const q of paper.questions) {
      existingExcludeIds.add(q.originalQuestionId.toString());
      if (q.orderIndex > maxOrderIndex) {
        maxOrderIndex = q.orderIndex;
      }
    }

    const startOrderIndex = maxOrderIndex + 1;
    const { finalPaperQuestions, finalAnswerKeys } =
      await this.buildQuestionsFromSections(
        teacherObjId,
        sectionsToProcess,
        existingExcludeIds,
        startOrderIndex,
      );

    await this.examPapersRepo.updateByIdSafe(paperObjId, {
      $push: {
        questions: { $each: finalPaperQuestions },
        answerKeys: { $each: finalAnswerKeys },
      },
    });

    this.logger.log(
      `[Builder] Teacher ${teacherId} đắp thêm ${finalAnswerKeys.length} câu vào Paper ${paperId} bằng Matrix`,
    );

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

    const paper = (await this.examPapersRepo.modelInstance
      .findById(paperObjId)
      .populate('examId', 'teacherId isPublished')
      .select('questions examId')
      .lean()
      .exec()) as any;

    if (!paper) throw new NotFoundException('Mã đề không tồn tại.');
    if (paper.examId.teacherId.toString() !== teacherId) {
      throw new ForbiddenException(
        'Bạn không có quyền thao tác trên đề thi này.',
      );
    }
    if (paper.examId.isPublished) {
      throw new BadRequestException(
        'Đề thi đã khóa (Published). Không thể thay đổi rule.',
      );
    }

    const excludeIds = paper.questions.map((q: any) => q.originalQuestionId);

    const [expandedFolderIds, expandedTopicIds] = await Promise.all([
      this.expandHierarchyIds(this.foldersRepo, 'folder', rule.folderIds),
      this.expandHierarchyIds(this.topicsRepo, 'topic', rule.topicIds),
    ]);

    const mappedRule: RepositoryRuleFilter = {
      questionType: rule.questionType ?? RuleQuestionType.MIXED,
      subQuestionLimit: rule.questionType === RuleQuestionType.PASSAGE ? rule.subQuestionLimit : undefined,
      folderIds: expandedFolderIds.map((id) => new Types.ObjectId(id)),
      topicIds: expandedTopicIds.map((id) => new Types.ObjectId(id)),
      difficulties: rule.difficulties || [],
      tags: rule.tags || [],
      limit: rule.limit || 1,
    };

    const availableCount =
      await this.questionsRepo.countAvailableQuestionsForRule(
        teacherObjId,
        mappedRule,
        excludeIds,
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
    adHocSections?: any[],
  ) {
    const { sectionsToProcess } = await this.resolveSectionsToProcess(
      teacherId,
      matrixId,
      adHocSections,
    );

    const { finalPaperQuestions, finalAnswerKeys } =
      await this.buildQuestionsFromSections(
        new Types.ObjectId(teacherId),
        sectionsToProcess,
        new Set<string>(),
        1,
      );

    this.applyScoring(totalScore, finalPaperQuestions, finalAnswerKeys);

    return {
      questions: finalPaperQuestions,
      answerKeys: finalAnswerKeys,
    };
  }

  async countAvailableForRule(
    teacherId: string,
    rule: {
      questionType?: RuleQuestionType;
      subQuestionLimit?: number;
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

    const mappedRule: RepositoryRuleFilter = {
      questionType: rule.questionType ?? RuleQuestionType.MIXED,
      subQuestionLimit: rule.questionType === RuleQuestionType.PASSAGE ? rule.subQuestionLimit : undefined,
      folderIds: expandedFolderIds.map((id) => new Types.ObjectId(id)),
      topicIds: expandedTopicIds.map((id) => new Types.ObjectId(id)),
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