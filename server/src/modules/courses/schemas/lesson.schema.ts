import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ShowResultMode {
    IMMEDIATELY = 'IMMEDIATELY',
    AFTER_END_TIME = 'AFTER_END_TIME',
    NEVER = 'NEVER',
}

@Schema({ _id: false })
export class ExamRuleConfig {
    @Prop({ required: true, min: 0 })
    timeLimit: number;

    @Prop({ required: true, min: 1, default: 1 })
    maxAttempts: number;

    @Prop({ required: true, min: 0, max: 100, default: 50 })
    passPercentage: number;

    @Prop({ type: String, enum: ShowResultMode, default: ShowResultMode.IMMEDIATELY })
    showResultMode: ShowResultMode;
}

const ExamRuleConfigSchema = SchemaFactory.createForClass(ExamRuleConfig);

@Schema({ timestamps: true, collection: 'course_lessons' })
export class Lesson {
    @Prop({ type: Types.ObjectId, ref: 'Course', required: true, index: true })
    courseId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Section', required: true, index: true })
    sectionId: Types.ObjectId;

    @Prop({ required: true, trim: true })
    title: string;

    @Prop({ required: true, default: 0 })
    order: number;

    @Prop({ default: false })
    isFreePreview: boolean;

    @Prop({ type: Types.ObjectId, ref: 'Media' })
    primaryVideoId?: Types.ObjectId;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Media' }], default: [] })
    attachments: Types.ObjectId[];

    @Prop({ required: true, trim: true })
    content: string;

    @Prop({ type: Types.ObjectId, ref: 'Exam', index: true })
    examId?: Types.ObjectId;

    @Prop({ type: ExamRuleConfigSchema, default: null })
    examRules?: ExamRuleConfig;
}

export type LessonDocument = Lesson & Document;
export const LessonSchema = SchemaFactory.createForClass(Lesson);

LessonSchema.index({ sectionId: 1, order: 1 }, { unique: true });