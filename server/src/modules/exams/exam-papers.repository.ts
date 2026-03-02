import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { AbstractRepository } from '../../common/database/abstract.repository';
import { ExamPaper, ExamPaperDocument } from './schemas/exam-paper.schema';

@Injectable()
export class ExamPapersRepository extends AbstractRepository<ExamPaperDocument> {
  protected readonly logger = new Logger(ExamPapersRepository.name);

  constructor(
    @InjectModel(ExamPaper.name) model: Model<ExamPaperDocument>,
    @InjectConnection() connection: Connection,
  ) {
    super(model, connection);
  }
}