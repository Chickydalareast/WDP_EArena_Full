import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserRole } from '../../../common/enums/user-role.enum';

export type UserDocument = User & Document;

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BANNED = 'BANNED',
}

export enum TeacherVerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export enum AuthProvider {
  LOCAL = 'LOCAL',
  GOOGLE = 'GOOGLE',
  FACEBOOK = 'FACEBOOK',
}

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true, unique: true, index: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: false, select: false })
  password?: string;

  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ required: false })
  avatar: string;

  @Prop({ required: false, trim: true })
  phone?: string;

  @Prop({ required: false })
  dateOfBirth?: Date;

  @Prop({ required: false, trim: true, maxlength: 1000 })
  bio?: string;

  @Prop({ type: String, enum: UserRole, default: UserRole.STUDENT })
  role: UserRole;

  @Prop({ type: String, enum: UserStatus, default: UserStatus.ACTIVE, index: true })
  status: UserStatus;

  @Prop({ type: String, enum: AuthProvider, default: AuthProvider.LOCAL })
  authProvider: AuthProvider;

  @Prop({ required: false, index: true })
  providerId?: string;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Subject' }], default: [] })
  subjectIds: Types.ObjectId[];

  @Prop({ required: false })
  lastLoginAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'PricingPlan', required: false, index: true })
  currentPlanId?: Types.ObjectId;

  @Prop({ type: Date, required: false, index: true })
  planExpiresAt?: Date;

  // Teacher verification fields
  @Prop({ type: String, enum: TeacherVerificationStatus, default: TeacherVerificationStatus.PENDING })
  teacherVerificationStatus: TeacherVerificationStatus;

  @Prop({ required: false })
  teacherVerificationNote?: string;

  @Prop({ type: Date, required: false })
  teacherVerifiedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  teacherVerifiedBy?: Types.ObjectId;

  // Qualifications (bằng cấp/chứng chỉ)
  @Prop({ type: [{ url: String, name: String, uploadedAt: Date }], default: [] })
  qualifications: { url: string; name: string; uploadedAt: Date }[];

  @Prop({ default: false })
  hasUploadedQualifications: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ role: 1, status: 1 });
UserSchema.index({ currentPlanId: 1, planExpiresAt: 1, status: 1 });