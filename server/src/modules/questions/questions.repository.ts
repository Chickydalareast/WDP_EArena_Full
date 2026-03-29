import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { AbstractRepository } from '../../common/database/abstract.repository';
import { Question, QuestionDocument, DifficultyLevel, QuestionType } from './schemas/question.schema';

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
  topicId?: string;
  difficultyLevels?: DifficultyLevel[];
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
    const { page, limit, folderIds, topicId, difficultyLevels, search, isDraft } = filter;
    const skip = (page - 1) * limit;

    const matchStage: any = {
      ownerId: new Types.ObjectId(ownerId),
      isArchived: false,
      parentPassageId: null
    };

    if (folderIds && folderIds.length > 0) {
      matchStage.folderId = { $in: folderIds.map(id => new Types.ObjectId(id)) };
    }

    if (difficultyLevels && difficultyLevels.length > 0) {
      matchStage.difficultyLevel = { $in: difficultyLevels };
    }

    if (topicId) matchStage.topicId = new Types.ObjectId(topicId);
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
}