import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { ExamMatricesRepository } from './exam-matrices.repository';
import {
  CreateMatrixPayload,
  GetMatricesFilter,
  UpdateMatrixPayload,
  CloneMatrixResult,
  RuleQuestionType,
} from './interfaces/exam-matrix.interface';

interface SectionIntegrityPayload {
  name: string;
  rules: { limit?: number; questionType?: string; subQuestionLimit?: number }[];
}

@Injectable()
export class ExamMatricesService {
  private readonly logger = new Logger(ExamMatricesService.name);

  constructor(private readonly matricesRepo: ExamMatricesRepository) {}


  private validateMatrixIntegrity(sections: SectionIntegrityPayload[], context: string) {
    if (!sections || sections.length === 0) {
      throw new BadRequestException(`[${context}] Khuôn mẫu phải có ít nhất 1 Section.`);
    }

    let totalLimit = 0;

    for (const sec of sections) {
      if (!sec.rules || sec.rules.length === 0) {
        throw new BadRequestException(`[${context}] Section "${sec.name}" không có rule nào. Vui lòng thêm rule hoặc xóa section.`);
      }
      
      for (let i = 0; i < sec.rules.length; i++) {
        const rule = sec.rules[i];
        
        if (!rule.limit || rule.limit <= 0) {
          throw new BadRequestException(`[${context}] Section "${sec.name}" - Rule ${i + 1} có số lượng câu (limit) không hợp lệ. Phải > 0.`);
        }
        
        if (rule.questionType === RuleQuestionType.PASSAGE) {
          if (!rule.subQuestionLimit || rule.subQuestionLimit <= 0) {
            throw new BadRequestException(`[${context}] Section "${sec.name}" - Rule ${i + 1} (Đoạn văn) yêu cầu phải thiết lập giới hạn số câu hỏi con (subQuestionLimit > 0).`);
          }
        }
        totalLimit += rule.limit;
      }
    }

    if (totalLimit === 0) {
      throw new BadRequestException(`[${context}] Tổng số câu hỏi của toàn bộ Ma trận không được bằng 0.`);
    }
  }

  async createMatrixTemplate(teacherId: string, payload: CreateMatrixPayload) {
    this.validateMatrixIntegrity(payload.sections, 'Tạo mới Ma trận');

    const matrix = await this.matricesRepo.createDocument({
      title: payload.title,
      description: payload.description,
      teacherId: new Types.ObjectId(teacherId),
      subjectId: new Types.ObjectId(payload.subjectId),
      sections: payload.sections.map((sec) => ({
        ...sec,
        rules: sec.rules.map((rule) => ({
          questionType: rule.questionType,
          subQuestionLimit: rule.subQuestionLimit,
          folderIds: rule.folderIds?.map((id) => new Types.ObjectId(id)) || [],
          topicIds: rule.topicIds?.map((id) => new Types.ObjectId(id)) || [],
          difficulties: rule.difficulties || [],
          tags: rule.tags || [],
          limit: rule.limit,
        })),
      })),
    });

    this.logger.log(`[Matrix Template] Teacher ${teacherId} created Matrix ${matrix._id}`);
    return { message: 'Tạo Khuôn mẫu Ma trận thành công', matrixId: matrix._id };
  }

  async updateMatrix(matrixId: string, teacherId: string, payload: UpdateMatrixPayload) {
    if (!Types.ObjectId.isValid(matrixId)) throw new BadRequestException('ID không hợp lệ');

    if (payload.sections) {
      this.validateMatrixIntegrity(payload.sections, 'Cập nhật Ma trận');
    }

    const matrix = await this.matricesRepo.findByIdSafe(matrixId, { select: 'teacherId' });
    if (!matrix) throw new NotFoundException('Khuôn mẫu không tồn tại');
    if (matrix.teacherId.toString() !== teacherId) throw new ForbiddenException('Không có quyền sửa');

    const updateData: any = { ...payload };
    if (payload.subjectId) updateData.subjectId = new Types.ObjectId(payload.subjectId);
    if (payload.sections) {
      updateData.sections = payload.sections.map((sec) => ({
        ...sec,
        rules: sec.rules.map((rule) => ({
          questionType: rule.questionType,
          subQuestionLimit: rule.subQuestionLimit,
          folderIds: rule.folderIds?.map((id) => new Types.ObjectId(id)) || [],
          topicIds: rule.topicIds?.map((id) => new Types.ObjectId(id)) || [],
          difficulties: rule.difficulties || [],
          tags: rule.tags || [],
          limit: rule.limit,
        })),
      }));
    }

    await this.matricesRepo.updateByIdSafe(matrixId, updateData);
    return { message: 'Cập nhật thành công' };
  }

  async getMatrixDetail(matrixId: string, teacherId: string) {
    const matrix = await this.matricesRepo.findByIdSafe(matrixId);
    if (!matrix) throw new NotFoundException('Khuôn mẫu không tồn tại');
    if (matrix.teacherId.toString() !== teacherId) {
      throw new ForbiddenException('Bạn không có quyền xem Ma trận này');
    }

    this.validateMatrixIntegrity(matrix.sections, 'Load Ma trận');
    return matrix;
  }

  async cloneMatrix(matrixId: string, teacherId: string): Promise<CloneMatrixResult> {
    const source = await this.getMatrixDetail(matrixId, teacherId);

    const cloned = await this.matricesRepo.createDocument({
      title: `${source.title} (Copy)`,
      description: source.description,
      teacherId: new Types.ObjectId(teacherId),
      subjectId: source.subjectId,
      sections: source.sections,
    });

    this.logger.log(`[Matrix Template] Teacher ${teacherId} cloned Matrix ${matrixId} → ${cloned._id}`);
    return { message: 'Nhân bản Khuôn mẫu Ma trận thành công', matrixId: cloned._id };
  }

  async deleteMatrix(matrixId: string, teacherId: string) {
    if (!Types.ObjectId.isValid(matrixId)) throw new BadRequestException('ID không hợp lệ');

    const matrix = await this.matricesRepo.findByIdSafe(matrixId, { select: 'teacherId' });
    if (!matrix) throw new NotFoundException('Khuôn mẫu không tồn tại');
    if (matrix.teacherId.toString() !== teacherId) throw new ForbiddenException('Không có quyền xóa');

    await this.matricesRepo.deleteOneSafe({ _id: new Types.ObjectId(matrixId) });
    return { message: 'Đã xóa Khuôn mẫu Ma trận' };
  }

  async getMatrices(teacherId: string, filter: GetMatricesFilter) {
    const { matrices, total } = await this.matricesRepo.getPaginatedMatrices(teacherId, {
      subjectId: filter.subjectId,
      search: filter.search,
      page: filter.page,
      limit: filter.limit,
    });

    return {
      data: matrices,
      meta: {
        totalItems: total,
        itemCount: matrices.length,
        itemsPerPage: filter.limit,
        totalPages: Math.ceil(total / filter.limit),
        currentPage: filter.page,
      },
    };
  }
}