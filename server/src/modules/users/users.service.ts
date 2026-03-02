import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Types } from 'mongoose';
import { UsersRepository } from './users.repository';
import { UserDocument, UserRole } from './schemas/user.schema';

export type CreateUserPayload = {
  email: string;
  fullName: string;
  password?: string;
  role?: UserRole | string;
};
export type UpdateProfilePayload = {
  fullName?: string;
  avatar?: string;
  phone?: string;
  dateOfBirth?: Date;
};
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly usersRepository: UsersRepository) {}

  async create(payload: CreateUserPayload): Promise<UserDocument> {
    const { email, password, role, fullName } = payload;

    const isEmailExist = await this.usersRepository.exists({ email });
    if (isEmailExist) {
      throw new ConflictException('Email đã tồn tại trong hệ thống');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password || '', salt);

    return this.usersRepository.create({
      email,
      fullName,
      password: hashedPassword,
      role: role || UserRole.STUDENT,
    } as any);
  }

  async findAll(): Promise<UserDocument[]> {
    return this.usersRepository.find({});
  }

  async findByEmailForAuth(email: string): Promise<UserDocument | null> {
    return (this.usersRepository as any).model.findOne({ email }).select('+password').lean();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    try {
      return await this.usersRepository.findOne({ email });
    } catch (error) {
      return null;
    }
  }

  async findById(id: string): Promise<UserDocument | null> {
    try {
      return await this.usersRepository.findOne({ 
        _id: new Types.ObjectId(id) 
      } as any);
    } catch (error) {
      return null;
    }
  }

  async findByIdForAuth(id: string): Promise<UserDocument | null> {
    return (this.usersRepository as any).model.findById(id).select('+password').lean();
  }

  async updatePassword(id: string, hashedPass: string): Promise<void> {
    await this.usersRepository.findOneAndUpdate(
      { _id: new Types.ObjectId(id) },
      { password: hashedPass }
    );
  }
  async getProfile(userId: string): Promise<UserDocument> {
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException('Hồ sơ không tồn tại');
    return user;
  }

  async updateProfile(userId: string, payload: UpdateProfilePayload): Promise<UserDocument> {
    const updatedUser = await this.usersRepository.findOneAndUpdate(
      { _id: new Types.ObjectId(userId) } as any,
      { $set: payload } as any
    );

    if (!updatedUser) {
      throw new NotFoundException('Hồ sơ không tồn tại hoặc đã bị xóa');
    }
    return updatedUser;
  }
}