import { ConflictException, Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Types, UpdateQuery } from 'mongoose';
import { UsersRepository } from './users.repository';
import { AuthProvider, UserDocument, TeacherVerificationStatus } from './schemas/user.schema';
import { UserRole } from 'src/common/enums/user-role.enum';
import { AVATAR_PROVIDER_URL, generateDefaultAvatar } from '../../common/constants/user.constant';

export type CreateUserPayload = {
  email: string;
  fullName: string;
  password?: string;
  role?: UserRole | string;
  subjectIds?: string[] | Types.ObjectId[];
  isEmailVerified?: boolean;
  qualifications?: { url: string; name: string; uploadedAt: Date }[];
  hasUploadedQualifications?: boolean;
};

export type UpdateProfilePayload = {
  fullName?: string;
  avatar?: string;
  phone?: string;
  dateOfBirth?: Date;
  bio?: string;
};

export type GoogleProfilePayload = {
  email: string;
  fullName: string;
  avatar: string;
  providerId: string;
};

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly usersRepository: UsersRepository) { }

  async create(payload: CreateUserPayload): Promise<UserDocument> {
    const { email, password, role, fullName, isEmailVerified, subjectIds, qualifications, hasUploadedQualifications } = payload;

    if (!password) {
      throw new BadRequestException('Mật khẩu là bắt buộc khi khởi tạo tài khoản hệ thống.');
    }

    const isEmailExist = await this.usersRepository.checkEmailExists(email);
    if (isEmailExist) {
      throw new ConflictException('Email đã tồn tại trong hệ thống');
    }

    let validSubjectIds: Types.ObjectId[] = [];
    if (role === UserRole.TEACHER && subjectIds?.length) {
      validSubjectIds = (subjectIds as string[]).map((id) => new Types.ObjectId(id));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const defaultAvatar = generateDefaultAvatar(fullName);

    const newUser = await this.usersRepository.createDocument({
      email,
      fullName,
      password: hashedPassword,
      avatar: defaultAvatar,
      role: role || UserRole.STUDENT,
      isEmailVerified: isEmailVerified || false,
      subjectIds: validSubjectIds,
      qualifications: qualifications || [],
      hasUploadedQualifications: hasUploadedQualifications || false,
    });

    await this.usersRepository.modelInstance.populate(newUser, [
      { path: 'subjectIds', select: 'name' },
      { path: 'currentPlanId', select: 'code name' }
    ]);
    return newUser;
  }

  async findAll(page: number = 1, limit: number = 10) {
    const { data, total } = await this.usersRepository.findAllPaginated(page, limit);
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: { total, page, limit, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 }
    };
  }

  async findByEmailForAuth(email: string): Promise<UserDocument | null> {
    const user = await this.usersRepository.findByEmailWithPassword(email);
    if (user && user.authProvider === AuthProvider.GOOGLE && !user.password) {
      throw new BadRequestException('Tài khoản này được đăng ký bằng Google. Vui lòng đăng nhập bằng Google.');
    }
    if (user) {
      await this.usersRepository.modelInstance.populate(user, [
        { path: 'subjectIds', select: 'name' },
        { path: 'currentPlanId', select: 'code name' }
      ]);
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.usersRepository.findByEmail(email);
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.usersRepository.findByIdSafe(id, {
      populate: [
        { path: 'subjectIds', select: 'name' },
        { path: 'currentPlanId', select: 'code name' }
      ]
    });
  }

  async findByIdForAuth(id: string): Promise<UserDocument | null> {
    return this.usersRepository.findByIdWithPassword(id);
  }

  async updatePassword(id: string, newRawPassword: string): Promise<void> {
    const userExists = await this.usersRepository.findByIdSafe(id, { projection: '_id' });
    if (!userExists) {
      throw new NotFoundException('Tài khoản không tồn tại');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newRawPassword, salt);

    await this.usersRepository.updateByIdSafe(id, { $set: { password: hashedPassword } });
  }

  async getProfile(userId: string): Promise<UserDocument> {
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException('Hồ sơ không tồn tại');
    return user;
  }

  async getPublicProfile(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('ID người dùng không hợp lệ.');
    }

    const user = await this.usersRepository.findByIdSafe(userId, {
      projection: 'fullName avatar role status bio subjectIds currentPlanId planExpiresAt',
      populate: [
        { path: 'subjectIds', select: 'name' },
        { path: 'currentPlanId', select: 'code name' }
      ]
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy hồ sơ người dùng.');
    }

    if (user.status !== 'ACTIVE') {
      throw new NotFoundException('Hồ sơ người dùng không khả dụng (Đã bị khóa hoặc vô hiệu hóa).');
    }

    return user;
  }

  async updateProfile(userId: string, payload: UpdateProfilePayload): Promise<UserDocument> {
    const updatedUser = await this.usersRepository.updateByIdSafe(userId, { $set: payload });
    if (!updatedUser) {
      throw new NotFoundException('Hồ sơ không tồn tại hoặc đã bị xóa');
    }
    return updatedUser;
  }

  async getBasicUserInfo(userId: string) {
    const user = await this.usersRepository.modelInstance
      .findById(userId)
      .select('email fullName avatar role status isEmailVerified subjectIds currentPlanId planExpiresAt')
      .populate('subjectIds', 'name')
      .populate('currentPlanId', 'code name')
      .lean()
      .exec();

    if (!user) throw new NotFoundException('Không tìm thấy tài khoản');
    return user;
  }

  async findOrCreateGoogleUser(payload: GoogleProfilePayload): Promise<UserDocument> {
    const { email, fullName, avatar, providerId } = payload;
    const user = await this.usersRepository.findByEmail(email);

    const defaultAvatar = generateDefaultAvatar(fullName);
    const validAvatar = avatar || defaultAvatar;

    if (user) {
      if (user.authProvider === AuthProvider.LOCAL) {
        if (user.isEmailVerified) {
          throw new ConflictException('Email này đã được đăng ký bằng Mật khẩu. Vui lòng đăng nhập bình thường.');
        } else {
          this.logger.warn(`Thực hiện Merge Account (LOCAL -> GOOGLE) cho email chưa verify: ${email}`);

          const isOldAvatarDefault = user.avatar && user.avatar.includes(AVATAR_PROVIDER_URL);

          const mergedUser = await this.usersRepository.updateByIdSafe(user._id, {
            $set: {
              authProvider: AuthProvider.GOOGLE,
              providerId: providerId,
              isEmailVerified: true,
              avatar: isOldAvatarDefault ? validAvatar : user.avatar
            }
          });

          await this.usersRepository.modelInstance.populate(mergedUser, [
            { path: 'subjectIds', select: 'name' },
            { path: 'currentPlanId', select: 'code name' }
          ]);
          return mergedUser!;
        }
      }

      if (user.authProvider === AuthProvider.GOOGLE) {
        const updateQuery: UpdateQuery<UserDocument> = { $set: {} };
        let needsUpdate = false;

        if (!user.providerId) {
          updateQuery.$set!.providerId = providerId;
          needsUpdate = true;
        }

        const isCurrentAvatarDefault = user.avatar && user.avatar.includes(AVATAR_PROVIDER_URL);
        if (isCurrentAvatarDefault && avatar) {
          updateQuery.$set!.avatar = avatar;
          needsUpdate = true;
        }

        if (needsUpdate) {
          const updatedUser = await this.usersRepository.updateByIdSafe(user._id, updateQuery);
          await this.usersRepository.modelInstance.populate(updatedUser, [
            { path: 'subjectIds', select: 'name' },
            { path: 'currentPlanId', select: 'code name' }
          ]);
          return updatedUser!;
        }
      }

      await this.usersRepository.modelInstance.populate(user, [
        { path: 'subjectIds', select: 'name' },
        { path: 'currentPlanId', select: 'code name' }
      ]);
      return user;
    }

    try {
      const newUser = await this.usersRepository.createDocument({
        email,
        fullName,
        avatar: validAvatar,
        authProvider: AuthProvider.GOOGLE,
        providerId,
        isEmailVerified: true,
        role: UserRole.STUDENT,
        status: 'ACTIVE'
      });
      await this.usersRepository.modelInstance.populate(newUser, [
        { path: 'subjectIds', select: 'name' },
        { path: 'currentPlanId', select: 'code name' }
      ]);
      return newUser;
    } catch (error: any) {
      if (error.code === 11000 || error.status === 409 || error.name === 'ConflictException') {
        const concurrentUser = await this.usersRepository.findByEmail(email);
        if (concurrentUser) {
          this.logger.debug(`[Race Condition Handled] Đã vớt tài khoản Google cho email: ${email}`);
          await this.usersRepository.modelInstance.populate(concurrentUser, [
            { path: 'subjectIds', select: 'name' },
            { path: 'currentPlanId', select: 'code name' }
          ]);
          return concurrentUser;
        }
      }
      throw error;
    }
  }

  async addQualification(userId: string, qualification: { url: string; name: string; uploadedAt: Date }) {
    const user = await this.usersRepository.modelInstance.findByIdAndUpdate(
      userId,
      {
        $push: { qualifications: qualification },
        $set: { hasUploadedQualifications: true }
      },
      { new: true }
    ).lean();

    if (!user) throw new NotFoundException('Không tìm thấy tài khoản');
    return user;
  }

  async removeQualification(userId: string, index: number) {
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException('Không tìm thấy tài khoản');

    if (index < 0 || index >= user.qualifications.length) {
      throw new BadRequestException('Index không hợp lệ');
    }

    const qualifications = [...user.qualifications];
    qualifications.splice(index, 1);

    const updated = await this.usersRepository.modelInstance.findByIdAndUpdate(
      userId,
      {
        $set: {
          qualifications,
          hasUploadedQualifications: qualifications.length > 0
        }
      },
      { new: true }
    ).lean();

    return updated;
  }

  async updateTeacherVerificationStatus(userId: string, status: TeacherVerificationStatus, note?: string) {
    const updated = await this.usersRepository.modelInstance.findByIdAndUpdate(
      userId,
      {
        $set: {
          teacherVerificationStatus: status,
          teacherVerificationNote: note || null,
          teacherVerifiedAt: status === TeacherVerificationStatus.VERIFIED ? new Date() : null
        }
      },
      { new: true }
    ).lean();

    if (!updated) throw new NotFoundException('Không tìm thấy tài khoản');
    return updated;
  }
}