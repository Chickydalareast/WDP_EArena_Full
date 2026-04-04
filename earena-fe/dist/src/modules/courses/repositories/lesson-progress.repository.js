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
var LessonProgressRepository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LessonProgressRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const abstract_repository_1 = require("../../../common/database/abstract.repository");
const lesson_progress_schema_1 = require("../schemas/lesson-progress.schema");
let LessonProgressRepository = LessonProgressRepository_1 = class LessonProgressRepository extends abstract_repository_1.AbstractRepository {
    progressModel;
    logger = new common_1.Logger(LessonProgressRepository_1.name);
    constructor(progressModel, connection) {
        super(progressModel, connection);
        this.progressModel = progressModel;
    }
    async atomicUpsertProgress(userId, courseId, lessonId, payload) {
        const updateOps = {};
        const setOps = {};
        if (payload.incWatchTime)
            updateOps.$inc = { watchTime: payload.incWatchTime };
        if (payload.setLastPosition !== undefined)
            setOps.lastPosition = payload.setLastPosition;
        if (payload.isCompleted) {
            setOps.isCompleted = true;
            setOps.completedAt = new Date();
        }
        if (Object.keys(setOps).length > 0)
            updateOps.$set = setOps;
        return this.progressModel
            .findOneAndUpdate({
            userId: new mongoose_2.Types.ObjectId(userId.toString()),
            courseId: new mongoose_2.Types.ObjectId(courseId.toString()),
            lessonId: new mongoose_2.Types.ObjectId(lessonId.toString()),
        }, updateOps, {
            upsert: true,
            returnDocument: 'after',
            lean: true,
            session: this.currentSession,
            setDefaultsOnInsert: true,
        })
            .exec();
    }
    async getCompletedLessonIds(userId, courseId) {
        const docs = await this.progressModel
            .find({
            userId: new mongoose_2.Types.ObjectId(userId),
            courseId: new mongoose_2.Types.ObjectId(courseId),
            isCompleted: true,
        })
            .select('lessonId')
            .lean()
            .exec();
        return docs.map((doc) => doc.lessonId.toString());
    }
};
exports.LessonProgressRepository = LessonProgressRepository;
exports.LessonProgressRepository = LessonProgressRepository = LessonProgressRepository_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(lesson_progress_schema_1.LessonProgress.name)),
    __param(1, (0, mongoose_1.InjectConnection)()),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Connection])
], LessonProgressRepository);
//# sourceMappingURL=lesson-progress.repository.js.map