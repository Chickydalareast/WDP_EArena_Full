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
exports.UserResponseDto = void 0;
const class_transformer_1 = require("class-transformer");
let UserResponseDto = class UserResponseDto {
    id;
    email;
    fullName;
    role;
    avatar;
    phone;
    dateOfBirth;
    subjects;
    subscription;
    teacherVerificationStatus;
};
exports.UserResponseDto = UserResponseDto;
__decorate([
    (0, class_transformer_1.Expose)({ name: 'id' }),
    (0, class_transformer_1.Transform)(({ obj }) => obj._id?.toString() || obj.id),
    __metadata("design:type", String)
], UserResponseDto.prototype, "id", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], UserResponseDto.prototype, "email", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], UserResponseDto.prototype, "fullName", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], UserResponseDto.prototype, "role", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], UserResponseDto.prototype, "avatar", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], UserResponseDto.prototype, "phone", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Date)
], UserResponseDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'subjects' }),
    (0, class_transformer_1.Transform)(({ obj }) => {
        if (Array.isArray(obj.subjectIds)) {
            return obj.subjectIds.map((sub) => {
                if (sub && sub._id && sub.name) {
                    return { id: sub._id.toString(), name: sub.name };
                }
                return { id: sub?.toString() || '', name: 'Unknown Subject' };
            });
        }
        return [];
    }),
    __metadata("design:type", Array)
], UserResponseDto.prototype, "subjects", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'subscription' }),
    (0, class_transformer_1.Transform)(({ obj }) => {
        if (!obj.currentPlanId)
            return null;
        const planInfo = obj.currentPlanId;
        const planId = planInfo._id ? planInfo._id.toString() : planInfo.toString();
        const planCode = planInfo.code || 'FREE';
        let isExpired = true;
        let expiresAtStr = null;
        if (obj.planExpiresAt) {
            const expiresAtDate = new Date(obj.planExpiresAt);
            expiresAtStr = expiresAtDate.toISOString();
            isExpired = expiresAtDate.getTime() < Date.now();
        }
        return {
            planId,
            planCode,
            expiresAt: expiresAtStr,
            isExpired,
        };
    }),
    __metadata("design:type", Object)
], UserResponseDto.prototype, "subscription", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], UserResponseDto.prototype, "teacherVerificationStatus", void 0);
exports.UserResponseDto = UserResponseDto = __decorate([
    (0, class_transformer_1.Exclude)()
], UserResponseDto);
//# sourceMappingURL=user-response.dto.js.map