import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'lesson_progress' })
export class LessonProgress {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
    userId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Course', required: true, index: true })
    courseId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Lesson', required: true, index: true })
    lessonId: Types.ObjectId;

    @Prop({ required: true, default: 0, min: 0 })
    watchTime: number;

    @Prop({ required: true, default: 0, min: 0 })
    lastPosition: number;

    @Prop({ required: true, default: false })
    isCompleted: boolean;

    @Prop({ type: Date })
    completedAt?: Date;
}

export type LessonProgressDocument = LessonProgress & Document;
export const LessonProgressSchema = SchemaFactory.createForClass(LessonProgress);

LessonProgressSchema.index({ userId: 1, courseId: 1, lessonId: 1 }, { unique: true });
LessonProgressSchema.index({ userId: 1, courseId: 1, isCompleted: 1 });