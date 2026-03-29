import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { AbstractRepository } from '../../common/database/abstract.repository';
import { QuestionFolder, QuestionFolderDocument } from './schemas/question-folder.schema';

@Injectable()
export class QuestionFoldersRepository extends AbstractRepository<QuestionFolderDocument> {
  protected readonly logger = new Logger(QuestionFoldersRepository.name);

  constructor(
    @InjectModel(QuestionFolder.name) model: Model<QuestionFolderDocument>,
    @InjectConnection() connection: Connection,
  ) {
    super(model, connection);
  }
}