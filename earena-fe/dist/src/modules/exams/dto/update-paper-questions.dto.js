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
exports.UpdatePaperQuestionsDto = exports.PaperUpdateAction = void 0;
const class_validator_1 = require("class-validator");
var PaperUpdateAction;
(function (PaperUpdateAction) {
    PaperUpdateAction["ADD"] = "ADD";
    PaperUpdateAction["REMOVE"] = "REMOVE";
    PaperUpdateAction["REORDER"] = "REORDER";
})(PaperUpdateAction || (exports.PaperUpdateAction = PaperUpdateAction = {}));
class UpdatePaperQuestionsDto {
    action;
    questionId;
    questionIds;
}
exports.UpdatePaperQuestionsDto = UpdatePaperQuestionsDto;
__decorate([
    (0, class_validator_1.IsEnum)(PaperUpdateAction),
    __metadata("design:type", String)
], UpdatePaperQuestionsDto.prototype, "action", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => o.action === PaperUpdateAction.ADD ||
        o.action === PaperUpdateAction.REMOVE),
    (0, class_validator_1.IsMongoId)({ message: 'ID câu hỏi không hợp lệ.' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Phải cung cấp questionId khi ADD hoặc REMOVE.' }),
    __metadata("design:type", String)
], UpdatePaperQuestionsDto.prototype, "questionId", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => o.action === PaperUpdateAction.REORDER),
    (0, class_validator_1.IsArray)({ message: 'Danh sách ID phải là một mảng.' }),
    (0, class_validator_1.IsMongoId)({ each: true, message: 'Danh sách ID chứa phần tử không hợp lệ.' }),
    (0, class_validator_1.ArrayMinSize)(1, { message: 'Cần ít nhất 1 câu hỏi để sắp xếp lại.' }),
    __metadata("design:type", Array)
], UpdatePaperQuestionsDto.prototype, "questionIds", void 0);
//# sourceMappingURL=update-paper-questions.dto.js.map