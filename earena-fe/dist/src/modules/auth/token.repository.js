"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var TokenRepository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const crypto = __importStar(require("crypto"));
const abstract_repository_1 = require("../../common/database/abstract.repository");
const token_schema_1 = require("./schemas/token.schema");
let TokenRepository = TokenRepository_1 = class TokenRepository extends abstract_repository_1.AbstractRepository {
    logger = new common_1.Logger(TokenRepository_1.name);
    constructor(tokenModel, connection) {
        super(tokenModel, connection);
    }
    hashToken(token) {
        return crypto.createHash('sha256').update(token).digest('hex');
    }
    async saveToken(token, userId, expiresAt, session) {
        const hashedToken = this.hashToken(token);
        return this.createDocument({
            token: hashedToken,
            userId: new mongoose_2.Types.ObjectId(userId.toString()),
            type: 'refresh',
            expiresAt,
        }, { session });
    }
    async findByToken(token) {
        const hashedToken = this.hashToken(token);
        return this.findOneSafe({ token: hashedToken });
    }
    async deleteByToken(token) {
        const hashedToken = this.hashToken(token);
        const result = await this.model.deleteOne({ token: hashedToken });
        return result.deletedCount > 0;
    }
    async deleteAllByUserId(userId) {
        const result = await this.model.deleteMany({
            userId: new mongoose_2.Types.ObjectId(userId.toString())
        });
        return result.deletedCount > 0;
    }
};
exports.TokenRepository = TokenRepository;
exports.TokenRepository = TokenRepository = TokenRepository_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(token_schema_1.Token.name)),
    __param(1, (0, mongoose_1.InjectConnection)()),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Connection])
], TokenRepository);
//# sourceMappingURL=token.repository.js.map