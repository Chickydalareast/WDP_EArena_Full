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
var KnowledgeTopicsRepository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeTopicsRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const abstract_repository_1 = require("../../common/database/abstract.repository");
const knowledge_topic_schema_1 = require("./schemas/knowledge-topic.schema");
let KnowledgeTopicsRepository = KnowledgeTopicsRepository_1 = class KnowledgeTopicsRepository extends abstract_repository_1.AbstractRepository {
    logger = new common_1.Logger(KnowledgeTopicsRepository_1.name);
    constructor(model, connection) {
        super(model, connection);
    }
};
exports.KnowledgeTopicsRepository = KnowledgeTopicsRepository;
exports.KnowledgeTopicsRepository = KnowledgeTopicsRepository = KnowledgeTopicsRepository_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(knowledge_topic_schema_1.KnowledgeTopic.name)),
    __param(1, (0, mongoose_1.InjectConnection)()),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Connection])
], KnowledgeTopicsRepository);
//# sourceMappingURL=knowledge-topics.repository.js.map