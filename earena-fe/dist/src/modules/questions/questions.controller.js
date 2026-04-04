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
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionsController = void 0;
const common_1 = require("@nestjs/common");
const questions_service_1 = require("./questions.service");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const teacher_verified_decorator_1 = require("../../common/decorators/teacher-verified.decorator");
const get_questions_dto_1 = require("./dto/get-questions.dto");
const create_question_dto_1 = require("./dto/create-question.dto");
const update_question_dto_1 = require("./dto/update-question.dto");
const clone_question_dto_1 = require("./dto/clone-question.dto");
const update_passage_dto_1 = require("./dto/update-passage.dto");
const bulk_create_question_dto_1 = require("./dto/bulk-create-question.dto");
const bulk_standardize_question_dto_1 = require("./dto/bulk-standardize-question.dto");
const move_questions_dto_1 = require("./dto/move-questions.dto");
const bulk_clone_question_dto_1 = require("./dto/bulk-clone-question.dto");
const bulk_delete_question_dto_1 = require("./dto/bulk-delete-question.dto");
const suggest_folder_dto_1 = require("./dto/suggest-folder.dto");
const organize_questions_dto_1 = require("./dto/organize-questions.dto");
const auto_tag_questions_dto_1 = require("./dto/auto-tag-questions.dto");
const active_filters_dto_1 = require("./dto/active-filters.dto");
const bulk_publish_question_dto_1 = require("./dto/bulk-publish-question.dto");
let QuestionsController = class QuestionsController {
    questionsService;
    constructor(questionsService) {
        this.questionsService = questionsService;
    }
    async getQuestions(userId, query) {
        return this.questionsService.getQuestionsPaginated(userId, {
            page: query.page || 1,
            limit: query.limit || 10,
            folderIds: query.folderIds,
            topicIds: query.topicIds,
            difficultyLevels: query.difficultyLevels,
            tags: query.tags,
            search: query.search,
            isDraft: query.isDraft,
        });
    }
    async createQuestion(userId, dto) {
        return this.questionsService.createQuestion({
            ownerId: userId,
            folderId: dto.folderId,
            topicId: dto.topicId,
            type: dto.type,
            difficultyLevel: dto.difficultyLevel,
            content: dto.content,
            explanation: dto.explanation,
            orderIndex: dto.orderIndex,
            answers: dto.answers,
            parentPassageId: dto.parentPassageId,
            tags: dto.tags,
            isDraft: dto.isDraft,
            attachedMedia: dto.attachedMedia,
        });
    }
    async bulkCreateQuestions(userId, dto) {
        return this.questionsService.bulkCreateQuestions({
            ownerId: userId,
            folderId: dto.folderId,
            questions: dto.questions,
        });
    }
    async bulkStandardizeQuestions(userId, dto) {
        return this.questionsService.bulkStandardizeQuestions(userId, {
            questionIds: dto.questionIds,
            topicId: dto.topicId,
            difficultyLevel: dto.difficultyLevel,
            autoOrganize: dto.autoOrganize,
        });
    }
    async moveQuestions(userId, dto) {
        return this.questionsService.moveQuestions(userId, {
            questionIds: dto.questionIds,
            destFolderId: dto.destFolderId,
        });
    }
    async bulkCloneQuestions(userId, dto) {
        return this.questionsService.bulkCloneQuestions(userId, {
            questionIds: dto.questionIds,
            destFolderId: dto.destFolderId,
        });
    }
    async bulkDeleteQuestions(userId, dto) {
        return this.questionsService.bulkDeleteQuestions(userId, {
            questionIds: dto.questionIds,
        });
    }
    async suggestFoldersForMove(userId, dto) {
        return this.questionsService.suggestFoldersForMove(userId, {
            questionIds: dto.questionIds,
        });
    }
    async bulkPublishQuestions(userId, dto) {
        const payload = {
            questionIds: dto.questionIds,
        };
        return this.questionsService.bulkPublishQuestions(userId, payload);
    }
    async updateQuestion(id, userId, dto) {
        return this.questionsService.updateQuestion(id, userId, {
            folderId: dto.folderId,
            topicId: dto.topicId,
            type: dto.type,
            difficultyLevel: dto.difficultyLevel,
            content: dto.content,
            explanation: dto.explanation,
            orderIndex: dto.orderIndex,
            answers: dto.answers,
            parentPassageId: dto.parentPassageId,
            tags: dto.tags,
            isDraft: dto.isDraft,
            attachedMedia: dto.attachedMedia,
        });
    }
    async deleteQuestion(id, userId) {
        return this.questionsService.deleteQuestion(id, userId);
    }
    async cloneQuestion(id, userId, dto) {
        return this.questionsService.cloneQuestion(id, userId, {
            destFolderId: dto.destFolderId,
        });
    }
    async updatePassageWithDiffing(passageId, userId, dto) {
        return this.questionsService.updatePassageWithDiffing(passageId, userId, {
            content: dto.content,
            explanation: dto.explanation,
            difficultyLevel: dto.difficultyLevel,
            tags: dto.tags,
            attachedMedia: dto.attachedMedia,
            subQuestions: dto.subQuestions,
        });
    }
    async previewOrganizeQuestions(userId, dto) {
        return this.questionsService.previewOrganize(userId, {
            questionIds: dto.questionIds,
            strategy: dto.strategy,
            baseFolderId: dto.baseFolderId,
        });
    }
    async executeOrganizeQuestions(userId, dto) {
        return this.questionsService.executeOrganize(userId, {
            questionIds: dto.questionIds,
            strategy: dto.strategy,
            baseFolderId: dto.baseFolderId,
        });
    }
    async bulkAutoTagQuestions(userId, dto) {
        return this.questionsService.dispatchAutoTagJob(userId, {
            questionIds: dto.questionIds,
        });
    }
    async getActiveFilters(userId, dto) {
        const payload = {
            folderIds: dto.folderIds,
            topicIds: dto.topicIds,
            difficulties: dto.difficulties,
            tags: dto.tags,
            isDraft: dto.isDraft,
        };
        const data = await this.questionsService.getActiveFilters(userId, payload);
        return {
            message: 'Lấy bộ lọc động thành công.',
            data,
        };
    }
};
exports.QuestionsController = QuestionsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, get_questions_dto_1.GetQuestionsDto]),
    __metadata("design:returntype", Promise)
], QuestionsController.prototype, "getQuestions", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_question_dto_1.CreateQuestionDto]),
    __metadata("design:returntype", Promise)
], QuestionsController.prototype, "createQuestion", null);
__decorate([
    (0, common_1.Post)('bulk-create'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, bulk_create_question_dto_1.BulkCreateQuestionDto]),
    __metadata("design:returntype", Promise)
], QuestionsController.prototype, "bulkCreateQuestions", null);
__decorate([
    (0, common_1.Patch)('bulk-standardize'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, bulk_standardize_question_dto_1.BulkStandardizeQuestionDto]),
    __metadata("design:returntype", Promise)
], QuestionsController.prototype, "bulkStandardizeQuestions", null);
__decorate([
    (0, common_1.Patch)('bulk-move'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, move_questions_dto_1.MoveQuestionsDto]),
    __metadata("design:returntype", Promise)
], QuestionsController.prototype, "moveQuestions", null);
__decorate([
    (0, common_1.Post)('bulk-clone'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, bulk_clone_question_dto_1.BulkCloneQuestionDto]),
    __metadata("design:returntype", Promise)
], QuestionsController.prototype, "bulkCloneQuestions", null);
__decorate([
    (0, common_1.Post)('bulk-delete'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, bulk_delete_question_dto_1.BulkDeleteQuestionDto]),
    __metadata("design:returntype", Promise)
], QuestionsController.prototype, "bulkDeleteQuestions", null);
__decorate([
    (0, common_1.Post)('suggest-folders'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, suggest_folder_dto_1.SuggestFolderDto]),
    __metadata("design:returntype", Promise)
], QuestionsController.prototype, "suggestFoldersForMove", null);
__decorate([
    (0, common_1.Patch)('bulk-publish'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, bulk_publish_question_dto_1.BulkPublishQuestionDto]),
    __metadata("design:returntype", Promise)
], QuestionsController.prototype, "bulkPublishQuestions", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_question_dto_1.UpdateQuestionDto]),
    __metadata("design:returntype", Promise)
], QuestionsController.prototype, "updateQuestion", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], QuestionsController.prototype, "deleteQuestion", null);
__decorate([
    (0, common_1.Post)(':id/clone'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, clone_question_dto_1.CloneQuestionDto]),
    __metadata("design:returntype", Promise)
], QuestionsController.prototype, "cloneQuestion", null);
__decorate([
    (0, common_1.Put)(':id/passage'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_passage_dto_1.UpdatePassageDto]),
    __metadata("design:returntype", Promise)
], QuestionsController.prototype, "updatePassageWithDiffing", null);
__decorate([
    (0, common_1.Post)('organize/preview'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, organize_questions_dto_1.OrganizeQuestionsDto]),
    __metadata("design:returntype", Promise)
], QuestionsController.prototype, "previewOrganizeQuestions", null);
__decorate([
    (0, common_1.Post)('organize/execute'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, organize_questions_dto_1.OrganizeQuestionsDto]),
    __metadata("design:returntype", Promise)
], QuestionsController.prototype, "executeOrganizeQuestions", null);
__decorate([
    (0, common_1.Post)('bulk-auto-tag'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, auto_tag_questions_dto_1.AutoTagQuestionsDto]),
    __metadata("design:returntype", Promise)
], QuestionsController.prototype, "bulkAutoTagQuestions", null);
__decorate([
    (0, common_1.Post)('active-filters'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, active_filters_dto_1.ActiveFiltersDto]),
    __metadata("design:returntype", Promise)
], QuestionsController.prototype, "getActiveFilters", null);
exports.QuestionsController = QuestionsController = __decorate([
    (0, common_1.Controller)('questions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, teacher_verified_decorator_1.RequireTeacherVerified)(),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.TEACHER, user_role_enum_1.UserRole.ADMIN),
    __metadata("design:paramtypes", [questions_service_1.QuestionsService])
], QuestionsController);
//# sourceMappingURL=questions.controller.js.map