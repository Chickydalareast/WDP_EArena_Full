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
exports.ClassMemberSchema = exports.ClassMember = exports.JoinStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var JoinStatus;
(function (JoinStatus) {
    JoinStatus["PENDING"] = "PENDING";
    JoinStatus["APPROVED"] = "APPROVED";
    JoinStatus["REJECTED"] = "REJECTED";
})(JoinStatus || (exports.JoinStatus = JoinStatus = {}));
let ClassMember = class ClassMember {
    classId;
    studentId;
    status;
};
exports.ClassMember = ClassMember;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Class', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ClassMember.prototype, "classId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ClassMember.prototype, "studentId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: JoinStatus, default: JoinStatus.PENDING, index: true }),
    __metadata("design:type", String)
], ClassMember.prototype, "status", void 0);
exports.ClassMember = ClassMember = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'class_members' })
], ClassMember);
exports.ClassMemberSchema = mongoose_1.SchemaFactory.createForClass(ClassMember);
exports.ClassMemberSchema.index({ classId: 1, studentId: 1 }, { unique: true });
//# sourceMappingURL=class-member.schema.js.map