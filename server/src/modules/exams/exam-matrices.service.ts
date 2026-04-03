import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { ExamMatricesRepository } from './exam-matrices.repository';
import { ExamsRepository } from './exams.repository';
import {
  CreateMatrixPayload,
  GetMatricesFilter,
  UpdateMatrixPayload,
  CloneMatrixResult,
} from './interfaces/exam-matrix.interface';

@Injectable()
export class ExamMatricesService {
  private readonly logger = new Logger(ExamMatricesService.name);

  constructor(
    private readonly matricesRepo: ExamMatricesRepository,
    private readonly examsRepo: ExamsRepository,
  ) {}

  async createMatrixTemplate(teacherId: string, payload: CreateMatrixPayload) {
    const matrix = await this.matricesRepo.createDocument({
      ...payload,
      teacherId: new Types.ObjectId(teacherId),
      subjectId: new Types.ObjectId(payload.subjectId),
      sections: payload.sections.map((sec) => ({
        ...sec,
        rules: sec.rules.map((rule) => ({
          folderIds: rule.folderIds?.map((id) => new Types.ObjectId(id)) || [],
          topicIds: rule.topicIds?.map((id) => new Types.ObjectId(id)) || [],
          difficulties: rule.difficulties || [],
          tags: rule.tags || [],
          limit: rule.limit,
        })),
      })),
    });

    this.logger.log(
      `[Matrix Template] Teacher ${teacherId} created Matrix ${matrix._id}`,
    );
    return {
      message: 'Lưu Khuôn mẫu Ma trận thành công',
      matrixId: matrix._id,
    };
  }

  async getMatrices(teacherId: string, filter: GetMatricesFilter) {
    const { page, limit, subjectId, search } = filter;

    const query: any = { teacherId: new Types.ObjectId(teacherId) };
    if (subjectId) query.subjectId = new Types.ObjectId(subjectId);
    if (search) query.title = { $regex: search, $options: 'i' };

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

  async getMatrixDetail(matrixId: string, teacherId: string) {
    if (!Types.ObjectId.isValid(matrixId))
      throw new BadRequestException('ID Ma trận không hợp lệ');

    const matrix = await this.matricesRepo.findByIdSafe(matrixId);

    if (!matrix)
      throw new NotFoundException('Không tìm thấy Khuôn mẫu Ma trận');
    if (matrix.teacherId.toString() !== teacherId) {
      throw new ForbiddenException('Bạn không có quyền truy cập Ma trận này');
    }

    return matrix;
  }

  async updateMatrix(
    matrixId: string,
    teacherId: string,
    payload: UpdateMatrixPayload,
  ) {
    if (!Types.ObjectId.isValid(matrixId))
      throw new BadRequestException('ID Ma trận không hợp lệ');

    const matrix = await this.matricesRepo.findByIdSafe(matrixId, {
      select: 'teacherId',
    });
    if (!matrix)
      throw new NotFoundException('Không tìm thấy Khuôn mẫu Ma trận');
    if (matrix.teacherId.toString() !== teacherId) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa Ma trận này');
    }

    const updateData: Record<string, any> = {};
    if (payload.title !== undefined) updateData.title = payload.title;
    if (payload.description !== undefined)
      updateData.description = payload.description;
    if (payload.subjectId !== undefined)
      updateData.subjectId = new Types.ObjectId(payload.subjectId);

    if (payload.sections !== undefined) {
      updateData.sections = payload.sections.map((sec) => ({
        ...sec,
        rules: sec.rules.map((rule) => ({
          folderIds: rule.folderIds?.map((id) => new Types.ObjectId(id)) || [],
          topicIds: rule.topicIds?.map((id) => new Types.ObjectId(id)) || [],
          difficulties: rule.difficulties || [],
          tags: rule.tags || [],
          limit: rule.limit,
        })),
      }));
    }

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('Không có dữ liệu nào để cập nhật.');
    }

    const updated = await this.matricesRepo.updateByIdSafe(matrixId, {
      $set: updateData,
    });
    this.logger.log(
      `[Matrix Template] Teacher ${teacherId} updated Matrix ${matrixId}`,
    );
    return {
      message: 'Cập nhật Khuôn mẫu Ma trận thành công',
      matrixId: updated?._id,
    };
  }

  async cloneMatrix(
    matrixId: string,
    teacherId: string,
  ): Promise<CloneMatrixResult> {
    if (!Types.ObjectId.isValid(matrixId))
      throw new BadRequestException('ID Ma trận không hợp lệ');

    const source = await this.matricesRepo.findByIdSafe(matrixId);
    if (!source)
      throw new NotFoundException('Không tìm thấy Khuôn mẫu Ma trận nguồn');
    if (source.teacherId.toString() !== teacherId) {
      throw new ForbiddenException('Bạn không có quyền nhân bản Ma trận này');
    }

    const cloned = await this.matricesRepo.createDocument({
      title: `${source.title} (Copy)`,
      description: source.description,
      teacherId: new Types.ObjectId(teacherId), // Luôn assign cho người thực hiện clone
      subjectId: source.subjectId,
      sections: source.sections,
    });

    this.logger.log(
      `[Matrix Template] Teacher ${teacherId} cloned Matrix ${matrixId} → ${cloned._id}`,
    );
    return {
      message: 'Nhân bản Khuôn mẫu Ma trận thành công',
      matrixId: cloned._id,
    };
  }

  async deleteMatrix(matrixId: string, teacherId: string) {
    if (!Types.ObjectId.isValid(matrixId))
      throw new BadRequestException('ID không hợp lệ');

    const matrix = await this.matricesRepo.findByIdSafe(matrixId, {
      select: 'teacherId',
    });
    if (!matrix) throw new NotFoundException('Khuôn mẫu không tồn tại');
    if (matrix.teacherId.toString() !== teacherId)
      throw new ForbiddenException('Không có quyền xóa');

    const referencingExam = await this.examsRepo.findOneSafe(
      { 'dynamicConfig.matrixId': new Types.ObjectId(matrixId) },
      { select: '_id' },
    );

    if (referencingExam) {
      throw new ConflictException(
        'Không thể xóa Ma trận này vì đang được sử dụng bởi ít nhất một Quiz Lesson. ' +
          'Vui lòng gỡ liên kết khỏi tất cả Quiz trước khi xóa.',
      );
    }

    await this.matricesRepo.deleteOneSafe({
      _id: new Types.ObjectId(matrixId),
    });
    this.logger.log(
      `[Matrix Template] Teacher ${teacherId} deleted Matrix ${matrixId}`,
    );

    return { message: 'Xóa Khuôn mẫu Ma trận thành công' };
  }
}
