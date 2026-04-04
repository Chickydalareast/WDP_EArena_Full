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
exports.ChatThreadSchema = exports.ChatThread = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let ChatThread = class ChatThread {
    userLowId;
    userHighId;
    lastMessageAt;
    lastMessageSenderId;
    readAtLow;
    readAtHigh;
};
exports.ChatThread = ChatThread;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ChatThread.prototype, "userLowId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ChatThread.prototype, "userHighId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: () => new Date() }),
    __metadata("design:type", Date)
], ChatThread.prototype, "lastMessageAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ChatThread.prototype, "lastMessageSenderId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], ChatThread.prototype, "readAtLow", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], ChatThread.prototype, "readAtHigh", void 0);
exports.ChatThread = ChatThread = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'chat_threads' })
], ChatThread);
exports.ChatThreadSchema = mongoose_1.SchemaFactory.createForClass(ChatThread);
exports.ChatThreadSchema.index({ userLowId: 1, userHighId: 1 }, { unique: true });
//# sourceMappingURL=chat-thread.schema.js.map