import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { AbstractRepository } from '../../common/database/abstract.repository';
import { ExamMatrix, ExamMatrixDocument } from './schemas/exam-matrix.schema';

@Injectable()
export class ExamMatricesRepository extends AbstractRepository<ExamMatrixDocument> {
  protected readonly logger = new Logger(ExamMatricesRepository.name);

  constructor(
    @InjectModel(ExamMatrix.name) model: Model<ExamMatrixDocument>,
    @InjectConnection() connection: Connection,
  ) {
    super(model, connection);
  }
}