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
var WalletTransactionsRepository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletTransactionsRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const abstract_repository_1 = require("../../common/database/abstract.repository");
const wallet_transaction_schema_1 = require("./schemas/wallet-transaction.schema");
let WalletTransactionsRepository = WalletTransactionsRepository_1 = class WalletTransactionsRepository extends abstract_repository_1.AbstractRepository {
    transactionModel;
    logger = new common_1.Logger(WalletTransactionsRepository_1.name);
    constructor(transactionModel, connection) {
        super(transactionModel, connection);
        this.transactionModel = transactionModel;
    }
    async getMyTransactions(walletId, page, limit) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.transactionModel
                .find({ walletId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean()
                .exec(),
            this.transactionModel.countDocuments({ walletId }),
        ]);
        return {
            data,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async calculateTotalRevenueByCourse(courseId) {
        const pipeline = [
            {
                $match: {
                    referenceId: new mongoose_2.Types.ObjectId(courseId.toString()),
                    referenceType: wallet_transaction_schema_1.ReferenceType.COURSE,
                    type: wallet_transaction_schema_1.TransactionType.REVENUE,
                },
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$amount' },
                },
            },
        ];
        const result = await this.transactionModel.aggregate(pipeline).exec();
        return result.length > 0 ? result[0].totalRevenue : 0;
    }
};
exports.WalletTransactionsRepository = WalletTransactionsRepository;
exports.WalletTransactionsRepository = WalletTransactionsRepository = WalletTransactionsRepository_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(wallet_transaction_schema_1.WalletTransaction.name)),
    __param(1, (0, mongoose_1.InjectConnection)()),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Connection])
], WalletTransactionsRepository);
//# sourceMappingURL=wallet-transactions.repository.js.map