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
exports.MoveQuestionsDto = void 0;
const class_validator_1 = require("class-validator");
class MoveQuestionsDto {
    questionIds;
    destFolderId;
}
exports.MoveQuestionsDto = MoveQuestionsDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsMongoId)({ each: true }),
    (0, class_validator_1.ArrayMinSize)(1, { message: 'Chọn ít nhất 1 câu hỏi để di chuyển.' }),
    __metadata("design:type", Array)
], MoveQuestionsDto.prototype, "questionIds", void 0);
__decorate([
    (0, class_validator_1.IsMongoId)({ message: 'Thư mục đích không hợp lệ.' }),
    __metadata("design:type", String)
], MoveQuestionsDto.prototype, "destFolderId", void 0);
//# sourceMappingURL=move-questions.dto.js.map