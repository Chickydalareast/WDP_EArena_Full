import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ProgressionMode } from '../enums/progression-mode.enum';

export enum CourseStatus {
    DRAFT = 'DRAFT',
    PENDING_REVIEW = 'PENDING_REVIEW',
    PUBLISHED = 'PUBLISHED',
    REJECTED = 'REJECTED',
    ARCHIVED = 'ARCHIVED',
}

@Schema({ timestamps: true, collection: 'courses' })
export class Course {
    @Prop({ required: true, trim: true })
    title: string;

    @Prop({ required: true, unique: true, index: true, trim: true })
    slug: string;

    @Prop({ trim: true })
    description?: string;

    @Prop({ required: true, min: 0 })
    price: number;

    @Prop({ min: 0 })
    discountPrice?: number;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
    teacherId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Subject', index: true })
    subjectId?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Media' })
    coverImageId?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Media' })
    promotionalVideoId?: Types.ObjectId;

    @Prop({ type: String, enum: CourseStatus, default: CourseStatus.DRAFT, index: true })
    status: CourseStatus;

    @Prop({ type: Date })
    submittedAt?: Date;

    @Prop({ type: String, trim: true })
    rejectionReason?: string;

    @Prop({ type: [String], default: [] })
    benefits: string[];

    @Prop({ type: [String], default: [] })
    requirements: string[];

    @Prop({ required: true, default: 0, min: 0, max: 5 })
    averageRating: number;

    @Prop({ required: true, default: 0, min: 0 })
    totalReviews: number;

    @Prop({ type: String, enum: ProgressionMode, default: ProgressionMode.FREE })
    progressionMode: ProgressionMode;

    @Prop({ default: false })
    isStrictExam: boolean;
}

export type CourseDocument = Course & Document;
export const CourseSchema = SchemaFactory.createForClass(Course);

CourseSchema.index({ status: 1, submittedAt: 1 });

CourseSchema.index({ status: 1, teacherId: 1 });
CourseSchema.index({ status: 1, createdAt: -1 });
CourseSchema.index({ status: 1, price: 1, createdAt: -1 });
CourseSchema.index({ status: 1, subjectId: 1, createdAt: -1 });
CourseSchema.index({ status: 1, averageRating: -1, totalReviews: -1 });