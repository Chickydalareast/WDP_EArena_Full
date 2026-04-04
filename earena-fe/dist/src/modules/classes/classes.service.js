"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ClassesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const classes_repository_1 = require("./classes.repository");
const class_members_repository_1 = require("./class-members.repository");
const class_member_schema_1 = require("./schemas/class-member.schema");
const redis_service_1 = require("../../common/redis/redis.service");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
let ClassesService = ClassesService_1 = class ClassesService {
    classesRepo;
    classMembersRepo;
    redisService;
    classesQueue;
    logger = new common_1.Logger(ClassesService_1.name);
    constructor(classesRepo, classMembersRepo, redisService, classesQueue) {
        this.classesRepo = classesRepo;
        this.classMembersRepo = classMembersRepo;
        this.redisService = redisService;
        this.classesQueue = classesQueue;
    }
    generateRandomCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        return Array.from({ length: 6 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    }
    async createClass(payload) {
        const { teacherId, coverImageUrl, ...rest } = payload;
        if (!teacherId || !mongoose_1.Types.ObjectId.isValid(teacherId))
            throw new common_1.BadRequestException('ID giáo viên không hợp lệ.');
        const MAX_RETRIES = 5;
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            const code = this.generateRandomCode();
            try {
                const classData = {
                    ...rest,
                    code,
                    teacherId: new mongoose_1.Types.ObjectId(teacherId),
                    coverImageUrl: coverImageUrl || null,
                    isLocked: false,
                    isPublic: payload.isPublic ?? true,
                };
                return await this.classesRepo.createDocument(classData);
            }
            catch (error) {
                if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
                    this.logger.warn(`Va chạm mã Code [${code}]. Đang retry lần ${attempt}...`);
                    if (attempt === MAX_RETRIES)
                        throw new common_1.InternalServerErrorException('Hệ thống đang quá tải, không thể khởi tạo mã lớp học.');
                    continue;
                }
                throw error;
            }
        }
        throw new common_1.InternalServerErrorException('Lỗi không xác định khi tạo lớp học.');
    }
    async searchPublicClasses(query) {
        const page = Math.max(1, query.page || 1);
        const limit = Math.max(1, query.limit || 20);
        const keyword = query.keyword ? query.keyword.trim().toLowerCase() : '';
        const cacheKey = `classes_search:kw_${keyword}:p_${page}:l_${limit}`;
        if (page <= 3) {
            const cachedData = await this.redisService.get(cacheKey);
            if (cachedData) {
                this.logger.debug(`[Cache Hit] Trả về dữ liệu lớp học từ Redis: ${cacheKey}`);
                return JSON.parse(cachedData);
            }
        }
        const result = await this.classesRepo.searchPaginatedPublicClasses(query);
        if (page <= 3 && result.data.length > 0) {
            await this.redisService.set(cacheKey, JSON.stringify(result), 300);
        }
        return result;
    }
    async requestJoin(classId, studentId) {
        if (!mongoose_1.Types.ObjectId.isValid(classId))
            throw new common_1.BadRequestException('Mã lớp học không hợp lệ.');
        const targetClass = await this.classesRepo.findByIdSafe(classId, { select: 'isLocked teacherId' });
        if (!targetClass)
            throw new common_1.NotFoundException('Lớp học không tồn tại.');
        if (targetClass.isLocked)
            throw new common_1.ForbiddenException('Lớp học đã bị khóa.');
        if (targetClass.teacherId.toString() === studentId)
            throw new common_1.BadRequestException('Giáo viên không thể tự tham gia lớp của mình.');
        const existingMember = await this.classMembersRepo.findExistingMember(classId, studentId);
        if (existingMember) {
            if (existingMember.status === class_member_schema_1.JoinStatus.APPROVED)
                throw new common_1.ConflictException('Bạn đã ở trong lớp này rồi.');
            if (existingMember.status === class_member_schema_1.JoinStatus.PENDING)
                throw new common_1.ConflictException('Yêu cầu đang chờ duyệt.');
            if (existingMember.status === class_member_schema_1.JoinStatus.REJECTED) {
                await this.classMembersRepo.updateByIdSafe(existingMember._id.toString(), { $set: { status: class_member_schema_1.JoinStatus.PENDING } });
                return { message: 'Đã gửi lại yêu cầu tham gia lớp.' };
            }
        }
        try {
            await this.classMembersRepo.createDocument({
                classId: new mongoose_1.Types.ObjectId(classId),
                studentId: new mongoose_1.Types.ObjectId(studentId),
                status: class_member_schema_1.JoinStatus.PENDING,
            });
            return { message: 'Đã gửi yêu cầu tham gia lớp.' };
        }
        catch (error) {
            if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
                throw new common_1.ConflictException('Yêu cầu đã tồn tại trong hệ thống.');
            }
            throw new common_1.InternalServerErrorException('Lỗi hệ thống khi gửi yêu cầu tham gia.');
        }
    }
    async joinByCode(code, studentId) {
        const targetClass = await this.classesRepo.findByCode(code);
        if (!targetClass)
            throw new common_1.NotFoundException('Mã lớp học không tồn tại.');
        if (targetClass.isLocked)
            throw new common_1.ForbiddenException('Lớp học đã bị khóa.');
        if (targetClass.teacherId.toString() === studentId)
            throw new common_1.BadRequestException('Giáo viên không thể tự tham gia lớp của mình.');
        const existingMember = await this.classMembersRepo.findExistingMember(targetClass._id.toString(), studentId);
        if (existingMember) {
            if (existingMember.status === class_member_schema_1.JoinStatus.APPROVED)
                throw new common_1.ConflictException('Bạn đã là thành viên của lớp này.');
            await this.classMembersRepo.updateByIdSafe(existingMember._id.toString(), { $set: { status: class_member_schema_1.JoinStatus.APPROVED } });
            return { message: 'Tham gia lớp học thành công.' };
        }
        try {
            await this.classMembersRepo.createDocument({
                classId: new mongoose_1.Types.ObjectId(targetClass._id),
                studentId: new mongoose_1.Types.ObjectId(studentId),
                status: class_member_schema_1.JoinStatus.APPROVED,
            });
            return { message: 'Tham gia lớp học thành công.' };
        }
        catch (error) {
            if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
                throw new common_1.ConflictException('Hệ thống đang xử lý yêu cầu của bạn, vui lòng không thao tác quá nhanh.');
            }
            throw error;
        }
    }
    async reviewMember(classId, teacherId, targetStudentId, status) {
        if (status === class_member_schema_1.JoinStatus.PENDING)
            throw new common_1.BadRequestException('Trạng thái duyệt không hợp lệ.');
        if (!mongoose_1.Types.ObjectId.isValid(classId) || !mongoose_1.Types.ObjectId.isValid(targetStudentId))
            throw new common_1.BadRequestException('Mã ID không hợp lệ.');
        const targetClass = await this.classesRepo.findByIdSafe(classId, { select: 'teacherId' });
        if (!targetClass)
            throw new common_1.NotFoundException('Lớp học không tồn tại.');
        if (targetClass.teacherId.toString() !== teacherId)
            throw new common_1.ForbiddenException('Bạn không phải giáo viên chủ nhiệm của lớp này.');
        const updated = await this.classMembersRepo.updateMemberStatus(classId, targetStudentId, status);
        if (!updated)
            throw new common_1.NotFoundException('Không tìm thấy học sinh trong danh sách chờ.');
        return { message: `Đã ${status === class_member_schema_1.JoinStatus.APPROVED ? 'chấp nhận' : 'từ chối'} học sinh thành công.` };
    }
    async getClassPreview(classId, userId) {
        if (!mongoose_1.Types.ObjectId.isValid(classId))
            throw new common_1.BadRequestException('Mã lớp học không hợp lệ.');
        const classObj = await this.classesRepo.getClassPreview(classId);
        if (!classObj)
            throw new common_1.NotFoundException('Lớp học không tồn tại.');
        const isOwner = userId && classObj.teacherId && classObj.teacherId.toString() === userId;
        let joinStatus = null;
        if (userId && !isOwner) {
            const existingMember = await this.classMembersRepo.findExistingMember(classId, userId);
            if (existingMember)
                joinStatus = existingMember.status;
        }
        const { teacherId, code, ...rest } = classObj;
        return {
            ...rest,
            code: isOwner ? code : undefined,
            teacher: teacherId,
            joinStatus,
        };
    }
    async getClassMembers(classId, teacherId, queryDto) {
        if (!mongoose_1.Types.ObjectId.isValid(classId))
            throw new common_1.BadRequestException('Mã lớp học không hợp lệ.');
        const classObj = await this.classesRepo.findByIdSafe(classId, { select: 'teacherId' });
        if (!classObj)
            throw new common_1.NotFoundException('Lớp học không tồn tại.');
        if (classObj.teacherId.toString() !== teacherId)
            throw new common_1.ForbiddenException('Chỉ giáo viên chủ nhiệm mới có quyền xem danh sách này.');
        return this.classMembersRepo.findMembersWithDetailsPaginated(classId, queryDto);
    }
    async getClassesByTeacher(teacherId) {
        if (!mongoose_1.Types.ObjectId.isValid(teacherId))
            throw new common_1.BadRequestException('ID giáo viên không hợp lệ.');
        return this.classesRepo.findClassesByTeacher(teacherId);
    }
    async getMyClasses(teacherId) {
        if (!mongoose_1.Types.ObjectId.isValid(teacherId))
            throw new common_1.BadRequestException('ID giáo viên không hợp lệ.');
        return this.classesRepo.getTeacherClassesWithMetrics(teacherId);
    }
    async getClassDetailForTeacher(classId, teacherId) {
        if (!mongoose_1.Types.ObjectId.isValid(classId))
            throw new common_1.BadRequestException('Mã lớp học không hợp lệ.');
        const classInfo = await this.classesRepo.findByIdSafe(classId, { select: 'teacherId' });
        if (!classInfo)
            throw new common_1.NotFoundException('Lớp học không tồn tại.');
        if (classInfo.teacherId.toString() !== teacherId)
            throw new common_1.ForbiddenException('Bạn không có quyền truy cập quản trị lớp này.');
        const classDetail = await this.classesRepo.getClassAdminDetails(classId);
        if (!classDetail)
            throw new common_1.NotFoundException('Dữ liệu lớp học bị lỗi.');
        return classDetail;
    }
    async updateClass(classId, teacherId, payload) {
        if (!mongoose_1.Types.ObjectId.isValid(classId))
            throw new common_1.BadRequestException('Mã lớp học không hợp lệ.');
        const targetClass = await this.classesRepo.findByIdSafe(classId, { select: 'teacherId' });
        if (!targetClass)
            throw new common_1.NotFoundException('Lớp học không tồn tại.');
        if (targetClass.teacherId.toString() !== teacherId)
            throw new common_1.ForbiddenException('Chỉ giáo viên chủ nhiệm mới được cập nhật lớp học.');
        const updateData = {};
        if (payload.name !== undefined)
            updateData.name = payload.name;
        if (payload.description !== undefined)
            updateData.description = payload.description;
        if (payload.coverImageUrl !== undefined)
            updateData.coverImageUrl = payload.coverImageUrl;
        if (payload.isPublic !== undefined)
            updateData.isPublic = payload.isPublic;
        if (payload.isLocked !== undefined)
            updateData.isLocked = payload.isLocked;
        const updated = await this.classesRepo.updateByIdSafe(classId, { $set: updateData });
        if (!updated)
            throw new common_1.InternalServerErrorException('Cập nhật thất bại.');
        const { _id, ...rest } = updated;
        return { id: _id.toString(), ...rest };
    }
    async deleteClass(classId, teacherId) {
        if (!mongoose_1.Types.ObjectId.isValid(classId))
            throw new common_1.BadRequestException('Mã lớp học không hợp lệ.');
        const targetClass = await this.classesRepo.findByIdSafe(classId, { select: 'teacherId' });
        if (!targetClass)
            throw new common_1.NotFoundException('Lớp học không tồn tại.');
        if (targetClass.teacherId.toString() !== teacherId)
            throw new common_1.ForbiddenException('Chỉ giáo viên chủ nhiệm mới được xóa lớp học.');
        await this.classesRepo.executeInTransaction(async () => {
            await this.classesRepo.deleteOneSafe({ _id: new mongoose_1.Types.ObjectId(classId) });
            await this.classMembersRepo.deleteManySafe({ classId: new mongoose_1.Types.ObjectId(classId) });
        });
        return { message: 'Đã xóa lớp học thành công.' };
    }
    async kickStudent(classId, teacherId, studentId) {
        if (!mongoose_1.Types.ObjectId.isValid(classId) || !mongoose_1.Types.ObjectId.isValid(studentId))
            throw new common_1.BadRequestException('ID không hợp lệ.');
        const targetClass = await this.classesRepo.findByIdSafe(classId, { select: 'teacherId' });
        if (!targetClass)
            throw new common_1.NotFoundException('Lớp học không tồn tại.');
        if (targetClass.teacherId.toString() !== teacherId)
            throw new common_1.ForbiddenException('Bạn không có quyền đuổi học sinh khỏi lớp này.');
        const updatedMember = await this.classMembersRepo.updateMemberStatus(classId, studentId, class_member_schema_1.JoinStatus.REJECTED);
        if (!updatedMember)
            throw new common_1.NotFoundException('Không tìm thấy học sinh trong lớp.');
        return { message: 'Đã mời học sinh khỏi lớp.' };
    }
    async getJoinedClasses(userId, page, limit) {
        if (!mongoose_1.Types.ObjectId.isValid(userId))
            throw new common_1.BadRequestException('User ID không hợp lệ.');
        return this.classMembersRepo.getJoinedClassesPaginated(userId, page, limit);
    }
    async getStudentWorkspace(classId, studentId) {
        if (!mongoose_1.Types.ObjectId.isValid(classId) || !mongoose_1.Types.ObjectId.isValid(studentId))
            throw new common_1.BadRequestException('Mã ID không hợp lệ.');
        const workspaceData = await this.classMembersRepo.getStudentWorkspaceData(classId, studentId);
        if (!workspaceData)
            throw new common_1.ForbiddenException('Bạn không phải là thành viên chính thức của lớp này hoặc lớp không tồn tại.');
        return workspaceData;
    }
    async leaveClass(classId, studentId) {
        if (!mongoose_1.Types.ObjectId.isValid(classId))
            throw new common_1.BadRequestException('Mã lớp học không hợp lệ.');
        const existingMember = await this.classMembersRepo.findExistingMember(classId, studentId);
        if (!existingMember || existingMember.status !== class_member_schema_1.JoinStatus.APPROVED) {
            throw new common_1.BadRequestException('Bạn chưa tham gia lớp này nên không thể rời đi.');
        }
        await this.classMembersRepo.updateByIdSafe(existingMember._id.toString(), { $set: { status: class_member_schema_1.JoinStatus.REJECTED } });
        return { message: 'Đã rời lớp học thành công.' };
    }
    async onModuleInit() {
        await this.classesQueue.add('auto_rotate_code', {}, {
            repeat: { pattern: '0 2 * * 1' },
            jobId: 'auto_rotate_code_job',
            removeOnComplete: true,
            removeOnFail: false,
        });
        this.logger.log('Đã nạp Job "auto_rotate_code" vào BullMQ.');
    }
    async resetClassCode(classId, teacherId) {
        if (!mongoose_1.Types.ObjectId.isValid(classId))
            throw new common_1.BadRequestException('Mã lớp học không hợp lệ.');
        const targetClass = await this.classesRepo.findByIdSafe(classId, { select: 'teacherId' });
        if (!targetClass)
            throw new common_1.NotFoundException('Lớp học không tồn tại.');
        if (targetClass.teacherId.toString() !== teacherId)
            throw new common_1.ForbiddenException('Chỉ giáo viên chủ nhiệm mới được đổi mã lớp.');
        const MAX_RETRIES = 5;
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                const newCode = this.generateRandomCode();
                await this.classesRepo.updateByIdSafe(classId, { $set: { code: newCode } });
                return { message: 'Đổi mã bảo mật thành công.', newCode };
            }
            catch (error) {
                if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000 && attempt < MAX_RETRIES)
                    continue;
                throw new common_1.InternalServerErrorException('Lỗi hệ thống khi sinh mã mới, vui lòng thử lại sau.');
            }
        }
    }
    async handleAutoRotateCodes() {
        this.logger.log('[Worker] Bắt đầu tiến trình Auto-Rotate mã bảo mật các lớp học...');
        try {
            const modifiedCount = await this.classesRepo.rotateAllActiveCodes(() => this.generateRandomCode());
            this.logger.log(`[Worker] Auto-Rotate hoàn tất. Đã đổi mã cho ${modifiedCount} lớp học.`);
        }
        catch (error) {
            this.logger.error(`[Worker] Lỗi cục bộ khi Auto-Rotate: ${error instanceof Error ? error.message : error}`);
        }
    }
};
exports.ClassesService = ClassesService;
exports.ClassesService = ClassesService = ClassesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, bullmq_1.InjectQueue)('classes_queue')),
    __metadata("design:paramtypes", [classes_repository_1.ClassesRepository,
        class_members_repository_1.ClassMembersRepository,
        redis_service_1.RedisService,
        bullmq_2.Queue])
], ClassesService);
//# sourceMappingURL=classes.service.js.map