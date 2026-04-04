"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaxonomyModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const subject_schema_1 = require("./schemas/subject.schema");
const knowledge_topic_schema_1 = require("./schemas/knowledge-topic.schema");
const subjects_repository_1 = require("./subjects.repository");
const knowledge_topics_repository_1 = require("./knowledge-topics.repository");
const taxonomy_controller_1 = require("./taxonomy.controller");
const subjects_service_1 = require("./subjects.service");
const knowledge_topics_service_1 = require("./knowledge-topics.service");
const users_module_1 = require("../users/users.module");
let TaxonomyModule = class TaxonomyModule {
};
exports.TaxonomyModule = TaxonomyModule;
exports.TaxonomyModule = TaxonomyModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: subject_schema_1.Subject.name, schema: subject_schema_1.SubjectSchema },
                { name: knowledge_topic_schema_1.KnowledgeTopic.name, schema: knowledge_topic_schema_1.KnowledgeTopicSchema },
            ]),
            (0, common_1.forwardRef)(() => users_module_1.UsersModule),
        ],
        controllers: [taxonomy_controller_1.TaxonomyController],
        providers: [
            subjects_repository_1.SubjectsRepository,
            knowledge_topics_repository_1.KnowledgeTopicsRepository,
            subjects_service_1.SubjectsService,
            knowledge_topics_service_1.KnowledgeTopicsService,
        ],
        exports: [
            subjects_repository_1.SubjectsRepository,
            knowledge_topics_repository_1.KnowledgeTopicsRepository,
            subjects_service_1.SubjectsService,
            knowledge_topics_service_1.KnowledgeTopicsService,
        ],
    })
], TaxonomyModule);
//# sourceMappingURL=taxonomy.module.js.map