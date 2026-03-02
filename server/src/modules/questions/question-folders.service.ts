import { ConflictException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { QuestionFoldersRepository } from './question-folders.repository';
import { QuestionsRepository } from './questions.repository';

@Injectable()
export class QuestionFoldersService {
  private readonly logger = new Logger(QuestionFoldersService.name);

  constructor(
    private readonly foldersRepo: QuestionFoldersRepository,
    private readonly questionsRepo: QuestionsRepository,
  ) {}

  async createFolder(name: string, ownerId: string, subjectId?: string) {
    return this.foldersRepo.create({
      name,
      ownerId: new Types.ObjectId(ownerId),
      subjectId: subjectId ? new Types.ObjectId(subjectId) : null,
    } as any);
  }

  async getMyFolders(ownerId: string) {
    return (this.foldersRepo as any).model
      .find({ ownerId: new Types.ObjectId(ownerId) })
      .lean()
      .exec();
  }

  async deleteFolder(folderId: string, ownerId: string) {
    const folderObjectId = new Types.ObjectId(folderId);

    const folder = await this.foldersRepo.findOne({ _id: folderObjectId } as any);
    if (folder.ownerId.toString() !== ownerId) {
      throw new ForbiddenException('Bạn không có quyền xóa thư mục của người khác.');
    }

    const hasQuestions = await this.questionsRepo.exists({ folderId: folderObjectId } as any);
    if (hasQuestions) {
      throw new ConflictException(
        'Không thể xóa! Thư mục này đang chứa câu hỏi. Vui lòng di chuyển hoặc xóa hết câu hỏi bên trong trước.'
      );
    }
    
    await (this.foldersRepo as any).model.deleteOne({ _id: folderObjectId });
    this.logger.log(`[Folder] User ${ownerId} đã xóa thư mục rỗng: ${folderId}`);

    return { message: 'Đã xóa thư mục thành công.' };
  }
}