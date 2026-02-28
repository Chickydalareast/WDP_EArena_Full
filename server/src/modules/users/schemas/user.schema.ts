import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BANNED = 'BANNED',
}

export enum AuthProvider {
  LOCAL = 'LOCAL',
  GOOGLE = 'GOOGLE',
  FACEBOOK = 'FACEBOOK',
}

@Schema({ 
  timestamps: true, 
  collection: 'users' 
})
export class User {
  @Prop({ required: true, unique: true, index: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: false, select: false })
  password?: string;

  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ default: 'https://ui-avatars.com/api/?name=User&background=random' })
  avatar: string;

  @Prop({ required: false, trim: true })
  phone?: string;

  @Prop({ required: false })
  dateOfBirth?: Date;

  @Prop({ type: String, enum: UserRole, default: UserRole.STUDENT, index: true })
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
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ role: 1, status: 1 });