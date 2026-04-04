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
var QuestionFoldersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionFoldersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const question_folders_repository_1 = require("./question-folders.repository");
const questions_repository_1 = require("./questions.repository");
let QuestionFoldersService = QuestionFoldersService_1 = class QuestionFoldersService {
    foldersRepo;
    questionsRepo;
    logger = new common_1.Logger(QuestionFoldersService_1.name);
    constructor(foldersRepo, questionsRepo) {
        this.foldersRepo = foldersRepo;
        this.questionsRepo = questionsRepo;
    }
    async createFolder(ownerId, payload) {
        let parentAncestors = [];
        if (payload.parentId) {
            if (!mongoose_1.Types.ObjectId.isValid(payload.parentId))
                throw new common_1.BadRequestException('ID thư mục gốc không hợp lệ.');
            const parent = await this.foldersRepo.findByIdSafe(new mongoose_1.Types.ObjectId(payload.parentId));
            if (!parent || parent.ownerId.toString() !== ownerId) {
                throw new common_1.ForbiddenException('Thư mục gốc không tồn tại hoặc bạn không có quyền truy cập.');
            }
            parentAncestors = [...(parent.ancestors || []), parent._id];
        }
        return this.foldersRepo.createDocument({
            name: payload.name,
            description: payload.description || '',
            ownerId: new mongoose_1.Types.ObjectId(ownerId),
            parentId: payload.parentId ? new mongoose_1.Types.ObjectId(payload.parentId) : null,
            ancestors: parentAncestors,
        });
    }
    async updateFolder(folderId, ownerId, payload) {
        if (!mongoose_1.Types.ObjectId.isValid(folderId))
            throw new common_1.BadRequestException('ID thư mục không hợp lệ.');
        const folderObjectId = new mongoose_1.Types.ObjectId(folderId);
        return this.foldersRepo.executeInTransaction(async () => {
            const folder = await this.foldersRepo.findByIdSafe(folderObjectId);
            if (!folder)
                throw new common_1.NotFoundException('Thư mục không tồn tại.');
            if (folder.ownerId.toString() !== ownerId) {
                throw new common_1.ForbiddenException('Bạn không có quyền chỉnh sửa thư mục này.');
            }
            const updateData = {};
            if (payload.name !== undefined)
                updateData.name = payload.name;
            if (payload.description !== undefined)
                updateData.description = payload.description;
            if (payload.parentId !== undefined &&
                payload.parentId !== folder.parentId?.toString()) {
                let newAncestors = [];
                if (payload.parentId === null) {
                    updateData.parentId = null;
                    updateData.ancestors = [];
                }
                else {
                    if (!mongoose_1.Types.ObjectId.isValid(payload.parentId))
                        throw new common_1.BadRequestException('ID thư mục cha không hợp lệ.');
                    if (payload.parentId === folderId)
                        throw new common_1.BadRequestException('Thư mục cha không thể là chính nó.');
                    const newParent = await this.foldersRepo.findByIdSafe(new mongoose_1.Types.ObjectId(payload.parentId));
                    if (!newParent || newParent.ownerId.toString() !== ownerId) {
                        throw new common_1.ForbiddenException('Thư mục cha không tồn tại hoặc bạn không có quyền truy cập.');
                    }
                    const isTargetInsideCurrent = newParent.ancestors.some((a) => a.toString() === folderId);
                    if (isTargetInsideCurrent) {
                        throw new common_1.ConflictException('Không thể di chuyển thư mục cha vào bên trong thư mục con của chính nó.');
                    }
                    updateData.parentId = newParent._id;
                    newAncestors = [...(newParent.ancestors || []), newParent._id];
                    updateData.ancestors = newAncestors;
                }
                await this.foldersRepo.modelInstance.updateOne({ _id: folderObjectId }, { $set: updateData }, { session: this.foldersRepo.currentSession });
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
                        session: this.foldersRepo.currentSession,
                    });
                }
            }
            else {
                if (Object.keys(updateData).length > 0) {
                    await this.foldersRepo.modelInstance.updateOne({ _id: folderObjectId }, { $set: updateData }, { session: this.foldersRepo.currentSession });
                }
            }
            this.logger.log(`[Folder] User ${ownerId} updated folder: ${folderId}`);
            return { message: 'Cập nhật thư mục thành công.' };
        });
    }
    async getMyFolders(ownerId) {
        const allFolders = await this.foldersRepo.modelInstance
            .find({ ownerId: new mongoose_1.Types.ObjectId(ownerId) })
            .select('_id name description parentId createdAt')
            .sort({ createdAt: 1 })
            .lean()
            .exec();
        const map = new Map();
        const roots = [];
        for (const folder of allFolders) {
            map.set(folder._id.toString(), { ...folder, children: [] });
        }
        for (const folder of allFolders) {
            const node = map.get(folder._id.toString());
            if (folder.parentId) {
                const parent = map.get(folder.parentId.toString());
                if (parent) {
                    parent.children.push(node);
                }
                else {
                    roots.push(node);
                }
            }
            else {
                roots.push(node);
            }
        }
        return roots;
    }
    async deleteFolder(folderId, ownerId) {
        if (!mongoose_1.Types.ObjectId.isValid(folderId))
            throw new common_1.BadRequestException('ID thư mục không hợp lệ.');
        const folderObjectId = new mongoose_1.Types.ObjectId(folderId);
        const folder = await this.foldersRepo.findByIdSafe(folderObjectId);
        if (!folder)
            throw new common_1.NotFoundException('Thư mục không tồn tại.');
        if (folder.ownerId.toString() !== ownerId) {
            throw new common_1.ForbiddenException('Bạn không có quyền xóa thư mục của người khác.');
        }
        const hasChildFolders = await this.foldersRepo.modelInstance.exists({
            ancestors: folderObjectId,
        });
        if (hasChildFolders) {
            throw new common_1.ConflictException('Không thể xóa! Thư mục này đang chứa các thư mục con bên trong.');
        }
        const hasQuestions = await this.questionsRepo.modelInstance.exists({
            folderId: folderObjectId,
        });
        if (hasQuestions) {
            throw new common_1.ConflictException('Không thể xóa! Thư mục này đang chứa câu hỏi. Vui lòng di chuyển hoặc xóa hết câu hỏi trước.');
        }
        await this.foldersRepo.deleteOneSafe({ _id: folderObjectId });
        this.logger.log(`[Folder] User ${ownerId} đã xóa thư mục rỗng: ${folderId}`);
        return { message: 'Đã xóa thư mục thành công.' };
    }
};
exports.QuestionFoldersService = QuestionFoldersService;
exports.QuestionFoldersService = QuestionFoldersService = QuestionFoldersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [question_folders_repository_1.QuestionFoldersRepository,
        questions_repository_1.QuestionsRepository])
], QuestionFoldersService);
//# sourceMappingURL=question-folders.service.js.map