import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { AbstractRepository } from '../../common/database/abstract.repository';
import { Subject, SubjectDocument } from './schemas/subject.schema';

@Injectable()
export class SubjectsRepository extends AbstractRepository<SubjectDocument> {
  protected readonly logger = new Logger(SubjectsRepository.name);

  constructor(
    @InjectModel(Subject.name) model: Model<SubjectDocument>,
    @InjectConnection() connection: Connection,
  ) {
    super(model, connection);
  }
}