import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { AbstractRepository } from '../../common/database/abstract.repository';
import { Exam, ExamDocument } from './schemas/exam.schema';

@Injectable()
export class ExamsRepository extends AbstractRepository<ExamDocument> {
  protected readonly logger = new Logger(ExamsRepository.name);

  constructor(
    @InjectModel(Exam.name) model: Model<ExamDocument>,
    @InjectConnection() connection: Connection,
  ) {
    super(model, connection);
  }
}