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
exports.UserSchema = exports.User = exports.AuthProvider = exports.TeacherVerificationStatus = exports.UserStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_role_enum_1 = require("../../../common/enums/user-role.enum");
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "ACTIVE";
    UserStatus["INACTIVE"] = "INACTIVE";
    UserStatus["BANNED"] = "BANNED";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
var TeacherVerificationStatus;
(function (TeacherVerificationStatus) {
    TeacherVerificationStatus["PENDING"] = "PENDING";
    TeacherVerificationStatus["VERIFIED"] = "VERIFIED";
    TeacherVerificationStatus["REJECTED"] = "REJECTED";
})(TeacherVerificationStatus || (exports.TeacherVerificationStatus = TeacherVerificationStatus = {}));
var AuthProvider;
(function (AuthProvider) {
    AuthProvider["LOCAL"] = "LOCAL";
    AuthProvider["GOOGLE"] = "GOOGLE";
    AuthProvider["FACEBOOK"] = "FACEBOOK";
})(AuthProvider || (exports.AuthProvider = AuthProvider = {}));
let User = class User {
    email;
    password;
    fullName;
    avatar;
    phone;
    dateOfBirth;
    bio;
    role;
    status;
    authProvider;
    providerId;
    isEmailVerified;
    subjectIds;
    lastLoginAt;
    currentPlanId;
    planExpiresAt;
    teacherVerificationStatus;
    teacherVerificationNote;
    teacherVerifiedAt;
    teacherVerifiedBy;
    qualifications;
    hasUploadedQualifications;
};
exports.User = User;
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        unique: true,
        index: true,
        lowercase: true,
        trim: true,
    }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, select: false }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], User.prototype, "fullName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], User.prototype, "avatar", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, trim: true }),
    __metadata("design:type", String)
], User.prototype, "phone", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", Date)
], User.prototype, "dateOfBirth", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, trim: true, maxlength: 1000 }),
    __metadata("design:type", String)
], User.prototype, "bio", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: user_role_enum_1.UserRole, default: user_role_enum_1.UserRole.STUDENT }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: UserStatus,
        default: UserStatus.ACTIVE,
        index: true,
    }),
    __metadata("design:type", String)
], User.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: AuthProvider, default: AuthProvider.LOCAL }),
    __metadata("design:type", String)
], User.prototype, "authProvider", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, index: true }),
    __metadata("design:type", String)
], User.prototype, "providerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isEmailVerified", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: mongoose_2.Types.ObjectId, ref: 'Subject' }], default: [] }),
    __metadata("design:type", Array)
], User.prototype, "subjectIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", Date)
], User.prototype, "lastLoginAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Types.ObjectId,
        ref: 'PricingPlan',
        required: false,
        index: true,
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], User.prototype, "currentPlanId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, required: false, index: true }),
    __metadata("design:type", Date)
], User.prototype, "planExpiresAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: TeacherVerificationStatus, default: TeacherVerificationStatus.PENDING }),
    __metadata("design:type", String)
], User.prototype, "teacherVerificationStatus", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], User.prototype, "teacherVerificationNote", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, required: false }),
    __metadata("design:type", Date)
], User.prototype, "teacherVerifiedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: false }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], User.prototype, "teacherVerifiedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ url: String, name: String, uploadedAt: Date }], default: [] }),
    __metadata("design:type", Array)
], User.prototype, "qualifications", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "hasUploadedQualifications", void 0);
exports.User = User = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'users' })
], User);
exports.UserSchema = mongoose_1.SchemaFactory.createForClass(User);
exports.UserSchema.index({ role: 1, status: 1 });
exports.UserSchema.index({ currentPlanId: 1, planExpiresAt: 1, status: 1 });
//# sourceMappingURL=user.schema.js.map