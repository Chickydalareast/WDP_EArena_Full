import { Logger } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { AbstractRepository } from '../../common/database/abstract.repository';
import { QuestionFolderDocument } from './schemas/question-folder.schema';
export declare class QuestionFoldersRepository extends AbstractRepository<QuestionFolderDocument> {
    protected readonly logger: Logger;
    constructor(model: Model<QuestionFolderDocument>, connection: Connection);
}
