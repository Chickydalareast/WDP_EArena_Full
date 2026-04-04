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
var UsersRepository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const abstract_repository_1 = require("../../common/database/abstract.repository");
const user_schema_1 = require("./schemas/user.schema");
let UsersRepository = UsersRepository_1 = class UsersRepository extends abstract_repository_1.AbstractRepository {
    logger = new common_1.Logger(UsersRepository_1.name);
    constructor(userModel, connection) {
        super(userModel, connection);
    }
    async findByEmailWithPassword(email) {
        return this.model
            .findOne({ email })
            .select('+password')
            .lean()
            .exec();
    }
    async findByIdWithPassword(id) {
        return this.model
            .findById(new mongoose_2.Types.ObjectId(id.toString()))
            .select('+password')
            .lean()
            .exec();
    }
    async findByEmail(email) {
        return this.findOneSafe({ email });
    }
    async checkEmailExists(email) {
        const result = await this.model.exists({
            email,
        });
        return !!result;
    }
    async findAllPaginated(page, limit) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.model.find({}).skip(skip).limit(limit).lean().exec(),
            this.model.countDocuments({}).exec(),
        ]);
        return { data, total };
    }
    async findUserWithSubscription(userId) {
        const user = await this.model
            .findById(new mongoose_2.Types.ObjectId(userId.toString()))
            .select('currentPlanId planExpiresAt role status')
            .populate('currentPlanId', 'code name isActive canCreatePaidCourse isUnlimitedCourses maxCourses')
            .lean()
            .exec();
        return user;
    }
};
exports.UsersRepository = UsersRepository;
exports.UsersRepository = UsersRepository = UsersRepository_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectConnection)()),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Connection])
], UsersRepository);
//# sourceMappingURL=users.repository.js.map