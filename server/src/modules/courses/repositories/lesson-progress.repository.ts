import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { AbstractRepository } from '../../../common/database/abstract.repository';
import { LessonProgress, LessonProgressDocument } from '../schemas/lesson-progress.schema';

@Injectable()
export class LessonProgressRepository extends AbstractRepository<LessonProgressDocument> {
    protected readonly logger = new Logger(LessonProgressRepository.name);

    constructor(
        @InjectModel(LessonProgress.name) private readonly progressModel: Model<LessonProgressDocument>,
        @InjectConnection() connection: Connection,
    ) {
        super(progressModel, connection);
    }

    async atomicUpsertProgress(
        userId: string | Types.ObjectId,
        courseId: string | Types.ObjectId,
        lessonId: string | Types.ObjectId,
        payload: { incWatchTime?: number; setLastPosition?: number; isCompleted?: boolean }
    ): Promise<LessonProgressDocument | null> {
        const updateOps: any = {};
        const setOps: any = {};

        if (payload.incWatchTime) {
            updateOps.$inc = { watchTime: payload.incWatchTime };
        }

        if (payload.setLastPosition !== undefined) {
            setOps.lastPosition = payload.setLastPosition;
        }

        if (payload.isCompleted) {
            setOps.isCompleted = true;
            setOps.completedAt = new Date();
        }

        if (Object.keys(setOps).length > 0) {
            updateOps.$set = setOps;
        }

        return this.progressModel.findOneAndUpdate(
            {
                userId: new Types.ObjectId(userId.toString()),
                courseId: new Types.ObjectId(courseId.toString()),
                lessonId: new Types.ObjectId(lessonId.toString()),
            },
            updateOps,
            {
                upsert: true,
                new: true,
                lean: true,
                session: this.currentSession,
                setDefaultsOnInsert: true
            }
        ).exec() as Promise<LessonProgressDocument | null>;
    }

    async getCompletedLessonIds(userId: string, courseId: string): Promise<string[]> {
        const docs = await this.progressModel.find({
            userId: new Types.ObjectId(userId),
            courseId: new Types.ObjectId(courseId),
            isCompleted: true
        })
            .select('lessonId')
            .lean()
            .exec();

        return docs.map(doc => doc.lessonId.toString());
    }
}