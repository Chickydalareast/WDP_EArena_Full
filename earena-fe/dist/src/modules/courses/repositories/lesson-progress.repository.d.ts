import { Logger } from '@nestjs/common';
import { Connection, Model, Types } from 'mongoose';
import { AbstractRepository } from '../../../common/database/abstract.repository';
import { LessonProgressDocument } from '../schemas/lesson-progress.schema';
export declare class LessonProgressRepository extends AbstractRepository<LessonProgressDocument> {
    private readonly progressModel;
    protected readonly logger: Logger;
    constructor(progressModel: Model<LessonProgressDocument>, connection: Connection);
    atomicUpsertProgress(userId: string | Types.ObjectId, courseId: string | Types.ObjectId, lessonId: string | Types.ObjectId, payload: {
        incWatchTime?: number;
        setLastPosition?: number;
        isCompleted?: boolean;
    }): Promise<LessonProgressDocument | null>;
    getCompletedLessonIds(userId: string, courseId: string): Promise<string[]>;
}
