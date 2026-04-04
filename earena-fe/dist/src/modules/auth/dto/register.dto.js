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
exports.RegisterDto = exports.QualificationDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class QualificationDto {
    url;
    name;
}
exports.QualificationDto = QualificationDto;
__decorate([
    (0, class_validator_1.IsUrl)({}, { message: 'URL bằng cấp không hợp lệ' }),
    __metadata("design:type", String)
], QualificationDto.prototype, "url", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Tên bằng cấp không được để trống' }),
    __metadata("design:type", String)
], QualificationDto.prototype, "name", void 0);
class RegisterDto {
    email;
    fullName;
    password;
    ticket;
    role;
    subjectIds;
    qualifications;
}
exports.RegisterDto = RegisterDto;
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: 'Định dạng email không hợp lệ.' }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Họ và tên không được để trống.' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "fullName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6, { message: 'Mật khẩu phải từ 6 ký tự trở lên.' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Thiếu vé xác thực OTP (Ticket).' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "ticket", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['STUDENT', 'TEACHER'], { message: 'Role không hợp lệ' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => o.role === 'TEACHER'),
    (0, class_validator_1.IsArray)({ message: 'Danh sách môn học phải là một mảng' }),
    (0, class_validator_1.IsMongoId)({ each: true, message: 'Mã môn học (ID) không hợp lệ' }),
    (0, class_validator_1.ArrayUnique)({ message: 'Danh sách môn học không được trùng lặp' }),
    (0, class_validator_1.ArrayMinSize)(1, {
        message: 'Giáo viên bắt buộc phải chọn ít nhất một môn học chuyên môn',
    }),
    __metadata("design:type", Array)
], RegisterDto.prototype, "subjectIds", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => o.role === 'TEACHER'),
    (0, class_validator_1.IsArray)({ message: 'Danh sách bằng cấp phải là một mảng' }),
    (0, class_validator_1.ArrayMinSize)(1, {
        message: 'Giáo viên bắt buộc phải upload ít nhất một bằng cấp',
    }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => QualificationDto),
    __metadata("design:type", Array)
], RegisterDto.prototype, "qualifications", void 0);
//# sourceMappingURL=register.dto.js.map