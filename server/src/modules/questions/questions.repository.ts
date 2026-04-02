import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { AbstractRepository } from '../../common/database/abstract.repository';
import { Question, QuestionDocument, DifficultyLevel, QuestionType } from './schemas/question.schema';
import { CandidatePool } from '../exams/interfaces/exam-generator.interface';
import { GetActiveFiltersPayload } from './interfaces/question.interface';

export type QuestionFilterParams = {
  page: number;
  limit: number;
  folderIds?: string[];
  topicId?: string;
  difficultyLevels?: DifficultyLevel[];
  search?: string;
  isDraft?: boolean;
};

export type RepoQuestionFilterParams = {
  page: number;
  limit: number;
  folderIds?: string[];
  topicIds?: string[];
  difficultyLevels?: DifficultyLevel[];
  tags?: string[];
  search?: string;
  isDraft?: boolean;
};

@Injectable()
export class QuestionsRepository extends AbstractRepository<QuestionDocument> {
  protected readonly logger = new Logger(QuestionsRepository.name);

  constructor(
    @InjectModel(Question.name) private readonly questionModel: Model<QuestionDocument>,
    @InjectConnection() connection: Connection,
  ) {
    super(questionModel, connection);
  }

  async getRandomQuestions(
    folderIds: string[],
    topicId: string,
    difficulty: DifficultyLevel,
    limit: number
  ): Promise<any[]> {
    const objectIdFolders = folderIds.map(id => new Types.ObjectId(id));

    return this.questionModel.aggregate([
      {
        $match: {
          folderId: { $in: objectIdFolders },
          topicId: new Types.ObjectId(topicId),
          difficultyLevel: difficulty,
          isArchived: false,
          isDraft: false,
          parentPassageId: null,
        }
      },
      { $sample: { size: limit } },
      {
        $project: {
          ownerId: 0,
          isArchived: 0,
          createdAt: 0,
          updatedAt: 0,
          __v: 0
        }
      }
    ]).exec();
  }

  async getQuestionsPaginated(ownerId: string, filter: RepoQuestionFilterParams) {
    const { page, limit, folderIds, topicIds, difficultyLevels, tags, search, isDraft } = filter;
    const skip = (page - 1) * limit;

    const matchStage: any = {
      ownerId: new Types.ObjectId(ownerId),
      isArchived: false,
      parentPassageId: null
    };

    if (folderIds && folderIds.length > 0) {
      matchStage.folderId = { $in: folderIds.map(id => new Types.ObjectId(id)) };
    }

    if (topicIds && topicIds.length > 0) {
      matchStage.topicId = { $in: topicIds.map(id => new Types.ObjectId(id)) };
    }

    if (difficultyLevels && difficultyLevels.length > 0) {
      matchStage.difficultyLevel = { $in: difficultyLevels };
    }

    if (tags && tags.length > 0) {
      matchStage.tags = { $in: tags };
    }

    if (search) matchStage.content = { $regex: search, $options: 'i' };
    if (typeof isDraft === 'boolean') matchStage.isDraft = isDraft;

    const [result] = await this.questionModel.aggregate([
      { $match: matchStage },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
            { $project: { __v: 0 } }
          ],
          totalCount: [
            { $count: 'count' }
          ]
        }
      }
    ]).exec();

    let parents = result.data || [];
    const total = result.totalCount[0]?.count || 0;

    if (parents.length === 0) {
      return { items: [], meta: { total: 0, page, limit, totalPages: 0 } };
    }

    parents = await this.questionModel.populate(parents, {
      path: 'attachedMedia',
      select: 'url mimetype provider originalName _id'
    });

    const passageIds = parents
      .filter((p: any) => p.type === QuestionType.PASSAGE)
      .map((p: any) => p._id);

    let children: any[] = [];
    if (passageIds.length > 0) {
      children = await this.questionModel.find({
        parentPassageId: { $in: passageIds },
        isArchived: false
      })
        .sort({ orderIndex: 1 })
        .select('-__v')
        .lean();

      children = await this.questionModel.populate(children, {
        path: 'attachedMedia',
        select: 'url mimetype provider originalName _id'
      });
    }

    const childrenMap = new Map<string, any[]>();
    for (const child of children) {
      const parentIdStr = child.parentPassageId.toString();
      if (!childrenMap.has(parentIdStr)) {
        childrenMap.set(parentIdStr, []);
      }
      childrenMap.get(parentIdStr)!.push(child);
    }

    const items = parents.map((parent: any) => {
      if (parent.type === QuestionType.PASSAGE) {
        parent.subQuestions = childrenMap.get(parent._id.toString()) || [];
      }
      return parent;
    });

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findSubQuestionsByPassageId(passageIds: Types.ObjectId[]): Promise<QuestionDocument[]> {
    if (!passageIds || passageIds.length === 0) return [];

    return this.model.find({
      parentPassageId: { $in: passageIds },
      isDraft: false,
    })
      .sort({ orderIndex: 1 })
      .populate({
        path: 'attachedMedia',
        select: 'url mimetype provider originalName _id'
      })
      .lean()
      .exec() as Promise<QuestionDocument[]>;
  }

  async generateDynamicQuestions(dynamicConfig: any, optionalTopicId?: string) {
    const { sourceFolders, mixRatio } = dynamicConfig;
    const folderObjIds = sourceFolders.map((id: string) => new Types.ObjectId(id));

    const rootQuestions: any[] = [];

    for (const ratio of mixRatio) {
      const matchStage: any = {
        folderId: { $in: folderObjIds },
        difficultyLevel: ratio.difficulty,
        isArchived: false,
        isDraft: false,
        parentPassageId: null
      };

      if (optionalTopicId) {
        matchStage.topicId = new Types.ObjectId(optionalTopicId);
      }

      const sampled = await this.model.aggregate([
        { $match: matchStage },
        { $sample: { size: ratio.count } }
      ]).exec();

      rootQuestions.push(...sampled);
    }

    const passageIds = rootQuestions
      .filter(q => q.type === QuestionType.PASSAGE)
      .map(q => q._id);

    let subQuestions: any[] = [];
    if (passageIds.length > 0) {
      subQuestions = await this.findSubQuestionsByPassageId(passageIds);
    }

    const finalQuestions = [];
    const answerKeys = [];
    const allRawQuestions = [...rootQuestions, ...subQuestions];

    for (const q of allRawQuestions) {
      const correctAns = q.answers.find((a: any) => a.isCorrect);

      finalQuestions.push({
        originalQuestionId: q._id,
        type: q.type,
        parentPassageId: q.parentPassageId || null,
        orderIndex: q.orderIndex || 0,
        content: q.content,
        explanation: q.explanation || null,
        difficultyLevel: q.difficultyLevel,
        answers: q.answers.map((a: any) => ({ id: a.id, content: a.content })),
        attachedMedia: q.attachedMedia || [],
        points: null
      });

      if (correctAns) {
        answerKeys.push({
          originalQuestionId: q._id,
          correctAnswerId: correctAns.id
        });
      }
    }

    return { questions: finalQuestions, answerKeys };
  }

  async countValidQuestions(questionIds: string[], ownerId: string): Promise<number> {
    const objectIds = questionIds.map(id => new Types.ObjectId(id));
    return this.modelInstance.countDocuments({
      _id: { $in: objectIds },
      ownerId: new Types.ObjectId(ownerId),
      isArchived: false
    }).exec();
  }


  async getCandidatePoolForRule(
    ownerId: Types.ObjectId,
    rule: any,
    excludeIds: Types.ObjectId[],
    poolSizeMultiplier: number = 3,
  ): Promise<CandidatePool> {
    const baseMatch: any = {
      ownerId,
      isArchived: false,
      isDraft: false,
      parentPassageId: null,
      _id: { $nin: excludeIds },
    };

    if (rule.folderIds?.length) baseMatch.folderId = { $in: rule.folderIds };
    if (rule.topicIds?.length) baseMatch.topicId = { $in: rule.topicIds };
    if (rule.difficulties?.length) baseMatch.difficultyLevel = { $in: rule.difficulties };
    if (rule.tags?.length) baseMatch.tags = { $in: rule.tags };

    const poolLimit = rule.limit * poolSizeMultiplier;

    // [FIX #1.2]: Tách 2 queries độc lập theo type để đảm bảo pool distribution đúng.
    // Bug cũ: $sample chung rồi $facet split → nếu ngân hàng lệch type thì một bên bị thiếu
    // dù thực tế vẫn còn đủ câu — false negative khiến JIT generation fail oan.
    const [flats, passagesRaw] = await Promise.all([
      this.modelInstance.aggregate([
        { $match: { ...baseMatch, type: { $ne: QuestionType.PASSAGE } } },
        { $sample: { size: poolLimit } },
        { $project: { __v: 0, createdAt: 0, updatedAt: 0, ownerId: 0 } },
      ]).exec(),

      this.modelInstance.aggregate([
        { $match: { ...baseMatch, type: QuestionType.PASSAGE } },
        { $sample: { size: poolLimit } },
        {
          $lookup: {
            from: 'questions',
            localField: '_id',
            foreignField: 'parentPassageId',
            pipeline: [
              { $match: { isArchived: false, isDraft: false } },
              { $sort: { orderIndex: 1 } },
              { $project: { __v: 0, createdAt: 0, updatedAt: 0, ownerId: 0 } },
            ],
            as: 'children',
          },
        },
        // Chỉ giữ passage nào thực sự có sub-questions
        { $match: { 'children.0': { $exists: true } } },
        { $project: { __v: 0, createdAt: 0, updatedAt: 0, ownerId: 0 } },
      ]).exec(),
    ]);

    return { flats, passages: passagesRaw };
  }

  async getActiveFiltersMetadata(ownerId: string, filters: GetActiveFiltersPayload) {
    const globalMatch: any = {
      ownerId: new Types.ObjectId(ownerId),
      isArchived: false,
      parentPassageId: null
    };

    if (typeof filters.isDraft === 'boolean') {
      globalMatch.isDraft = filters.isDraft;
    }

    const folderMatch = filters.folderIds?.length ? { folderId: { $in: filters.folderIds.map(id => new Types.ObjectId(id)) } } : {};
    const topicMatch = filters.topicIds?.length ? { topicId: { $in: filters.topicIds.map(id => new Types.ObjectId(id)) } } : {};
    const diffMatch = filters.difficulties?.length ? { difficultyLevel: { $in: filters.difficulties } } : {};
    const tagMatch = filters.tags?.length ? { tags: { $in: filters.tags } } : {};

    const [result] = await this.modelInstance.aggregate([
      { $match: globalMatch },
      {
        $facet: {
          folders: [
            { $match: { ...topicMatch, ...diffMatch, ...tagMatch } },
            { $group: { _id: "$folderId" } },
            { $match: { _id: { $ne: null } } },
            { $project: { _id: 0, id: { $toString: "$_id" } } }
          ],
          topics: [
            { $match: { ...folderMatch, ...diffMatch, ...tagMatch } },
            { $group: { _id: "$topicId" } },
            { $match: { _id: { $ne: null } } },
            { $project: { _id: 0, id: { $toString: "$_id" } } }
          ],
          difficulties: [
            { $match: { ...folderMatch, ...topicMatch, ...tagMatch } },
            { $group: { _id: "$difficultyLevel" } },
            { $match: { _id: { $ne: null } } },
            { $project: { _id: 0, id: "$_id" } }
          ],
          tags: [
            { $match: { ...folderMatch, ...topicMatch, ...diffMatch } },
            { $unwind: "$tags" },
            { $group: { _id: "$tags" } },
            { $match: { _id: { $ne: null } } },
            { $project: { _id: 0, id: "$_id" } }
          ]
        }
      }
    ]).exec();

    return {
      folderIds: result?.folders.map((f: any) => f.id) || [],
      topicIds: result?.topics.map((t: any) => t.id) || [],
      difficulties: result?.difficulties.map((d: any) => d.id) || [],
      tags: result?.tags.map((t: any) => t.id) || []
    };
  }


  async countAvailableQuestionsForRule(
    ownerId: Types.ObjectId,
    rule: any,
    excludeIds: Types.ObjectId[]
  ): Promise<number> {
    const matchStage: any = {
      ownerId,
      isArchived: false,
      isDraft: false,
      parentPassageId: null,
      _id: { $nin: excludeIds },
    };

    if (rule.folderIds?.length) matchStage.folderId = { $in: rule.folderIds };
    if (rule.topicIds?.length) matchStage.topicId = { $in: rule.topicIds };
    if (rule.difficulties?.length) matchStage.difficultyLevel = { $in: rule.difficulties };
    if (rule.tags?.length) matchStage.tags = { $in: rule.tags };

    const [result] = await this.modelInstance.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'questions',
          localField: '_id',
          foreignField: 'parentPassageId',
          pipeline: [
            { $match: { isArchived: false, isDraft: false } },
            { $project: { _id: 1 } }
          ],
          as: 'children'
        }
      },
      {
        $project: {
          countContribution: {
            $cond: {
              if: { $eq: ['$type', QuestionType.PASSAGE] },
              then: { $size: '$children' },
              else: 1
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          totalAvailable: { $sum: '$countContribution' }
        }
      }
    ]).exec();

    return result?.totalAvailable || 0;
  }

  async getPublishedActiveFiltersMetadata(ownerId: string, filters: GetActiveFiltersPayload) {
    const globalMatch: any = {
      ownerId: new Types.ObjectId(ownerId),
      isArchived: false,
      isDraft: false,
      parentPassageId: null,
    };

    const folderMatch = filters.folderIds?.length
      ? { folderId: { $in: filters.folderIds.map(id => new Types.ObjectId(id)) } } : {};
    const topicMatch = filters.topicIds?.length
      ? { topicId: { $in: filters.topicIds.map(id => new Types.ObjectId(id)) } } : {};
    const diffMatch = filters.difficulties?.length
      ? { difficultyLevel: { $in: filters.difficulties } } : {};
    const tagMatch = filters.tags?.length
      ? { tags: { $in: filters.tags } } : {};

    const [result] = await this.modelInstance.aggregate([
      { $match: globalMatch },
      {
        $facet: {
          folders: [
            { $match: { ...topicMatch, ...diffMatch, ...tagMatch } },
            { $group: { _id: '$folderId' } },
            { $match: { _id: { $ne: null } } },
            { $project: { _id: 0, id: { $toString: '$_id' } } },
          ],
          topics: [
            { $match: { ...folderMatch, ...diffMatch, ...tagMatch } },
            { $group: { _id: '$topicId' } },
            { $match: { _id: { $ne: null } } },
            { $project: { _id: 0, id: { $toString: '$_id' } } },
          ],
          difficulties: [
            { $match: { ...folderMatch, ...topicMatch, ...tagMatch } },
            { $group: { _id: '$difficultyLevel' } },
            { $match: { _id: { $ne: null } } },
            { $project: { _id: 0, id: '$_id' } },
          ],
          tags: [
            { $match: { ...folderMatch, ...topicMatch, ...diffMatch } },
            { $unwind: '$tags' },
            { $group: { _id: '$tags' } },
            { $match: { _id: { $ne: null } } },
            { $project: { _id: 0, id: '$_id' } },
          ],
        },
      },
    ]).exec();

    return {
      folderIds: result?.folders.map((f: any) => f.id) || [],
      topicIds: result?.topics.map((t: any) => t.id) || [],
      difficulties: result?.difficulties.map((d: any) => d.id) || [],
      tags: result?.tags.map((t: any) => t.id) || [],
    };
  }
}