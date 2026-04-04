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
exports.TokenSchema = exports.Token = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Token = class Token extends mongoose_2.Document {
    token;
    userId;
    type;
    expiresAt;
};
exports.Token = Token;
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], Token.prototype, "token", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Token.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['refresh'], default: 'refresh' }),
    __metadata("design:type", String)
], Token.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, expires: 0 }),
    __metadata("design:type", Date)
], Token.prototype, "expiresAt", void 0);
exports.Token = Token = __decorate([
    (0, mongoose_1.Schema)({ versionKey: false, timestamps: true })
], Token);
exports.TokenSchema = mongoose_1.SchemaFactory.createForClass(Token);
exports.TokenSchema.index({ userId: 1, token: 1 });
//# sourceMappingURL=token.schema.js.map