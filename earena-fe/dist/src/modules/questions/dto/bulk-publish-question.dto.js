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
exports.BulkPublishQuestionDto = void 0;
const class_validator_1 = require("class-validator");
class BulkPublishQuestionDto {
    questionIds;
}
exports.BulkPublishQuestionDto = BulkPublishQuestionDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1, { message: 'Phải chọn ít nhất 1 câu hỏi để xuất bản.' }),
    (0, class_validator_1.IsMongoId)({ each: true, message: 'ID câu hỏi không hợp lệ.' }),
    __metadata("design:type", Array)
], BulkPublishQuestionDto.prototype, "questionIds", void 0);
//# sourceMappingURL=bulk-publish-question.dto.js.map