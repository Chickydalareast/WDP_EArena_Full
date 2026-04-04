"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const bullmq_1 = require("@nestjs/bullmq");
const question_folder_schema_1 = require("./schemas/question-folder.schema");
const question_schema_1 = require("./schemas/question.schema");
const question_folders_repository_1 = require("./question-folders.repository");
const questions_repository_1 = require("./questions.repository");
const questions_service_1 = require("./questions.service");
const question_folders_service_1 = require("./question-folders.service");
const ai_question_builder_service_1 = require("./services/ai-question-builder.service");
const question_folders_controller_1 = require("./question-folders.controller");
const questions_controller_1 = require("./questions.controller");
const ai_question_builder_controller_1 = require("./controller/ai-question-builder.controller");
const question_organizer_engine_1 = require("./engines/question-organizer.engine");
const question_tasks_processor_1 = require("./processors/question-tasks.processor");
const users_module_1 = require("../users/users.module");
const taxonomy_module_1 = require("../taxonomy/taxonomy.module");
const media_module_1 = require("../media/media.module");
const ai_module_1 = require("../ai/ai.module");
const question_jobs_interface_1 = require("./interfaces/question-jobs.interface");
let QuestionsModule = class QuestionsModule {
};
exports.QuestionsModule = QuestionsModule;
exports.QuestionsModule = QuestionsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: question_folder_schema_1.QuestionFolder.name, schema: question_folder_schema_1.QuestionFolderSchema },
                { name: question_schema_1.Question.name, schema: question_schema_1.QuestionSchema },
            ]),
            bullmq_1.BullModule.registerQueue({
                name: 'question-sync',
            }),
            bullmq_1.BullModule.registerQueue({
                name: question_jobs_interface_1.QUESTION_TASKS_QUEUE,
            }),
            taxonomy_module_1.TaxonomyModule,
            users_module_1.UsersModule,
            media_module_1.MediaModule,
            ai_module_1.AiModule,
        ],
        controllers: [
            questions_controller_1.QuestionsController,
            question_folders_controller_1.QuestionFoldersController,
            ai_question_builder_controller_1.AiQuestionBuilderController,
        ],
        providers: [
            question_folders_repository_1.QuestionFoldersRepository,
            questions_repository_1.QuestionsRepository,
            questions_service_1.QuestionsService,
            question_folders_service_1.QuestionFoldersService,
            ai_question_builder_service_1.AiQuestionBuilderService,
            question_organizer_engine_1.QuestionOrganizerEngine,
            question_tasks_processor_1.QuestionTasksProcessor,
        ],
        exports: [
            question_folders_repository_1.QuestionFoldersRepository,
            questions_repository_1.QuestionsRepository,
            questions_service_1.QuestionsService,
            question_folders_service_1.QuestionFoldersService,
        ],
    })
], QuestionsModule);
//# sourceMappingURL=questions.module.js.map