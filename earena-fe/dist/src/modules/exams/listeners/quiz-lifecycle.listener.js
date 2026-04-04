"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var QuizLifecycleListener_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizLifecycleListener = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const exams_service_1 = require("../exams.service");
const course_event_constant_1 = require("../../courses/constants/course-event.constant");
const courseEventConstant = __importStar(require("../../courses/constants/course-event.constant"));
let QuizLifecycleListener = QuizLifecycleListener_1 = class QuizLifecycleListener {
    examsService;
    logger = new common_1.Logger(QuizLifecycleListener_1.name);
    constructor(examsService) {
        this.examsService = examsService;
    }
    async handleCourseDeactivated(payload) {
        try {
            await this.examsService.unpublishAllQuizzesByCourse(payload.courseId);
            this.logger.log(`[Quiz Lifecycle] Đã unpublish tất cả Quiz của Course ${payload.courseId} ` +
                `(Lý do: ${payload.reason})`);
        }
        catch (error) {
            this.logger.error(`[Quiz Lifecycle] Lỗi khi unpublish quiz cho Course ${payload.courseId}: ${error.message}`, error.stack);
        }
    }
};
exports.QuizLifecycleListener = QuizLifecycleListener;
__decorate([
    (0, event_emitter_1.OnEvent)(course_event_constant_1.CourseEventPattern.COURSE_STATUS_DEACTIVATED, { async: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], QuizLifecycleListener.prototype, "handleCourseDeactivated", null);
exports.QuizLifecycleListener = QuizLifecycleListener = QuizLifecycleListener_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [exams_service_1.ExamsService])
], QuizLifecycleListener);
//# sourceMappingURL=quiz-lifecycle.listener.js.map