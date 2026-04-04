import { Logger } from '@nestjs/common';
import { Model, Connection } from 'mongoose';
import { AbstractRepository } from '../../common/database/abstract.repository';
import { MediaDocument } from './schemas/media.schema';
export declare class MediaRepository extends AbstractRepository<MediaDocument> {
    protected readonly logger: Logger;
    constructor(mediaModel: Model<MediaDocument>, connection: Connection);
}
