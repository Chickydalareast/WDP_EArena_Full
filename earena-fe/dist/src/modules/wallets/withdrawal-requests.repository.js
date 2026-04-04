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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var WithdrawalRequestsRepository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithdrawalRequestsRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const abstract_repository_1 = require("../../common/database/abstract.repository");
const withdrawal_request_schema_1 = require("./schemas/withdrawal-request.schema");
let WithdrawalRequestsRepository = WithdrawalRequestsRepository_1 = class WithdrawalRequestsRepository extends abstract_repository_1.AbstractRepository {
    requestModel;
    logger = new common_1.Logger(WithdrawalRequestsRepository_1.name);
    constructor(requestModel, connection) {
        super(requestModel, connection);
        this.requestModel = requestModel;
    }
    async getAdminWithdrawalRequests(status, page, limit) {
        const filter = {};
        if (status)
            filter.status = status;
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.requestModel
                .find(filter)
                .populate('teacherId', 'fullName email phone')
                .populate('processedBy', 'fullName')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean()
                .exec(),
            this.requestModel.countDocuments(filter).exec(),
        ]);
        return {
            items: data,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
};
exports.WithdrawalRequestsRepository = WithdrawalRequestsRepository;
exports.WithdrawalRequestsRepository = WithdrawalRequestsRepository = WithdrawalRequestsRepository_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(withdrawal_request_schema_1.WithdrawalRequest.name)),
    __param(1, (0, mongoose_1.InjectConnection)()),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Connection])
], WithdrawalRequestsRepository);
//# sourceMappingURL=withdrawal-requests.repository.js.map