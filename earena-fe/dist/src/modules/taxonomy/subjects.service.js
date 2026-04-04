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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubjectsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const subjects_repository_1 = require("./subjects.repository");
const users_service_1 = require("../users/users.service");
let SubjectsService = class SubjectsService {
    subjectsRepo;
    usersService;
    constructor(subjectsRepo, usersService) {
        this.subjectsRepo = subjectsRepo;
        this.usersService = usersService;
    }
    async getAllActiveSubjects() {
        return this.subjectsRepo.model
            .find({ isActive: true })
            .select('name code description')
            .sort({ name: 1 })
            .lean()
            .exec();
    }
    async getMySubjects(userId) {
        const user = await this.usersService.findById(userId);
        if (!user || !user.subjectIds || user.subjectIds.length === 0) {
            return [];
        }
        return this.subjectsRepo.model
            .find({
            _id: { $in: user.subjectIds },
            isActive: true,
        })
            .select('name code')
            .lean()
            .exec();
    }
    async findSubjectsByIds(ids) {
        const uniq = [...new Set(ids.filter(Boolean))];
        if (!uniq.length)
            return [];
        return this.subjectsRepo.model
            .find({
            _id: { $in: uniq.map((id) => new mongoose_1.Types.ObjectId(id)) },
            isActive: true,
        })
            .select('name code')
            .lean()
            .exec();
    }
};
exports.SubjectsService = SubjectsService;
exports.SubjectsService = SubjectsService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => users_service_1.UsersService))),
    __metadata("design:paramtypes", [subjects_repository_1.SubjectsRepository,
        users_service_1.UsersService])
], SubjectsService);
//# sourceMappingURL=subjects.service.js.map