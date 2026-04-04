"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const bullmq_1 = require("@nestjs/bullmq");
const exam_schema_1 = require("./schemas/exam.schema");
const exam_paper_schema_1 = require("./schemas/exam-paper.schema");
const exam_matrix_schema_1 = require("./schemas/exam-matrix.schema");
const exam_submission_schema_1 = require("./schemas/exam-submission.schema");
const exams_controller_1 = require("./exams.controller");
const exams_service_1 = require("./exams.service");
const exam_take_controller_1 = require("./exam-take.controller");
const exam_take_service_1 = require("./exam-take.service");
const exam_generator_service_1 = require("./exam-generator.service");
const exam_submission_processor_1 = require("./exam-submission.processor");
const question_sync_processor_1 = require("./question-sync.processor");
const exams_repository_1 = require("./exams.repository");
const exam_papers_repository_1 = require("./exam-papers.repository");
const exam_matrices_repository_1 = require("./exam-matrices.repository");
const exam_submissions_repository_1 = require("./exam-submissions.repository");
const questions_module_1 = require("../questions/questions.module");
const users_module_1 = require("../users/users.module");
const courses_module_1 = require("../courses/courses.module");
const exam_grading_listener_1 = require("./listeners/exam-grading.listener");
const exam_matrices_controller_1 = require("./exam-matrices.controller");
const exam_matrices_service_1 = require("./exam-matrices.service");
const taxonomy_module_1 = require("../taxonomy/taxonomy.module");
const quiz_lifecycle_listener_1 = require("./listeners/quiz-lifecycle.listener");
let ExamsModule = class ExamsModule {
};
exports.ExamsModule = ExamsModule;
exports.ExamsModule = ExamsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: exam_schema_1.Exam.name, schema: exam_schema_1.ExamSchema },
                { name: exam_paper_schema_1.ExamPaper.name, schema: exam_paper_schema_1.ExamPaperSchema },
                { name: exam_matrix_schema_1.ExamMatrix.name, schema: exam_matrix_schema_1.ExamMatrixSchema },
                { name: exam_submission_schema_1.ExamSubmission.name, schema: exam_submission_schema_1.ExamSubmissionSchema },
            ]),
            bullmq_1.BullModule.registerQueue({ name: 'exam-grading' }),
            questions_module_1.QuestionsModule,
            taxonomy_module_1.TaxonomyModule,
            users_module_1.UsersModule,
            (0, common_1.forwardRef)(() => courses_module_1.CoursesModule),
        ],
        controllers: [exams_controller_1.ExamsController, exam_take_controller_1.ExamTakeController, exam_matrices_controller_1.ExamMatricesController],
        providers: [
            exams_repository_1.ExamsRepository,
            exam_papers_repository_1.ExamPapersRepository,
            exam_matrices_repository_1.ExamMatricesRepository,
            exam_submissions_repository_1.ExamSubmissionsRepository,
            exams_service_1.ExamsService,
            exam_take_service_1.ExamTakeService,
            exam_generator_service_1.ExamGeneratorService,
            exam_submission_processor_1.ExamSubmissionProcessor,
            question_sync_processor_1.QuestionSyncProcessor,
            exam_grading_listener_1.ExamGradingListener,
            exam_matrices_service_1.ExamMatricesService,
            quiz_lifecycle_listener_1.QuizLifecycleListener,
        ],
        exports: [
            exams_repository_1.ExamsRepository,
            exam_papers_repository_1.ExamPapersRepository,
            exam_submissions_repository_1.ExamSubmissionsRepository,
            exams_service_1.ExamsService,
            exam_matrices_service_1.ExamMatricesService,
            exam_generator_service_1.ExamGeneratorService,
        ],
    })
], ExamsModule);
//# sourceMappingURL=exams.module.js.map