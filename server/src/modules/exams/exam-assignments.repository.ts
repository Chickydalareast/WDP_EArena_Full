import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { AbstractRepository } from '../../common/database/abstract.repository';
import { ExamAssignment, ExamAssignmentDocument } from './schemas/exam-assignment.schema';

@Injectable()
export class ExamAssignmentsRepository extends AbstractRepository<ExamAssignmentDocument> {
  protected readonly logger = new Logger(ExamAssignmentsRepository.name);

  constructor(
    @InjectModel(ExamAssignment.name) model: Model<ExamAssignmentDocument>,
    @InjectConnection() connection: Connection,
  ) {
    super(model, connection);
  }
}