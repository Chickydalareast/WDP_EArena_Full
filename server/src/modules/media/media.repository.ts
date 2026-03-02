import { Injectable, Logger } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { AbstractRepository } from '../../common/database/abstract.repository';
import { Media, MediaDocument } from './schemas/media.schema';

@Injectable()
export class MediaRepository extends AbstractRepository<MediaDocument> {
  protected readonly logger = new Logger(MediaRepository.name);

  constructor(
    @InjectModel(Media.name) mediaModel: Model<MediaDocument>,
    @InjectConnection() connection: Connection,
  ) {
    super(mediaModel, connection);
  }
}