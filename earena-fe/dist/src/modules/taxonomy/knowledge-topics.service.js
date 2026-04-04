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
var KnowledgeTopicsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeTopicsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const knowledge_topics_repository_1 = require("./knowledge-topics.repository");
const redis_service_1 = require("../../common/redis/redis.service");
let KnowledgeTopicsService = KnowledgeTopicsService_1 = class KnowledgeTopicsService {
    topicsRepo;
    redisService;
    logger = new common_1.Logger(KnowledgeTopicsService_1.name);
    constructor(topicsRepo, redisService) {
        this.topicsRepo = topicsRepo;
        this.redisService = redisService;
    }
    async getTreeBySubject(subjectId) {
        const cacheKey = `topics_tree:${subjectId}`;
        const cachedTree = await this.redisService.get(cacheKey);
        if (cachedTree) {
            this.logger.log(`[Cache Hit] Lấy cây kiến thức từ Redis: ${subjectId}`);
            return JSON.parse(cachedTree);
        }
        const flatList = await this.topicsRepo.model
            .find({ subjectId: new mongoose_1.Types.ObjectId(subjectId) })
            .lean()
            .exec();
        const map = new Map();
        const tree = [];
        flatList.forEach((node) => {
            map.set(node._id.toString(), { ...node, children: [] });
        });
        flatList.forEach((node) => {
            map.set(node._id.toString(), { ...node, children: [] });
        });
        flatList.forEach((node) => {
            if (node.parentId) {
                const parent = map.get(node.parentId.toString());
                if (parent) {
                    parent.children.push(map.get(node._id.toString()));
                }
            }
            else {
                tree.push(map.get(node._id.toString()));
            }
        });
        await this.redisService.set(cacheKey, JSON.stringify(tree), 86400 * 30);
        this.logger.log(`[Cache Miss] Đã build cây và lưu Redis: ${subjectId}`);
        return tree;
    }
};
exports.KnowledgeTopicsService = KnowledgeTopicsService;
exports.KnowledgeTopicsService = KnowledgeTopicsService = KnowledgeTopicsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [knowledge_topics_repository_1.KnowledgeTopicsRepository,
        redis_service_1.RedisService])
], KnowledgeTopicsService);
//# sourceMappingURL=knowledge-topics.service.js.map