import { Logger } from '@nestjs/common';
import { Connection, Model, Types } from 'mongoose';
import { AbstractRepository } from '../../../common/database/abstract.repository';
import { LessonDocument } from '../schemas/lesson.schema';
export declare class LessonsRepository extends AbstractRepository<LessonDocument> {
    private readonly lessonModel;
    protected readonly logger: Logger;
    constructor(lessonModel: Model<LessonDocument>, connection: Connection);
    getNextOrder(sectionId: string | Types.ObjectId): Promise<number>;
    bulkUpdateOrderAndSection(updates: {
        id: string;
        order: number;
        sectionId: string;
    }[]): Promise<any>;
    bulkUpdateOrderAndSectionStrict(courseId: string, updates: {
        id: string;
        order: number;
        sectionId: string;
    }[]): Promise<any>;
    countLessonsByCourse(courseId: string | Types.ObjectId): Promise<number>;
    getPreviousLessonId(courseId: string, currentSectionOrder: number, currentLessonOrder: number): Promise<string | null>;
}
