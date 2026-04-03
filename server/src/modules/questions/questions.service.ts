import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

import {
  QuestionsRepository,
  QuestionFilterParams,
} from './questions.repository';
import {
  QuestionDocument,
  DifficultyLevel,
  QuestionType,
} from './schemas/question.schema';
import { KnowledgeTopicsRepository } from '../taxonomy/knowledge-topics.repository';
import { UsersService } from '../users/users.service';

import { QuestionFoldersRepository } from './question-folders.repository';
import { MediaRepository } from '../media/media.repository';
import {
  BulkCreateQuestionPayload,
  CreateQuestionPayload,
  UpdatePassagePayload,
  QuestionSyncAction,
  QuestionSyncJobData,
  CloneQuestionPayload,
  BulkCloneQuestionPayload,
  BulkDeleteQuestionPayload,
  QuestionFilterPayload,
  BulkStandardizeQuestionPayload,
  SuggestFolderPayload,
  GetActiveFiltersPayload,
  PrunedTreeNode,
  ActiveFiltersResponse,
  BulkPublishQuestionPayload,
} from './interfaces/question.interface';
import { DIFFICULTY_NAME_MAP } from './constants/question.constant';
import { QuestionOrganizerEngine } from './engines/question-organizer.engine';
import { PreviewOrganizePayload } from './interfaces/question-organizer.interface';
import {
  AutoTagJobPayload,
  QUESTION_TASKS_QUEUE,
} from './interfaces/question-jobs.interface';

export type UpdateQuestionPayload = Partial<CreateQuestionPayload>;
export type MoveQuestionsPayload = {
  questionIds: string[];
  destFolderId: string;
};

@Injectable()
export class QuestionsService {
  private readonly logger = new Logger(QuestionsService.name);

  constructor(
    private readonly questionsRepository: QuestionsRepository,
    private readonly topicsRepo: KnowledgeTopicsRepository,
    private readonly usersService: UsersService,
    private readonly foldersRepo: QuestionFoldersRepository,
    private readonly mediaRepo: MediaRepository,
    @InjectQueue('question-sync')
    private readonly syncQueue: Queue<QuestionSyncJobData>,
    @InjectQueue(QUESTION_TASKS_QUEUE)
    private readonly questionTasksQueue: Queue,
    private readonly organizerEngine: QuestionOrganizerEngine,
  ) {}

  private async dispatchSyncEvent(
    action: QuestionSyncAction,
    questionIds: string[],
  ) {
    if (!questionIds || questionIds.length === 0) return;

    try {
      const jobs = questionIds.map((id) => ({
        name: 'sync-to-exam-paper',
        data: { action, questionId: id },
        opts: {
          removeOnComplete: true,
          removeOnFail: false,
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
        },
      }));

      await this.syncQueue.addBulk(jobs);
      this.logger.debug(
        `[BullMQ] Đã bắn tín hiệu ${action} cho ${questionIds.length} câu hỏi vào hàng đợi.`,
      );
    } catch (error: any) {
      this.logger.error(
        `[BullMQ Panic] Lỗi đẩy Job đồng bộ câu hỏi: ${error.message}`,
      );
    }
  }

  private async validateMediaOwnership(
    ownerId: string,
    mediaIds: string[],
  ): Promise<Types.ObjectId[]> {
    if (!mediaIds || mediaIds.length === 0) return [];

    const uniqueIds = [...new Set(mediaIds)];
    const objectIds = uniqueIds.map((id) => new Types.ObjectId(id));

    const validCount = await (this.mediaRepo as any).model.countDocuments({
      _id: { $in: objectIds },
      uploadedBy: new Types.ObjectId(ownerId),
    });

    if (validCount !== uniqueIds.length) {
      throw new BadRequestException(
        'Một hoặc nhiều tệp đính kèm không tồn tại hoặc không thuộc quyền sở hữu của bạn.',
      );
    }

    return objectIds;
  }

  async bulkCreateQuestions(payload: BulkCreateQuestionPayload) {
    const { ownerId, folderId, questions } = payload;

    const folder = await (this.foldersRepo as any).findByIdSafe(
      new Types.ObjectId(folderId),
    );
    if (!folder || folder.ownerId.toString() !== ownerId) {
      throw new ForbiddenException(
        'Thư mục không tồn tại hoặc bạn không có quyền truy cập.',
      );
    }

    const allMediaIdsToValidate: string[] = [];
    for (const q of questions) {
      if (q.attachedMedia) allMediaIdsToValidate.push(...q.attachedMedia);
      if (q.subQuestions) {
        for (const sub of q.subQuestions) {
          if (sub.attachedMedia)
            allMediaIdsToValidate.push(...sub.attachedMedia);
        }
      }
    }
    await this.validateMediaOwnership(ownerId, allMediaIdsToValidate);

    return this.questionsRepository.executeInTransaction(async () => {
      const flatDocuments: any[] = [];
      const ownerObjectId = new Types.ObjectId(ownerId);
      const folderObjectId = new Types.ObjectId(folderId);

      for (const q of questions) {
        const mappedMedia = (q.attachedMedia || []).map(
          (id) => new Types.ObjectId(id),
        );

        if (q.type === QuestionType.PASSAGE && q.subQuestions?.length) {
          const parentId = new Types.ObjectId();

          flatDocuments.push({
            _id: parentId,
            ownerId: ownerObjectId,
            folderId: folderObjectId,
            topicId: q.topicId ? new Types.ObjectId(q.topicId) : null,
            type: QuestionType.PASSAGE,
            content: q.content,
            explanation: q.explanation || null,
            answers: [],
            attachedMedia: mappedMedia,
            tags: q.tags || [],
            difficultyLevel: q.difficultyLevel || DifficultyLevel.UNKNOWN,
            isDraft: q.isDraft !== undefined ? q.isDraft : true,
          });

          q.subQuestions.forEach((sub, index) => {
            flatDocuments.push({
              _id: new Types.ObjectId(),
              ownerId: ownerObjectId,
              folderId: folderObjectId,
              topicId: q.topicId ? new Types.ObjectId(q.topicId) : null,
              parentPassageId: parentId,
              type: QuestionType.MULTIPLE_CHOICE,
              content: sub.content,
              explanation: sub.explanation || null,
              answers: sub.answers,
              orderIndex: index + 1,
              attachedMedia: (sub.attachedMedia || []).map(
                (id) => new Types.ObjectId(id),
              ),
              tags: q.tags || [],
              difficultyLevel: sub.difficultyLevel || DifficultyLevel.UNKNOWN,
              isDraft: q.isDraft !== undefined ? q.isDraft : true,
            });
          });
        } else {
          flatDocuments.push({
            _id: new Types.ObjectId(),
            ownerId: ownerObjectId,
            folderId: folderObjectId,
            topicId: q.topicId ? new Types.ObjectId(q.topicId) : null,
            type: q.type,
            content: q.content,
            explanation: q.explanation || null,
            answers: q.answers || [],
            attachedMedia: mappedMedia,
            tags: q.tags || [],
            difficultyLevel: q.difficultyLevel || DifficultyLevel.UNKNOWN,
            isDraft: q.isDraft !== undefined ? q.isDraft : true,
          });
        }
      }

      const result = await (this.questionsRepository as any).insertManySafe(
        flatDocuments,
      );
      const insertedIds = result.map((doc: any) => doc._id.toString());

      this.logger.log(
        `[Import] User ${ownerId} imported ${result.length} questions into Folder ${folderId}`,
      );

      return {
        message: `Đã import thành công ${result.length} câu hỏi.`,
        count: result.length,
        insertedIds,
      };
    });
  }

  async bulkStandardizeQuestions(
    ownerId: string,
    payload: BulkStandardizeQuestionPayload,
  ) {
    const { questionIds, topicId, difficultyLevel, autoOrganize } = payload;

    const topic = await (this.topicsRepo as any).findByIdSafe(
      new Types.ObjectId(topicId),
    );
    if (!topic) throw new NotFoundException('Chuyên đề không tồn tại.');

    const owner = await this.usersService.findById(ownerId);
    if (!owner) throw new ForbiddenException('Tài khoản không tồn tại.');

    const hasPermission = owner.subjectIds?.some(
      (id: Types.ObjectId) => id.toString() === topic.subjectId.toString(),
    );
    if (!hasPermission)
      throw new ForbiddenException(
        'Bạn không có chuyên môn để gán câu hỏi cho môn học này.',
      );

    const objectIds = questionIds.map((id) => new Types.ObjectId(id));

    return this.questionsRepository.executeInTransaction(async () => {
      const questionModel = (this.questionsRepository as any).model;
      const session = (this.questionsRepository as any).currentSession;

      if (!autoOrganize) {
        const updateResult = await questionModel.updateMany(
          { _id: { $in: objectIds }, ownerId: new Types.ObjectId(ownerId) },
          {
            $set: {
              topicId: new Types.ObjectId(topicId),
              difficultyLevel: difficultyLevel,
              isDraft: false,
            },
          },
          { session },
        );
        return {
          message: `Đã chuẩn hóa thành công ${updateResult.modifiedCount} câu hỏi.`,
        };
      }

      const questions = await questionModel
        .find({ _id: { $in: objectIds }, ownerId: new Types.ObjectId(ownerId) })
        .select('_id folderId type')
        .lean()
        .session(session);

      if (questions.length === 0)
        throw new BadRequestException(
          'Không tìm thấy câu hỏi hợp lệ để chuẩn hóa.',
        );

      const folderGroups = new Map<string, Types.ObjectId[]>();
      const passageIds: Types.ObjectId[] = [];

      for (const q of questions) {
        const fId = q.folderId.toString();
        if (!folderGroups.has(fId)) folderGroups.set(fId, []);
        folderGroups.get(fId)!.push(q._id);

        if (q.type === QuestionType.PASSAGE) passageIds.push(q._id);
      }

      const diffName = DIFFICULTY_NAME_MAP[difficultyLevel] || 'Chưa phân loại';
      let totalUpdated = 0;

      for (const [baseFolderId, qIds] of folderGroups.entries()) {
        const baseFolderObjId = new Types.ObjectId(baseFolderId);
        const baseFolder = await (this.foldersRepo as any).findByIdSafe(
          baseFolderObjId,
        );

        let topicFolderId: Types.ObjectId;
        let topicFolderAncestors: Types.ObjectId[] = [];

        if (
          baseFolder &&
          baseFolder.name.trim().toLowerCase() ===
            topic.name.trim().toLowerCase()
        ) {
          topicFolderId = baseFolder._id;
          topicFolderAncestors = baseFolder.ancestors || [];
        } else {
          let topicFolder = await (this.foldersRepo as any).findOneSafe({
            ownerId: new Types.ObjectId(ownerId),
            parentId: baseFolderObjId,
            name: topic.name,
          });

          if (!topicFolder) {
            topicFolder = await (this.foldersRepo as any).createDocument({
              name: topic.name,
              ownerId: new Types.ObjectId(ownerId),
              parentId: baseFolderObjId,
              ancestors: baseFolder
                ? [...(baseFolder.ancestors || []), baseFolder._id]
                : [],
            });
          }
          topicFolderId = topicFolder._id;
          topicFolderAncestors = [
            ...(topicFolder.ancestors || []),
            topicFolder._id,
          ];
        }

        let diffFolder = await (this.foldersRepo as any).findOneSafe({
          ownerId: new Types.ObjectId(ownerId),
          parentId: topicFolderId,
          name: diffName,
        });

        if (!diffFolder) {
          diffFolder = await (this.foldersRepo as any).createDocument({
            name: diffName,
            ownerId: new Types.ObjectId(ownerId),
            parentId: topicFolderId,
            ancestors: topicFolderAncestors,
          });
        }

        const updateRes = await questionModel.updateMany(
          { _id: { $in: qIds } },
          {
            $set: {
              topicId: new Types.ObjectId(topicId),
              difficultyLevel: difficultyLevel,
              isDraft: false,
              folderId: diffFolder._id,
            },
          },
          { session },
        );
        totalUpdated += updateRes.modifiedCount;

        const groupPassageIds = qIds.filter((id) =>
          passageIds.some((pId) => pId.toString() === id.toString()),
        );
        if (groupPassageIds.length > 0) {
          await questionModel.updateMany(
            { parentPassageId: { $in: groupPassageIds } },
            { $set: { folderId: diffFolder._id } },
            { session },
          );
        }
      }

      this.logger.log(
        `[Auto-Routing] User ${ownerId} standardized and moved ${totalUpdated} questions to proper folders.`,
      );
      return {
        message: `Đã chuẩn hóa và tự động sắp xếp ${totalUpdated} câu hỏi vào kho dữ liệu.`,
      };
    });
  }

  async createQuestion(payload: CreateQuestionPayload) {
    if (payload.parentPassageId) {
      if (!Types.ObjectId.isValid(payload.parentPassageId)) {
        throw new BadRequestException(
          'Mã đoạn văn mẹ (parentPassageId) không hợp lệ.',
        );
      }

      const parent = await (this.questionsRepository as any).findByIdSafe(
        payload.parentPassageId,
      );

      if (!parent) {
        throw new NotFoundException('Không tìm thấy đoạn văn mẹ.');
      }
      if (parent.type !== QuestionType.PASSAGE) {
        throw new BadRequestException(
          'Câu hỏi cha không phải là một đoạn văn (PASSAGE). Không thể gán làm parent.',
        );
      }
    }

    const finalAnswers =
      payload.type === QuestionType.PASSAGE ? [] : payload.answers || [];

    const validMediaObjectIds = await this.validateMediaOwnership(
      payload.ownerId,
      payload.attachedMedia || [],
    );

    const newDoc = await this.questionsRepository.createDocument({
      ownerId: new Types.ObjectId(payload.ownerId),
      folderId: new Types.ObjectId(payload.folderId),
      topicId: payload.topicId ? new Types.ObjectId(payload.topicId) : null,
      parentPassageId: payload.parentPassageId
        ? new Types.ObjectId(payload.parentPassageId)
        : null,
      type: payload.type,
      content: payload.content,
      explanation: payload.explanation || null,
      orderIndex: payload.orderIndex || 0,
      answers: finalAnswers,
      difficultyLevel: payload.difficultyLevel,
      tags: payload.tags || [],
      isDraft: payload.isDraft ?? true,
      attachedMedia: validMediaObjectIds,
    });

    const populatedDoc = await newDoc.populate({
      path: 'attachedMedia',
      select: 'url mimetype provider originalName _id',
    });

    return {
      message: 'Tạo câu hỏi thành công.',
      question: {
        id: populatedDoc._id,
        content: populatedDoc.content,
        type: populatedDoc.type,
        attachedMedia: populatedDoc.attachedMedia,
      },
    };
  }

  async updateQuestion(
    id: string,
    ownerId: string,
    payload: UpdateQuestionPayload,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID câu hỏi không hợp lệ.');
    }
    const questionId = new Types.ObjectId(id);

    const question = await (this.questionsRepository as any).findByIdSafe(
      questionId,
    );
    if (!question) throw new NotFoundException('Không tìm thấy câu hỏi.');
    if (question.ownerId.toString() !== ownerId)
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa câu hỏi này.');

    const finalIsDraft =
      payload.isDraft !== undefined ? payload.isDraft : question.isDraft;

    if (finalIsDraft === false) {
      const finalTopicId =
        payload.topicId !== undefined
          ? payload.topicId
          : question.topicId?.toString();
      const finalDiff =
        payload.difficultyLevel !== undefined
          ? payload.difficultyLevel
          : question.difficultyLevel;

      if (!finalTopicId || finalDiff === DifficultyLevel.UNKNOWN) {
        throw new BadRequestException(
          'Không thể bỏ trạng thái Nháp. Câu hỏi xuất bản bắt buộc phải được gán Chuyên đề và Mức độ nhận thức.',
        );
      }
    }
    const updateData: Record<string, any> = { ...payload };

    if (payload.topicId)
      updateData.topicId = new Types.ObjectId(payload.topicId);
    if (payload.folderId)
      updateData.folderId = new Types.ObjectId(payload.folderId);
    if (payload.parentPassageId)
      updateData.parentPassageId = new Types.ObjectId(payload.parentPassageId);

    if (payload.attachedMedia) {
      updateData.attachedMedia = payload.attachedMedia.map(
        (mId: string) => new Types.ObjectId(mId),
      );
    }

    const updated = await (this.questionsRepository as any).updateByIdSafe(
      questionId,
      {
        $set: updateData,
      },
    );

    await this.dispatchSyncEvent(QuestionSyncAction.UPDATE, [
      questionId.toString(),
    ]);

    return updated;
  }

  async cloneQuestion(
    id: string,
    currentOwnerId: string,
    payload: CloneQuestionPayload,
  ) {
    if (
      !Types.ObjectId.isValid(id) ||
      !Types.ObjectId.isValid(payload.destFolderId)
    ) {
      throw new BadRequestException(
        'ID câu hỏi hoặc thư mục đích không hợp lệ.',
      );
    }

    const questionId = new Types.ObjectId(id);
    const destFolderId = new Types.ObjectId(payload.destFolderId);

    const destFolder = await (this.foldersRepo as any).findByIdSafe(
      destFolderId,
    );
    if (!destFolder || destFolder.ownerId.toString() !== currentOwnerId) {
      throw new ForbiddenException(
        'Thư mục đích không tồn tại hoặc bạn không có quyền truy cập.',
      );
    }

    const sourceQuestion = await (this.questionsRepository as any).findByIdSafe(
      questionId,
    );
    if (!sourceQuestion) {
      throw new NotFoundException('Câu hỏi gốc không tồn tại.');
    }
    if (sourceQuestion.ownerId.toString() !== currentOwnerId) {
      throw new ForbiddenException(
        'Bạn không có quyền nhân bản câu hỏi của người khác.',
      );
    }

    return this.questionsRepository.executeInTransaction(async () => {
      const { _id, createdAt, updatedAt, __v, ...baseData } = sourceQuestion;

      baseData.ownerId = new Types.ObjectId(currentOwnerId);
      baseData.folderId = destFolderId;
      baseData.content = `${baseData.content} (Copy)`;

      if (baseData.type !== QuestionType.PASSAGE) {
        const clonedDoc =
          await this.questionsRepository.createDocument(baseData);
        this.logger.log(
          `[Clone] User ${currentOwnerId} shallow-cloned Question ${id}`,
        );
        return {
          message: 'Nhân bản câu hỏi thành công.',
          data: clonedDoc,
        };
      }

      const newParentId = new Types.ObjectId();
      const parentDoc = { ...baseData, _id: newParentId };

      const subQuestions = await (this.questionsRepository as any).model
        .find({ parentPassageId: questionId })
        .lean();

      const docsToInsert: any[] = [parentDoc];

      for (const sub of subQuestions) {
        const {
          _id: subId,
          createdAt: subCA,
          updatedAt: subUA,
          __v: subV,
          ...subBaseData
        } = sub;

        subBaseData.ownerId = new Types.ObjectId(currentOwnerId);
        subBaseData.folderId = destFolderId;
        subBaseData.parentPassageId = newParentId;

        docsToInsert.push({
          ...subBaseData,
          _id: new Types.ObjectId(),
        });
      }

      const insertedDocs = await (
        this.questionsRepository as any
      ).insertManySafe(docsToInsert);
      this.logger.log(
        `[Clone Engine] User ${currentOwnerId} deep-cloned Passage ${id} containing ${subQuestions.length} sub-questions.`,
      );

      return {
        message: `Nhân bản đoạn văn và ${subQuestions.length} câu hỏi con thành công.`,
        data: insertedDocs.find(
          (doc: any) => doc._id.toString() === newParentId.toString(),
        ),
      };
    });
  }

  private async expandHierarchyIds(
    repo: any,
    inputIds?: string[],
  ): Promise<string[] | undefined> {
    if (!inputIds || inputIds.length === 0) return undefined;

    const objIds = inputIds.map((id) => new Types.ObjectId(id));
    const childNodes = await repo.modelInstance
      .find({ ancestors: { $in: objIds } })
      .select('_id')
      .lean()
      .exec();

    return [
      ...new Set([
        ...inputIds,
        ...childNodes.map((n: any) => n._id.toString()),
      ]),
    ];
  }

  async getQuestionsPaginated(userId: string, payload: QuestionFilterPayload) {
    const expandedFolderIds = await this.expandHierarchyIds(
      this.foldersRepo,
      payload.folderIds,
    );
    const expandedTopicIds = await this.expandHierarchyIds(
      this.topicsRepo,
      payload.topicIds,
    );

    const { folderIds, topicIds, ...restPayload } = payload;

    return this.questionsRepository.getQuestionsPaginated(userId, {
      ...restPayload,
      folderIds: expandedFolderIds,
      topicIds: expandedTopicIds,
    });
  }

  async moveQuestions(ownerId: string, payload: MoveQuestionsPayload) {
    const { questionIds, destFolderId } = payload;

    const destFolder = await this.foldersRepo.findOne({
      _id: new Types.ObjectId(destFolderId),
    } as any);
    if (!destFolder || destFolder.ownerId.toString() !== ownerId) {
      throw new ForbiddenException(
        'Thư mục đích không tồn tại hoặc bạn không có quyền truy cập.',
      );
    }

    const objectIds = questionIds.map((id) => new Types.ObjectId(id));
    const questionModel = (this.questionsRepository as any).model;

    const result = await questionModel.updateMany(
      {
        _id: { $in: objectIds },
        ownerId: new Types.ObjectId(ownerId),
      },
      { $set: { folderId: new Types.ObjectId(destFolderId) } },
    );

    return {
      message: `Đã di chuyển thành công ${result.modifiedCount} câu hỏi.`,
    };
  }

  async deleteQuestion(id: string, ownerId: string) {
    const questionId = new Types.ObjectId(id);
    const questionModel = (this.questionsRepository as any).model;

    const question = await questionModel.findOne({ _id: questionId });
    if (!question) throw new NotFoundException('Câu hỏi không tồn tại.');
    if (question.ownerId.toString() !== ownerId) {
      throw new ForbiddenException('Bạn không có quyền xóa câu hỏi này.');
    }

    const subQuestions = await questionModel
      .find({ parentPassageId: questionId })
      .select('_id')
      .lean();
    const idsToDelete = [
      questionId.toString(),
      ...subQuestions.map((q: any) => q._id.toString()),
    ];

    await questionModel.deleteOne({ _id: questionId });
    await questionModel.deleteMany({ parentPassageId: questionId });

    await this.dispatchSyncEvent(QuestionSyncAction.DELETE, idsToDelete);

    return { message: 'Đã xóa vĩnh viễn câu hỏi.' };
  }

  async updatePassageWithDiffing(
    passageId: string,
    ownerId: string,
    payload: UpdatePassagePayload,
  ) {
    if (!Types.ObjectId.isValid(passageId)) {
      throw new BadRequestException('ID Đoạn văn không hợp lệ.');
    }
    const passageObjectId = new Types.ObjectId(passageId);

    const passage = await (this.questionsRepository as any).findByIdSafe(
      passageObjectId,
    );
    if (!passage) throw new NotFoundException('Không tìm thấy đoạn văn mẹ.');
    if (passage.ownerId.toString() !== ownerId)
      throw new ForbiddenException(
        'Bạn không có quyền chỉnh sửa nội dung này.',
      );
    if (passage.type !== QuestionType.PASSAGE)
      throw new BadRequestException(
        'Câu hỏi này không phải là Đoạn văn (PASSAGE).',
      );

    const allMediaIdsToValidate: string[] = [];
    if (payload.attachedMedia)
      allMediaIdsToValidate.push(...payload.attachedMedia);
    payload.subQuestions.forEach((sub) => {
      if (sub.attachedMedia) allMediaIdsToValidate.push(...sub.attachedMedia);
    });

    await this.validateMediaOwnership(ownerId, allMediaIdsToValidate);

    const existingSubQuestions = await (this.questionsRepository as any).model
      .find({ parentPassageId: passageObjectId })
      .select('_id')
      .lean();
    const existingIds: string[] = existingSubQuestions.map((q: any) =>
      q._id.toString(),
    );

    const incomingIds: string[] = payload.subQuestions
      .map((sub) => sub.id)
      .filter((id): id is string => !!id);
    const idsToDelete = existingIds.filter((id) => !incomingIds.includes(id));

    const toCreateDocs: any[] = [];
    const bulkUpdateOps: any[] = [];

    payload.subQuestions.forEach((sub, index) => {
      const absoluteOrderIndex = index + 1;
      const mappedMedia = (sub.attachedMedia || []).map(
        (id) => new Types.ObjectId(id),
      );

      if (sub.id) {
        bulkUpdateOps.push({
          updateOne: {
            filter: {
              _id: new Types.ObjectId(sub.id),
              parentPassageId: passageObjectId,
            },
            update: {
              $set: {
                content: sub.content,
                explanation: sub.explanation || null,
                difficultyLevel: sub.difficultyLevel || DifficultyLevel.UNKNOWN,
                answers: sub.answers,
                attachedMedia: mappedMedia,
                orderIndex: absoluteOrderIndex,
              },
            },
          },
        });
      } else {
        toCreateDocs.push({
          _id: new Types.ObjectId(),
          ownerId: passage.ownerId,
          folderId: passage.folderId,
          topicId: passage.topicId,
          parentPassageId: passageObjectId,
          type: QuestionType.MULTIPLE_CHOICE,
          content: sub.content,
          explanation: sub.explanation || null,
          difficultyLevel: sub.difficultyLevel || DifficultyLevel.UNKNOWN,
          answers: sub.answers,
          attachedMedia: mappedMedia,
          tags: payload.tags || passage.tags,
          orderIndex: absoluteOrderIndex,
          isDraft: passage.isDraft,
        });
      }
    });

    const result = await this.questionsRepository.executeInTransaction(
      async () => {
        const session = (this.questionsRepository as any).currentSession;
        const questionModel = (this.questionsRepository as any).model;

        const passageUpdateData: any = {};
        if (payload.content !== undefined)
          passageUpdateData.content = payload.content;
        if (payload.explanation !== undefined)
          passageUpdateData.explanation = payload.explanation;
        if (payload.difficultyLevel !== undefined)
          passageUpdateData.difficultyLevel = payload.difficultyLevel;
        if (payload.tags !== undefined) passageUpdateData.tags = payload.tags;
        if (payload.topicId !== undefined)
          passageUpdateData.topicId = new Types.ObjectId(payload.topicId);

        if (payload.attachedMedia !== undefined) {
          passageUpdateData.attachedMedia = payload.attachedMedia.map(
            (id: string) => new Types.ObjectId(id),
          );
        }

        if (payload.isDraft !== undefined) {
          passageUpdateData.isDraft = payload.isDraft;

          if (payload.isDraft === false) {
            const finalTopicId =
              payload.topicId !== undefined
                ? payload.topicId
                : passage.topicId?.toString();
            const finalDiff =
              payload.difficultyLevel !== undefined
                ? payload.difficultyLevel
                : passage.difficultyLevel;

            if (!finalTopicId || finalDiff === DifficultyLevel.UNKNOWN) {
              throw new BadRequestException(
                'Không thể xuất bản! Đoạn văn bắt buộc phải được gán Chuyên đề và Mức độ nhận thức.',
              );
            }
          }
        }

        if (Object.keys(passageUpdateData).length > 0) {
          await questionModel.updateOne(
            { _id: passageObjectId },
            { $set: passageUpdateData },
            { session },
          );
        }

        if (idsToDelete.length > 0) {
          const objectIdsToDelete = idsToDelete.map(
            (id) => new Types.ObjectId(id),
          );
          await (this.questionsRepository as any).deleteManySafe({
            _id: { $in: objectIdsToDelete },
            parentPassageId: passageObjectId,
          });
        }

        if (toCreateDocs.length > 0) {
          await (this.questionsRepository as any).insertManySafe(toCreateDocs);
        }

        if (bulkUpdateOps.length > 0) {
          await questionModel.bulkWrite(bulkUpdateOps, { session });
        }

        this.logger.log(
          `[Diffing Engine] User ${ownerId} updated Passage ${passageId}. Created: ${toCreateDocs.length}, Updated: ${bulkUpdateOps.length}, Deleted: ${idsToDelete.length}`,
        );

        return {
          message: 'Lưu thay đổi toàn bộ đoạn văn và câu hỏi con thành công.',
          diffStats: {
            deleted: idsToDelete.length,
            created: toCreateDocs.length,
            updated: bulkUpdateOps.length,
          },
        };
      },
    );

    const updatedIds = [
      passageId,
      ...bulkUpdateOps.map((op: any) => op.updateOne.filter._id.toString()),
    ];

    if (updatedIds.length > 0) {
      await this.dispatchSyncEvent(QuestionSyncAction.UPDATE, updatedIds);
    }
    if (idsToDelete.length > 0) {
      await this.dispatchSyncEvent(QuestionSyncAction.DELETE, idsToDelete);
    }

    return result;
  }

  async bulkCloneQuestions(
    currentOwnerId: string,
    payload: BulkCloneQuestionPayload,
  ) {
    const { questionIds, destFolderId } = payload;

    const uniqueIds = [...new Set(questionIds)];
    const objectIds = uniqueIds.map((id) => new Types.ObjectId(id));
    const destFolderObjectId = new Types.ObjectId(destFolderId);

    const destFolder = await (this.foldersRepo as any).findByIdSafe(
      destFolderObjectId,
    );
    if (!destFolder || destFolder.ownerId.toString() !== currentOwnerId) {
      throw new ForbiddenException(
        'Thư mục đích không tồn tại hoặc bạn không có quyền truy cập.',
      );
    }

    const sourceQuestions = await (this.questionsRepository as any).model
      .find({ _id: { $in: objectIds } })
      .lean();

    if (sourceQuestions.length !== uniqueIds.length) {
      throw new BadRequestException(
        'Một số câu hỏi không tồn tại hoặc đã bị xóa khỏi hệ thống.',
      );
    }
    const hasInvalidOwner = sourceQuestions.some(
      (q: any) => q.ownerId.toString() !== currentOwnerId,
    );
    if (hasInvalidOwner) {
      throw new ForbiddenException(
        'Phát hiện truy cập trái phép! Bạn không có quyền nhân bản câu hỏi của người khác.',
      );
    }

    const passageIds = sourceQuestions
      .filter((q: any) => q.type === QuestionType.PASSAGE)
      .map((q: any) => q._id);

    let allSubQuestions: any[] = [];
    if (passageIds.length > 0) {
      allSubQuestions = await (this.questionsRepository as any).model
        .find({ parentPassageId: { $in: passageIds } })
        .lean();
    }
    return this.questionsRepository.executeInTransaction(async () => {
      const docsToInsert: any[] = [];
      const passageIdMap = new Map<string, Types.ObjectId>();

      for (const q of sourceQuestions) {
        const { _id, createdAt, updatedAt, __v, ...baseData } = q;

        baseData.ownerId = new Types.ObjectId(currentOwnerId);
        baseData.folderId = destFolderObjectId;
        baseData.content = `${baseData.content} (Copy)`;

        const newRootId = new Types.ObjectId();

        if (baseData.type === QuestionType.PASSAGE) {
          passageIdMap.set(_id.toString(), newRootId);
        }

        docsToInsert.push({ ...baseData, _id: newRootId });
      }

      for (const sub of allSubQuestions) {
        const { _id, createdAt, updatedAt, __v, ...subBaseData } = sub;

        subBaseData.ownerId = new Types.ObjectId(currentOwnerId);
        subBaseData.folderId = destFolderObjectId;

        const oldParentIdStr = sub.parentPassageId.toString();
        const newParentId = passageIdMap.get(oldParentIdStr);

        if (!newParentId) {
          this.logger.warn(
            `[Bulk Clone] Mồ côi câu hỏi con ${oldParentIdStr}. Bỏ qua.`,
          );
          continue;
        }

        subBaseData.parentPassageId = newParentId;
        docsToInsert.push({ ...subBaseData, _id: new Types.ObjectId() });
      }

      await (this.questionsRepository as any).insertManySafe(docsToInsert);

      this.logger.log(
        `[Bulk Clone] User ${currentOwnerId} cloned ${sourceQuestions.length} roots and ${allSubQuestions.length} subs into Folder ${destFolderId}.`,
      );

      return {
        message: `Đã nhân bản thành công ${sourceQuestions.length} câu hỏi.`,
        clonedRootCount: sourceQuestions.length,
        clonedSubCount: allSubQuestions.length,
      };
    });
  }

  async bulkDeleteQuestions(
    currentOwnerId: string,
    payload: BulkDeleteQuestionPayload,
  ) {
    const { questionIds } = payload;

    const uniqueIds = [...new Set(questionIds)];
    const objectIds = uniqueIds.map((id) => new Types.ObjectId(id));
    const ownerObjectId = new Types.ObjectId(currentOwnerId);

    const sourceQuestions = await (this.questionsRepository as any).model
      .find({ _id: { $in: objectIds } })
      .select('_id ownerId type')
      .lean();

    if (sourceQuestions.length !== uniqueIds.length) {
      throw new BadRequestException(
        'Một số câu hỏi không tồn tại hoặc đã bị xóa trước đó.',
      );
    }
    const hasInvalidOwner = sourceQuestions.some(
      (q: any) => q.ownerId.toString() !== currentOwnerId,
    );
    if (hasInvalidOwner) {
      throw new ForbiddenException(
        'Phát hiện truy cập trái phép! Bạn không có quyền xóa câu hỏi của người khác.',
      );
    }

    const passageIds = sourceQuestions
      .filter((q: any) => q.type === QuestionType.PASSAGE)
      .map((q: any) => q._id);

    let subQuestionIds: Types.ObjectId[] = [];
    if (passageIds.length > 0) {
      const subQuestions = await (this.questionsRepository as any).model
        .find({ parentPassageId: { $in: passageIds } })
        .select('_id')
        .lean();

      subQuestionIds = subQuestions.map((q: any) => q._id);
    }

    const allObjectIdsToDelete = [...objectIds, ...subQuestionIds];
    const allStringIdsToDelete = allObjectIdsToDelete.map((id) =>
      id.toString(),
    );

    const deleteResult = await (
      this.questionsRepository as any
    ).model.deleteMany({
      _id: { $in: allObjectIdsToDelete },
    });

    this.logger.log(
      `[Bulk Delete] User ${currentOwnerId} deleted ${deleteResult.deletedCount} items (${uniqueIds.length} roots, ${subQuestionIds.length} subs).`,
    );

    await this.dispatchSyncEvent(
      QuestionSyncAction.DELETE,
      allStringIdsToDelete,
    );

    return {
      message: `Đã xóa vĩnh viễn ${uniqueIds.length} câu hỏi đã chọn.`,
      deletedCount: deleteResult.deletedCount,
    };
  }

  async suggestFoldersForMove(ownerId: string, payload: SuggestFolderPayload) {
    const { questionIds } = payload;
    const objectIds = questionIds.map((id) => new Types.ObjectId(id));

    const questions = await (this.questionsRepository as any).model
      .find({ _id: { $in: objectIds }, ownerId: new Types.ObjectId(ownerId) })
      .select('topicId difficultyLevel')
      .lean()
      .exec();

    if (questions.length === 0) return [];

    const topicCounts: Record<string, number> = {};
    for (const q of questions) {
      if (q.topicId) {
        const tid = q.topicId.toString();
        topicCounts[tid] = (topicCounts[tid] || 0) + 1;
      }
    }

    const topicKeys = Object.keys(topicCounts);

    if (topicKeys.length === 0) return [];

    const topTopicId = topicKeys.reduce((a, b) =>
      topicCounts[a] > topicCounts[b] ? a : b,
    );

    const diffCounts: Record<string, number> = {};
    const filteredQuestions = questions.filter(
      (q: any) => q.topicId?.toString() === topTopicId,
    );

    for (const q of filteredQuestions) {
      const diff = q.difficultyLevel || DifficultyLevel.UNKNOWN;
      diffCounts[diff] = (diffCounts[diff] || 0) + 1;
    }

    const diffKeys = Object.keys(diffCounts);
    const topDiff =
      diffKeys.length > 0
        ? (diffKeys.reduce((a, b) =>
            diffCounts[a] > diffCounts[b] ? a : b,
          ) as DifficultyLevel)
        : DifficultyLevel.UNKNOWN;

    const topic = await (this.topicsRepo as any).findByIdSafe(
      new Types.ObjectId(topTopicId),
    );
    if (!topic) return [];

    const suggestions: any[] = [];
    const ownerObjId = new Types.ObjectId(ownerId);

    const topicFolder = await (this.foldersRepo as any).findOneSafe({
      ownerId: ownerObjId,
      name: topic.name,
    });

    if (topicFolder) {
      const diffName = DIFFICULTY_NAME_MAP[topDiff] || 'Chưa phân loại';

      const diffFolder = await (this.foldersRepo as any).findOneSafe({
        ownerId: ownerObjId,
        parentId: topicFolder._id,
        name: diffName,
      });

      if (diffFolder) {
        suggestions.push({
          id: diffFolder._id.toString(),
          name: `${topicFolder.name} > ${diffFolder.name}`,
          isExactMatch: true,
        });
      }

      suggestions.push({
        id: topicFolder._id.toString(),
        name: topicFolder.name,
        isExactMatch: !diffFolder,
      });
    }

    return suggestions;
  }

  async previewOrganize(ownerId: string, payload: PreviewOrganizePayload) {
    return this.organizerEngine.generateBlueprint(ownerId, payload);
  }

  async executeOrganize(ownerId: string, payload: PreviewOrganizePayload) {
    const blueprint = await this.organizerEngine.generateBlueprint(
      ownerId,
      payload,
    );

    const result = await this.organizerEngine.execute(ownerId, payload);

    const movedQuestionIds = blueprint.mappings.map((m) =>
      m.questionId.toString(),
    );

    if (movedQuestionIds.length > 0) {
      await this.dispatchSyncEvent(QuestionSyncAction.UPDATE, movedQuestionIds);
    }

    return result;
  }

  async dispatchAutoTagJob(
    teacherId: string,
    payload: { questionIds: string[] },
  ) {
    const validCount = await this.questionsRepository.countValidQuestions(
      payload.questionIds,
      teacherId,
    );
    if (validCount !== payload.questionIds.length) {
      throw new ForbiddenException(
        'Một hoặc nhiều câu hỏi không tồn tại, bị lưu trữ hoặc bạn không có quyền sở hữu.',
      );
    }

    const teacher = await this.usersService.findById(teacherId);
    if (!teacher || !teacher.subjectIds || teacher.subjectIds.length === 0) {
      throw new BadRequestException(
        'Tài khoản của bạn chưa được phân công giảng dạy bộ môn nào. Vui lòng liên hệ Admin.',
      );
    }

    const firstSubject: any = teacher.subjectIds[0];
    const targetSubjectId = firstSubject._id
      ? firstSubject._id.toString()
      : firstSubject.toString();

    if (!Types.ObjectId.isValid(targetSubjectId)) {
      throw new BadRequestException(
        `Lỗi dữ liệu hệ thống: Mã môn học không hợp lệ (${targetSubjectId}).`,
      );
    }

    const jobPayload: AutoTagJobPayload = {
      teacherId,
      questionIds: payload.questionIds,
      subjectId: targetSubjectId,
    };

    await this.questionTasksQueue.add('process-auto-tag', jobPayload, {
      removeOnComplete: true,
      removeOnFail: false,
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    });

    this.logger.log(
      `[Queue] Đã dispatch Job AI Auto-Tag cho ${payload.questionIds.length} câu hỏi (Teacher: ${teacherId})`,
    );

    return {
      message:
        'Yêu cầu AI phân tích thuộc tính đã được đưa vào hệ thống xử lý ngầm. Vui lòng kiểm tra lại sau ít phút.',
      jobDispatched: true,
    };
  }

  private buildPrunedTree(nodes: any[]): PrunedTreeNode[] {
    const map = new Map<string, PrunedTreeNode>();
    const roots: PrunedTreeNode[] = [];

    nodes.forEach((node) => {
      map.set(node._id.toString(), {
        id: node._id.toString(),
        name: node.name,
        children: [],
      });
    });

    nodes.forEach((node) => {
      const current = map.get(node._id.toString())!;
      if (node.parentId) {
        const parent = map.get(node.parentId.toString());
        if (parent) {
          parent.children.push(current);
        } else {
          roots.push(current);
        }
      } else {
        roots.push(current);
      }
    });

    return roots;
  }

  async getActiveFilters(
    ownerId: string,
    payload: GetActiveFiltersPayload,
  ): Promise<ActiveFiltersResponse> {
    const expandedPayload: GetActiveFiltersPayload = {
      ...payload,
      folderIds: await this.expandHierarchyIds(
        this.foldersRepo,
        payload.folderIds,
      ),
      topicIds: await this.expandHierarchyIds(
        this.topicsRepo,
        payload.topicIds,
      ),
    };

    const rawMetadata = await this.questionsRepository.getActiveFiltersMetadata(
      ownerId,
      expandedPayload,
    );

    let finalFoldersTree: PrunedTreeNode[] = [];
    if (rawMetadata.folderIds.length > 0) {
      const leafObjIds = rawMetadata.folderIds.map(
        (id: string) => new Types.ObjectId(id),
      );

      const leafNodes = await (this.foldersRepo as any).modelInstance
        .find({ _id: { $in: leafObjIds } })
        .select('ancestors')
        .lean()
        .exec();

      const allRequiredIds = new Set<string>(rawMetadata.folderIds);
      leafNodes.forEach((node: any) => {
        node.ancestors?.forEach((a: Types.ObjectId) =>
          allRequiredIds.add(a.toString()),
        );
      });

      const allNodes = await (this.foldersRepo as any).modelInstance
        .find({
          _id: {
            $in: Array.from(allRequiredIds).map((id) => new Types.ObjectId(id)),
          },
        })
        .select('_id name parentId')
        .lean()
        .exec();

      finalFoldersTree = this.buildPrunedTree(allNodes);
    }

    let finalTopicsTree: PrunedTreeNode[] = [];
    if (rawMetadata.topicIds.length > 0) {
      const leafObjIds = rawMetadata.topicIds.map(
        (id: string) => new Types.ObjectId(id),
      );

      const leafNodes = await (this.topicsRepo as any).modelInstance
        .find({ _id: { $in: leafObjIds } })
        .select('ancestors')
        .lean()
        .exec();

      const allRequiredIds = new Set<string>(rawMetadata.topicIds);
      leafNodes.forEach((node: any) => {
        node.ancestors?.forEach((a: Types.ObjectId) =>
          allRequiredIds.add(a.toString()),
        );
      });

      const allNodes = await (this.topicsRepo as any).modelInstance
        .find({
          _id: {
            $in: Array.from(allRequiredIds).map((id) => new Types.ObjectId(id)),
          },
        })
        .select('_id name parentId')
        .lean()
        .exec();

      finalTopicsTree = this.buildPrunedTree(allNodes);
    }

    return {
      folders: finalFoldersTree,
      topics: finalTopicsTree,
      difficulties: rawMetadata.difficulties,
      tags: rawMetadata.tags,
    };
  }

  async bulkPublishQuestions(
    ownerId: string,
    payload: BulkPublishQuestionPayload,
  ) {
    const { questionIds } = payload;
    const uniqueIds = [...new Set(questionIds)];
    const objectIds = uniqueIds.map((id) => new Types.ObjectId(id));

    const questions = await (this.questionsRepository as any).model
      .find({ _id: { $in: objectIds }, ownerId: new Types.ObjectId(ownerId) })
      .select('_id type topicId difficultyLevel parentPassageId isDraft')
      .lean()
      .exec();

    if (questions.length !== uniqueIds.length) {
      throw new BadRequestException(
        'Một số câu hỏi không tồn tại, đã bị xóa hoặc bạn không có quyền sở hữu.',
      );
    }

    const invalidRoots = questions.filter(
      (q: any) =>
        !q.parentPassageId &&
        (!q.topicId || q.difficultyLevel === DifficultyLevel.UNKNOWN),
    );

    if (invalidRoots.length > 0) {
      throw new BadRequestException(
        `Không thể xuất bản! Có ${invalidRoots.length} câu hỏi gốc chưa được gán Chuyên đề hoặc Mức độ nhận thức. Vui lòng chuẩn hóa trước khi xuất bản.`,
      );
    }

    return this.questionsRepository.executeInTransaction(async () => {
      const questionModel = (this.questionsRepository as any).model;
      const session = (this.questionsRepository as any).currentSession;

      const updateResult = await questionModel.updateMany(
        { _id: { $in: objectIds } },
        { $set: { isDraft: false } },
        { session },
      );

      const passageIds = questions
        .filter((q: any) => q.type === QuestionType.PASSAGE)
        .map((q: any) => q._id);

      let childrenUpdated = 0;
      if (passageIds.length > 0) {
        const childUpdateRes = await questionModel.updateMany(
          { parentPassageId: { $in: passageIds } },
          { $set: { isDraft: false } },
          { session },
        );
        childrenUpdated = childUpdateRes.modifiedCount;
      }

      this.logger.log(
        `[Bulk Publish] User ${ownerId} published ${updateResult.modifiedCount} questions and ${childrenUpdated} sub-questions.`,
      );

      return {
        message: `Đã xuất bản thành công ${updateResult.modifiedCount} câu hỏi.`,
        publishedCount: updateResult.modifiedCount + childrenUpdated,
      };
    });
  }

  async getActiveFiltersForQuizBuilder(
    ownerId: string,
    payload: GetActiveFiltersPayload,
  ): Promise<ActiveFiltersResponse> {
    const expandedPayload: GetActiveFiltersPayload = {
      ...payload,
      folderIds: await this.expandHierarchyIds(
        this.foldersRepo,
        payload.folderIds,
      ),
      topicIds: await this.expandHierarchyIds(
        this.topicsRepo,
        payload.topicIds,
      ),
    };

    const rawMetadata =
      await this.questionsRepository.getPublishedActiveFiltersMetadata(
        ownerId,
        expandedPayload,
      );

    let finalFoldersTree: PrunedTreeNode[] = [];
    if (rawMetadata.folderIds.length > 0) {
      const leafObjIds = rawMetadata.folderIds.map(
        (id: string) => new Types.ObjectId(id),
      );
      const leafNodes = await (this.foldersRepo as any).modelInstance
        .find({ _id: { $in: leafObjIds } })
        .select('ancestors')
        .lean()
        .exec();

      const allRequiredIds = new Set<string>(rawMetadata.folderIds);
      leafNodes.forEach((node: any) => {
        node.ancestors?.forEach((a: Types.ObjectId) =>
          allRequiredIds.add(a.toString()),
        );
      });

      const allNodes = await (this.foldersRepo as any).modelInstance
        .find({
          _id: {
            $in: Array.from(allRequiredIds).map((id) => new Types.ObjectId(id)),
          },
        })
        .select('_id name parentId')
        .lean()
        .exec();

      finalFoldersTree = this.buildPrunedTree(allNodes);
    }

    let finalTopicsTree: PrunedTreeNode[] = [];
    if (rawMetadata.topicIds.length > 0) {
      const leafObjIds = rawMetadata.topicIds.map(
        (id: string) => new Types.ObjectId(id),
      );
      const leafNodes = await (this.topicsRepo as any).modelInstance
        .find({ _id: { $in: leafObjIds } })
        .select('ancestors')
        .lean()
        .exec();

      const allRequiredIds = new Set<string>(rawMetadata.topicIds);
      leafNodes.forEach((node: any) => {
        node.ancestors?.forEach((a: Types.ObjectId) =>
          allRequiredIds.add(a.toString()),
        );
      });

      const allNodes = await (this.topicsRepo as any).modelInstance
        .find({
          _id: {
            $in: Array.from(allRequiredIds).map((id) => new Types.ObjectId(id)),
          },
        })
        .select('_id name parentId')
        .lean()
        .exec();

      finalTopicsTree = this.buildPrunedTree(allNodes);
    }

    return {
      folders: finalFoldersTree,
      topics: finalTopicsTree,
      difficulties: rawMetadata.difficulties,
      tags: rawMetadata.tags,
    };
  }
}
