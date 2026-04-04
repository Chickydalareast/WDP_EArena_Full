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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateQuestionFolderDto = void 0;
const class_validator_1 = require("class-validator");
class CreateQuestionFolderDto {
    name;
    description;
    parentId;
}
exports.CreateQuestionFolderDto = CreateQuestionFolderDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Tên thư mục không được để trống.' }),
    (0, class_validator_1.MaxLength)(255, { message: 'Tên thư mục không được vượt quá 255 ký tự.' }),
    __metadata("design:type", String)
], CreateQuestionFolderDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(1000, { message: 'Mô tả không được vượt quá 1000 ký tự.' }),
    __metadata("design:type", String)
], CreateQuestionFolderDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsMongoId)({ message: 'ID thư mục cha không hợp lệ.' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateQuestionFolderDto.prototype, "parentId", void 0);
//# sourceMappingURL=create-question-folder.dto.js.map