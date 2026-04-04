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
exports.QuestionFoldersController = void 0;
const common_1 = require("@nestjs/common");
const question_folders_service_1 = require("./question-folders.service");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const teacher_verified_decorator_1 = require("../../common/decorators/teacher-verified.decorator");
const create_question_folder_dto_1 = require("./dto/create-question-folder.dto");
const update_question_folder_dto_1 = require("./dto/update-question-folder.dto");
let QuestionFoldersController = class QuestionFoldersController {
    questionFoldersService;
    constructor(questionFoldersService) {
        this.questionFoldersService = questionFoldersService;
    }
    async createFolder(userId, dto) {
        return this.questionFoldersService.createFolder(userId, {
            name: dto.name,
            description: dto.description,
            parentId: dto.parentId,
        });
    }
    async getMyFolders(userId) {
        return this.questionFoldersService.getMyFolders(userId);
    }
    async updateFolder(folderId, userId, dto) {
        return this.questionFoldersService.updateFolder(folderId, userId, {
            name: dto.name,
            description: dto.description,
            parentId: dto.parentId,
        });
    }
    async deleteFolder(folderId, userId) {
        return this.questionFoldersService.deleteFolder(folderId, userId);
    }
};
exports.QuestionFoldersController = QuestionFoldersController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_question_folder_dto_1.CreateQuestionFolderDto]),
    __metadata("design:returntype", Promise)
], QuestionFoldersController.prototype, "createFolder", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], QuestionFoldersController.prototype, "getMyFolders", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_question_folder_dto_1.UpdateQuestionFolderDto]),
    __metadata("design:returntype", Promise)
], QuestionFoldersController.prototype, "updateFolder", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], QuestionFoldersController.prototype, "deleteFolder", null);
exports.QuestionFoldersController = QuestionFoldersController = __decorate([
    (0, common_1.Controller)('question-folders'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, teacher_verified_decorator_1.RequireTeacherVerified)(),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.TEACHER, user_role_enum_1.UserRole.ADMIN),
    __metadata("design:paramtypes", [question_folders_service_1.QuestionFoldersService])
], QuestionFoldersController);
//# sourceMappingURL=question-folders.controller.js.map