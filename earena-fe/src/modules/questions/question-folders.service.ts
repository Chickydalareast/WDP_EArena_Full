import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { QuestionFoldersRepository } from './question-folders.repository';
import { QuestionsRepository } from './questions.repository';
import {
  CreateFolderPayload,
  UpdateFolderPayload,
} from './interfaces/question-folders.interface';

@Injectable()
export class QuestionFoldersService {
  private readonly logger = new Logger(QuestionFoldersService.name);

  constructor(
    private readonly foldersRepo: QuestionFoldersRepository,
    private readonly questionsRepo: QuestionsRepository,
  ) {}

  async createFolder(ownerId: string, payload: CreateFolderPayload) {
    let parentAncestors: Types.ObjectId[] = [];

    if (payload.parentId) {
      if (!Types.ObjectId.isValid(payload.parentId))
        throw new BadRequestException('ID thư mục gốc không hợp lệ.');
      const parent = await this.foldersRepo.findByIdSafe(
        new Types.ObjectId(payload.parentId),
      );

      if (!parent || parent.ownerId.toString() !== ownerId) {
        throw new ForbiddenException(
          'Thư mục gốc không tồn tại hoặc bạn không có quyền truy cập.',
        );
      }
      parentAncestors = [...(parent.ancestors || []), parent._id];
    }

    return this.foldersRepo.createDocument({
      name: payload.name,
      description: payload.description || '',
      ownerId: new Types.ObjectId(ownerId),
      parentId: payload.parentId ? new Types.ObjectId(payload.parentId) : null,
      ancestors: parentAncestors,
    });
  }

  async updateFolder(
    folderId: string,
    ownerId: string,
    payload: UpdateFolderPayload,
  ) {
    if (!Types.ObjectId.isValid(folderId))
      throw new BadRequestException('ID thư mục không hợp lệ.');
    const folderObjectId = new Types.ObjectId(folderId);

    return this.foldersRepo.executeInTransaction(async () => {
      const folder = await this.foldersRepo.findByIdSafe(folderObjectId);
      if (!folder) throw new NotFoundException('Thư mục không tồn tại.');
      if (folder.ownerId.toString() !== ownerId) {
        throw new ForbiddenException(
          'Bạn không có quyền chỉnh sửa thư mục này.',
        );
      }

      const updateData: any = {};
      if (payload.name !== undefined) updateData.name = payload.name;
      if (payload.description !== undefined)
        updateData.description = payload.description;

      if (
        payload.parentId !== undefined &&
        payload.parentId !== folder.parentId?.toString()
      ) {
        let newAncestors: Types.ObjectId[] = [];

        if (payload.parentId === null) {
          updateData.parentId = null;
          updateData.ancestors = [];
        } else {
          if (!Types.ObjectId.isValid(payload.parentId))
            throw new BadRequestException('ID thư mục cha không hợp lệ.');

          if (payload.parentId === folderId)
            throw new BadRequestException('Thư mục cha không thể là chính nó.');

          const newParent = await this.foldersRepo.findByIdSafe(
            new Types.ObjectId(payload.parentId),
          );
          if (!newParent || newParent.ownerId.toString() !== ownerId) {
            throw new ForbiddenException(
              'Thư mục cha không tồn tại hoặc bạn không có quyền truy cập.',
            );
          }

          const isTargetInsideCurrent = newParent.ancestors.some(
            (a) => a.toString() === folderId,
          );
          if (isTargetInsideCurrent) {
            throw new ConflictException(
              'Không thể di chuyển thư mục cha vào bên trong thư mục con của chính nó.',
            );
          }

          updateData.parentId = newParent._id;
          newAncestors = [...(newParent.ancestors || []), newParent._id];
          updateData.ancestors = newAncestors;
        }

        await this.foldersRepo.modelInstance.updateOne(
          { _id: folderObjectId },
          { $set: updateData },
          { session: (this.foldersRepo as any).currentSession },
        );

        const descendants = await this.foldersRepo.modelInstance
          .find({ ancestors: folderObjectId })
          .select('_id ancestors')
          .lean()
          .exec();

        if (descendants.length > 0) {
          const bulkOps = descendants.map((desc) => {
            const oldAncestorsStr = desc.ancestors.map((a) => a.toString());
            const folderIndex = oldAncestorsStr.indexOf(folderId);

            const relativeAncestors = desc.ancestors.slice(folderIndex + 1);

            const rebuiltAncestors = [
              ...newAncestors,
              folderObjectId,
              ...relativeAncestors,
            ];

            return {
              updateOne: {
                filter: { _id: desc._id },
                update: { $set: { ancestors: rebuiltAncestors } },
              },
            };
          });

          await this.foldersRepo.modelInstance.bulkWrite(bulkOps, {
            session: (this.foldersRepo as any).currentSession,
          });
        }
      } else {
        if (Object.keys(updateData).length > 0) {
          await this.foldersRepo.modelInstance.updateOne(
            { _id: folderObjectId },
            { $set: updateData },
            { session: (this.foldersRepo as any).currentSession },
          );
        }
      }

      this.logger.log(`[Folder] User ${ownerId} updated folder: ${folderId}`);
      return { message: 'Cập nhật thư mục thành công.' };
    });
  }

  async getMyFolders(ownerId: string) {
    const allFolders = await this.foldersRepo.modelInstance
      .find({ ownerId: new Types.ObjectId(ownerId) })
      .select('_id name description parentId createdAt')
      .sort({ createdAt: 1 })
      .lean()
      .exec();

    const map = new Map<string, any>();
    const roots: any[] = [];

    for (const folder of allFolders) {
      map.set(folder._id.toString(), { ...folder, children: [] });
    }

    for (const folder of allFolders) {
      const node = map.get(folder._id.toString());
      if (folder.parentId) {
        const parent = map.get(folder.parentId.toString());
        if (parent) {
          parent.children.push(node);
        } else {
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  async deleteFolder(folderId: string, ownerId: string) {
    if (!Types.ObjectId.isValid(folderId))
      throw new BadRequestException('ID thư mục không hợp lệ.');
    const folderObjectId = new Types.ObjectId(folderId);

    const folder = await this.foldersRepo.findByIdSafe(folderObjectId);
    if (!folder) throw new NotFoundException('Thư mục không tồn tại.');
    if (folder.ownerId.toString() !== ownerId) {
      throw new ForbiddenException(
        'Bạn không có quyền xóa thư mục của người khác.',
      );
    }

    const hasChildFolders = await this.foldersRepo.modelInstance.exists({
      ancestors: folderObjectId,
    });
    if (hasChildFolders) {
      throw new ConflictException(
        'Không thể xóa! Thư mục này đang chứa các thư mục con bên trong.',
      );
    }

    const hasQuestions = await this.questionsRepo.modelInstance.exists({
      folderId: folderObjectId,
    });
    if (hasQuestions) {
      throw new ConflictException(
        'Không thể xóa! Thư mục này đang chứa câu hỏi. Vui lòng di chuyển hoặc xóa hết câu hỏi trước.',
      );
    }

    await this.foldersRepo.deleteOneSafe({ _id: folderObjectId });
    this.logger.log(
      `[Folder] User ${ownerId} đã xóa thư mục rỗng: ${folderId}`,
    );

    return { message: 'Đã xóa thư mục thành công.' };
  }
}
