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
var ExamMatricesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamMatricesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const exam_matrices_repository_1 = require("./exam-matrices.repository");
const exams_repository_1 = require("./exams.repository");
let ExamMatricesService = ExamMatricesService_1 = class ExamMatricesService {
    matricesRepo;
    examsRepo;
    logger = new common_1.Logger(ExamMatricesService_1.name);
    constructor(matricesRepo, examsRepo) {
        this.matricesRepo = matricesRepo;
        this.examsRepo = examsRepo;
    }
    async createMatrixTemplate(teacherId, payload) {
        const matrix = await this.matricesRepo.createDocument({
            ...payload,
            teacherId: new mongoose_1.Types.ObjectId(teacherId),
            subjectId: new mongoose_1.Types.ObjectId(payload.subjectId),
            sections: payload.sections.map((sec) => ({
                ...sec,
                rules: sec.rules.map((rule) => ({
                    folderIds: rule.folderIds?.map((id) => new mongoose_1.Types.ObjectId(id)) || [],
                    topicIds: rule.topicIds?.map((id) => new mongoose_1.Types.ObjectId(id)) || [],
                    difficulties: rule.difficulties || [],
                    tags: rule.tags || [],
                    limit: rule.limit,
                })),
            })),
        });
        this.logger.log(`[Matrix Template] Teacher ${teacherId} created Matrix ${matrix._id}`);
        return {
            message: 'Lưu Khuôn mẫu Ma trận thành công',
            matrixId: matrix._id,
        };
    }
    async getMatrices(teacherId, filter) {
        const { page, limit, subjectId, search } = filter;
        const query = { teacherId: new mongoose_1.Types.ObjectId(teacherId) };
        if (subjectId)
            query.subjectId = new mongoose_1.Types.ObjectId(subjectId);
        if (search)
            query.title = { $regex: search, $options: 'i' };
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            this.matricesRepo.modelInstance
                .find(query)
                .select('-sections -__v')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean()
                .exec(),
            this.matricesRepo.modelInstance.countDocuments(query).exec(),
        ]);
        return {
            items,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    async getMatrixDetail(matrixId, teacherId) {
        if (!mongoose_1.Types.ObjectId.isValid(matrixId))
            throw new common_1.BadRequestException('ID Ma trận không hợp lệ');
        const matrix = await this.matricesRepo.findByIdSafe(matrixId);
        if (!matrix)
            throw new common_1.NotFoundException('Không tìm thấy Khuôn mẫu Ma trận');
        if (matrix.teacherId.toString() !== teacherId) {
            throw new common_1.ForbiddenException('Bạn không có quyền truy cập Ma trận này');
        }
        return matrix;
    }
    async updateMatrix(matrixId, teacherId, payload) {
        if (!mongoose_1.Types.ObjectId.isValid(matrixId))
            throw new common_1.BadRequestException('ID Ma trận không hợp lệ');
        const matrix = await this.matricesRepo.findByIdSafe(matrixId, {
            select: 'teacherId',
        });
        if (!matrix)
            throw new common_1.NotFoundException('Không tìm thấy Khuôn mẫu Ma trận');
        if (matrix.teacherId.toString() !== teacherId) {
            throw new common_1.ForbiddenException('Bạn không có quyền chỉnh sửa Ma trận này');
        }
        const updateData = {};
        if (payload.title !== undefined)
            updateData.title = payload.title;
        if (payload.description !== undefined)
            updateData.description = payload.description;
        if (payload.subjectId !== undefined)
            updateData.subjectId = new mongoose_1.Types.ObjectId(payload.subjectId);
        if (payload.sections !== undefined) {
            updateData.sections = payload.sections.map((sec) => ({
                ...sec,
                rules: sec.rules.map((rule) => ({
                    folderIds: rule.folderIds?.map((id) => new mongoose_1.Types.ObjectId(id)) || [],
                    topicIds: rule.topicIds?.map((id) => new mongoose_1.Types.ObjectId(id)) || [],
                    difficulties: rule.difficulties || [],
                    tags: rule.tags || [],
                    limit: rule.limit,
                })),
            }));
        }
        if (Object.keys(updateData).length === 0) {
            throw new common_1.BadRequestException('Không có dữ liệu nào để cập nhật.');
        }
        const updated = await this.matricesRepo.updateByIdSafe(matrixId, {
            $set: updateData,
        });
        this.logger.log(`[Matrix Template] Teacher ${teacherId} updated Matrix ${matrixId}`);
        return {
            message: 'Cập nhật Khuôn mẫu Ma trận thành công',
            matrixId: updated?._id,
        };
    }
    async cloneMatrix(matrixId, teacherId) {
        if (!mongoose_1.Types.ObjectId.isValid(matrixId))
            throw new common_1.BadRequestException('ID Ma trận không hợp lệ');
        const source = await this.matricesRepo.findByIdSafe(matrixId);
        if (!source)
            throw new common_1.NotFoundException('Không tìm thấy Khuôn mẫu Ma trận nguồn');
        if (source.teacherId.toString() !== teacherId) {
            throw new common_1.ForbiddenException('Bạn không có quyền nhân bản Ma trận này');
        }
        const cloned = await this.matricesRepo.createDocument({
            title: `${source.title} (Copy)`,
            description: source.description,
            teacherId: new mongoose_1.Types.ObjectId(teacherId),
            subjectId: source.subjectId,
            sections: source.sections,
        });
        this.logger.log(`[Matrix Template] Teacher ${teacherId} cloned Matrix ${matrixId} → ${cloned._id}`);
        return {
            message: 'Nhân bản Khuôn mẫu Ma trận thành công',
            matrixId: cloned._id,
        };
    }
    async deleteMatrix(matrixId, teacherId) {
        if (!mongoose_1.Types.ObjectId.isValid(matrixId))
            throw new common_1.BadRequestException('ID không hợp lệ');
        const matrix = await this.matricesRepo.findByIdSafe(matrixId, {
            select: 'teacherId',
        });
        if (!matrix)
            throw new common_1.NotFoundException('Khuôn mẫu không tồn tại');
        if (matrix.teacherId.toString() !== teacherId)
            throw new common_1.ForbiddenException('Không có quyền xóa');
        const referencingExam = await this.examsRepo.findOneSafe({ 'dynamicConfig.matrixId': new mongoose_1.Types.ObjectId(matrixId) }, { select: '_id' });
        if (referencingExam) {
            throw new common_1.ConflictException('Không thể xóa Ma trận này vì đang được sử dụng bởi ít nhất một Quiz Lesson. ' +
                'Vui lòng gỡ liên kết khỏi tất cả Quiz trước khi xóa.');
        }
        await this.matricesRepo.deleteOneSafe({
            _id: new mongoose_1.Types.ObjectId(matrixId),
        });
        this.logger.log(`[Matrix Template] Teacher ${teacherId} deleted Matrix ${matrixId}`);
        return { message: 'Xóa Khuôn mẫu Ma trận thành công' };
    }
};
exports.ExamMatricesService = ExamMatricesService;
exports.ExamMatricesService = ExamMatricesService = ExamMatricesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [exam_matrices_repository_1.ExamMatricesRepository,
        exams_repository_1.ExamsRepository])
], ExamMatricesService);
//# sourceMappingURL=exam-matrices.service.js.map