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
var SectionsRepository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SectionsRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const abstract_repository_1 = require("../../../common/database/abstract.repository");
const section_schema_1 = require("../schemas/section.schema");
let SectionsRepository = SectionsRepository_1 = class SectionsRepository extends abstract_repository_1.AbstractRepository {
    sectionModel;
    logger = new common_1.Logger(SectionsRepository_1.name);
    constructor(sectionModel, connection) {
        super(sectionModel, connection);
        this.sectionModel = sectionModel;
    }
    async getNextOrder(courseId) {
        const lastSection = await this.sectionModel
            .findOne({ courseId: new mongoose_2.Types.ObjectId(courseId) })
            .select('order')
            .sort({ order: -1 })
            .lean()
            .exec();
        return lastSection ? lastSection.order + 1 : 1;
    }
    async bulkUpdateOrder(updates) {
        if (!updates.length)
            return;
        const ops = updates.map((u) => ({
            updateOne: {
                filter: { _id: new mongoose_2.Types.ObjectId(u.id) },
                update: { $set: { order: u.order } },
            },
        }));
        return this.model.bulkWrite(ops, { ordered: false });
    }
    async bulkUpdateOrderAndSection(updates) {
        if (!updates.length)
            return;
        const ops = updates.map((u) => ({
            updateOne: {
                filter: { _id: new mongoose_2.Types.ObjectId(u.id) },
                update: {
                    $set: { order: u.order, sectionId: new mongoose_2.Types.ObjectId(u.sectionId) },
                },
            },
        }));
        return this.model.bulkWrite(ops, { ordered: false });
    }
    async bulkUpdateOrderStrict(courseId, updates) {
        if (!updates.length)
            return;
        const ops = updates.map((u) => ({
            updateOne: {
                filter: {
                    _id: new mongoose_2.Types.ObjectId(u.id),
                    courseId: new mongoose_2.Types.ObjectId(courseId),
                },
                update: { $set: { order: u.order } },
            },
        }));
        return this.model.bulkWrite(ops, {
            ordered: false,
            session: this.currentSession,
        });
    }
};
exports.SectionsRepository = SectionsRepository;
exports.SectionsRepository = SectionsRepository = SectionsRepository_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(section_schema_1.Section.name)),
    __param(1, (0, mongoose_1.InjectConnection)()),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Connection])
], SectionsRepository);
//# sourceMappingURL=sections.repository.js.map