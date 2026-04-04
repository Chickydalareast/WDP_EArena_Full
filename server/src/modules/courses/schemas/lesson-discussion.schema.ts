import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LessonDiscussionDocument = LessonDiscussion & Document;

@Schema({ timestamps: true, collection: 'course_lesson_discussions' })
export class LessonDiscussion {
    @Prop({ type: Types.ObjectId, ref: 'Course', required: true, index: true })
    courseId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Lesson', required: true, index: true })
    lessonId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
    userId: Types.ObjectId;

    @Prop({ required: true, trim: true, maxlength: 3000 })
    content: string;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Media' }], default: [] })
    attachments: Types.ObjectId[];

    @Prop({ type: Types.ObjectId, ref: 'LessonDiscussion', default: null, index: true })
    parentId: Types.ObjectId | null;

    @Prop({ required: true, default: 0, min: 0 })
    replyCount: number;

    @Prop({ type: Date, default: null })
    lastRepliedAt: Date | null;

    createdAt?: Date;
    updatedAt?: Date;
}

export const LessonDiscussionSchema = SchemaFactory.createForClass(LessonDiscussion);

LessonDiscussionSchema.index({ lessonId: 1, parentId: 1, lastRepliedAt: -1, createdAt: -1 });
LessonDiscussionSchema.index({ parentId: 1, createdAt: 1 });