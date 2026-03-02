import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { AbstractRepository } from '../../common/database/abstract.repository';
import { Question, QuestionDocument, DifficultyLevel } from './schemas/question.schema';

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
}