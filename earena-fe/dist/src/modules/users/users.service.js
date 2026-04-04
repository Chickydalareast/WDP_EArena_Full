"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
const mongoose_1 = require("mongoose");
const users_repository_1 = require("./users.repository");
const user_schema_1 = require("./schemas/user.schema");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
const user_constant_1 = require("../../common/constants/user.constant");
let UsersService = UsersService_1 = class UsersService {
    usersRepository;
    logger = new common_1.Logger(UsersService_1.name);
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
    }
    async create(payload) {
        const { email, password, role, fullName, isEmailVerified, subjectIds, qualifications, hasUploadedQualifications } = payload;
        if (!password) {
            throw new common_1.BadRequestException('Mật khẩu là bắt buộc khi khởi tạo tài khoản hệ thống.');
        }
        const isEmailExist = await this.usersRepository.checkEmailExists(email);
        if (isEmailExist) {
            throw new common_1.ConflictException('Email đã tồn tại trong hệ thống');
        }
        let validSubjectIds = [];
        if (role === user_role_enum_1.UserRole.TEACHER && subjectIds?.length) {
            validSubjectIds = subjectIds.map((id) => new mongoose_1.Types.ObjectId(id));
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const defaultAvatar = (0, user_constant_1.generateDefaultAvatar)(fullName);
        const newUser = await this.usersRepository.createDocument({
            email,
            fullName,
            password: hashedPassword,
            avatar: defaultAvatar,
            role: role || user_role_enum_1.UserRole.STUDENT,
            isEmailVerified: isEmailVerified || false,
            subjectIds: validSubjectIds,
            qualifications: qualifications || [],
            hasUploadedQualifications: hasUploadedQualifications || false,
        });
        await this.usersRepository.modelInstance.populate(newUser, [
            { path: 'subjectIds', select: 'name' },
            { path: 'currentPlanId', select: 'code name' },
        ]);
        return newUser;
    }
    async findAll(page = 1, limit = 10) {
        const { data, total } = await this.usersRepository.findAllPaginated(page, limit);
        const totalPages = Math.ceil(total / limit);
        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        };
    }
    async findByEmailForAuth(email) {
        const user = await this.usersRepository.findByEmailWithPassword(email);
        if (user && user.authProvider === user_schema_1.AuthProvider.GOOGLE && !user.password) {
            throw new common_1.BadRequestException('Tài khoản này được đăng ký bằng Google. Vui lòng đăng nhập bằng Google.');
        }
        if (user) {
            await this.usersRepository.modelInstance.populate(user, [
                { path: 'subjectIds', select: 'name' },
                { path: 'currentPlanId', select: 'code name' },
            ]);
        }
        return user;
    }
    async findByEmail(email) {
        return this.usersRepository.findByEmail(email);
    }
    async findById(id) {
        return this.usersRepository.findByIdSafe(id, {
            populate: [
                { path: 'subjectIds', select: 'name' },
                { path: 'currentPlanId', select: 'code name' },
            ],
        });
    }
    async findByIdForAuth(id) {
        return this.usersRepository.findByIdWithPassword(id);
    }
    async updatePassword(id, newRawPassword) {
        const userExists = await this.usersRepository.findByIdSafe(id, {
            projection: '_id',
        });
        if (!userExists) {
            throw new common_1.NotFoundException('Tài khoản không tồn tại');
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newRawPassword, salt);
        await this.usersRepository.updateByIdSafe(id, {
            $set: { password: hashedPassword },
        });
    }
    async getProfile(userId) {
        const user = await this.findById(userId);
        if (!user)
            throw new common_1.NotFoundException('Hồ sơ không tồn tại');
        return user;
    }
    async getPublicProfile(userId) {
        if (!mongoose_1.Types.ObjectId.isValid(userId)) {
            throw new common_1.BadRequestException('ID người dùng không hợp lệ.');
        }
        const user = await this.usersRepository.findByIdSafe(userId, {
            projection: 'fullName avatar role status bio subjectIds currentPlanId planExpiresAt',
            populate: [
                { path: 'subjectIds', select: 'name' },
                { path: 'currentPlanId', select: 'code name' },
            ],
        });
        if (!user) {
            throw new common_1.NotFoundException('Không tìm thấy hồ sơ người dùng.');
        }
        if (user.status !== 'ACTIVE') {
            throw new common_1.NotFoundException('Hồ sơ người dùng không khả dụng (Đã bị khóa hoặc vô hiệu hóa).');
        }
        return user;
    }
    async updateProfile(userId, payload) {
        const updatedUser = await this.usersRepository.updateByIdSafe(userId, {
            $set: payload,
        });
        if (!updatedUser) {
            throw new common_1.NotFoundException('Hồ sơ không tồn tại hoặc đã bị xóa');
        }
        return updatedUser;
    }
    async getBasicUserInfo(userId) {
        const user = await this.usersRepository.modelInstance
            .findById(userId)
            .select('email fullName avatar role status isEmailVerified subjectIds currentPlanId planExpiresAt')
            .populate('subjectIds', 'name')
            .populate('currentPlanId', 'code name')
            .lean()
            .exec();
        if (!user)
            throw new common_1.NotFoundException('Không tìm thấy tài khoản');
        return user;
    }
    async findOrCreateGoogleUser(payload) {
        const { email, fullName, avatar, providerId } = payload;
        const user = await this.usersRepository.findByEmail(email);
        const defaultAvatar = (0, user_constant_1.generateDefaultAvatar)(fullName);
        const validAvatar = avatar || defaultAvatar;
        if (user) {
            if (user.authProvider === user_schema_1.AuthProvider.LOCAL) {
                if (user.isEmailVerified) {
                    throw new common_1.ConflictException('Email này đã được đăng ký bằng Mật khẩu. Vui lòng đăng nhập bình thường.');
                }
                else {
                    this.logger.warn(`Thực hiện Merge Account (LOCAL -> GOOGLE) cho email chưa verify: ${email}`);
                    const isOldAvatarDefault = user.avatar && user.avatar.includes(user_constant_1.AVATAR_PROVIDER_URL);
                    const mergedUser = await this.usersRepository.updateByIdSafe(user._id, {
                        $set: {
                            authProvider: user_schema_1.AuthProvider.GOOGLE,
                            providerId: providerId,
                            isEmailVerified: true,
                            avatar: isOldAvatarDefault ? validAvatar : user.avatar,
                        },
                    });
                    await this.usersRepository.modelInstance.populate(mergedUser, [
                        { path: 'subjectIds', select: 'name' },
                        { path: 'currentPlanId', select: 'code name' },
                    ]);
                    return mergedUser;
                }
            }
            if (user.authProvider === user_schema_1.AuthProvider.GOOGLE) {
                const updateQuery = { $set: {} };
                let needsUpdate = false;
                if (!user.providerId) {
                    updateQuery.$set.providerId = providerId;
                    needsUpdate = true;
                }
                const isCurrentAvatarDefault = user.avatar && user.avatar.includes(user_constant_1.AVATAR_PROVIDER_URL);
                if (isCurrentAvatarDefault && avatar) {
                    updateQuery.$set.avatar = avatar;
                    needsUpdate = true;
                }
                if (needsUpdate) {
                    const updatedUser = await this.usersRepository.updateByIdSafe(user._id, updateQuery);
                    await this.usersRepository.modelInstance.populate(updatedUser, [
                        { path: 'subjectIds', select: 'name' },
                        { path: 'currentPlanId', select: 'code name' },
                    ]);
                    return updatedUser;
                }
            }
            await this.usersRepository.modelInstance.populate(user, [
                { path: 'subjectIds', select: 'name' },
                { path: 'currentPlanId', select: 'code name' },
            ]);
            return user;
        }
        try {
            const newUser = await this.usersRepository.createDocument({
                email,
                fullName,
                avatar: validAvatar,
                authProvider: user_schema_1.AuthProvider.GOOGLE,
                providerId,
                isEmailVerified: true,
                role: user_role_enum_1.UserRole.STUDENT,
                status: 'ACTIVE',
            });
            await this.usersRepository.modelInstance.populate(newUser, [
                { path: 'subjectIds', select: 'name' },
                { path: 'currentPlanId', select: 'code name' },
            ]);
            return newUser;
        }
        catch (error) {
            if (error.code === 11000 ||
                error.status === 409 ||
                error.name === 'ConflictException') {
                const concurrentUser = await this.usersRepository.findByEmail(email);
                if (concurrentUser) {
                    this.logger.debug(`[Race Condition Handled] Đã vớt tài khoản Google cho email: ${email}`);
                    await this.usersRepository.modelInstance.populate(concurrentUser, [
                        { path: 'subjectIds', select: 'name' },
                        { path: 'currentPlanId', select: 'code name' },
                    ]);
                    return concurrentUser;
                }
            }
            throw error;
        }
    }
    async addQualification(userId, qualification) {
        const user = await this.usersRepository.modelInstance.findByIdAndUpdate(userId, {
            $push: { qualifications: qualification },
            $set: { hasUploadedQualifications: true }
        }, { new: true }).lean();
        if (!user)
            throw new common_1.NotFoundException('Không tìm thấy tài khoản');
        return user;
    }
    async removeQualification(userId, index) {
        const user = await this.findById(userId);
        if (!user)
            throw new common_1.NotFoundException('Không tìm thấy tài khoản');
        if (index < 0 || index >= user.qualifications.length) {
            throw new common_1.BadRequestException('Index không hợp lệ');
        }
        const qualifications = [...user.qualifications];
        qualifications.splice(index, 1);
        const updated = await this.usersRepository.modelInstance.findByIdAndUpdate(userId, {
            $set: {
                qualifications,
                hasUploadedQualifications: qualifications.length > 0
            }
        }, { new: true }).lean();
        return updated;
    }
    async updateTeacherVerificationStatus(userId, status, note) {
        const updated = await this.usersRepository.modelInstance.findByIdAndUpdate(userId, {
            $set: {
                teacherVerificationStatus: status,
                teacherVerificationNote: note || null,
                teacherVerifiedAt: status === user_schema_1.TeacherVerificationStatus.VERIFIED ? new Date() : null
            }
        }, { new: true }).lean();
        if (!updated)
            throw new common_1.NotFoundException('Không tìm thấy tài khoản');
        return updated;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_repository_1.UsersRepository])
], UsersService);
//# sourceMappingURL=users.service.js.map