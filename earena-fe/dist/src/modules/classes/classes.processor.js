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
var ClassesProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassesProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const classes_service_1 = require("./classes.service");
let ClassesProcessor = ClassesProcessor_1 = class ClassesProcessor extends bullmq_1.WorkerHost {
    classesService;
    logger = new common_1.Logger(ClassesProcessor_1.name);
    constructor(classesService) {
        super();
        this.classesService = classesService;
    }
    async process(job) {
        switch (job.name) {
            case 'auto_rotate_code':
                return this.classesService.handleAutoRotateCodes();
            default:
                this.logger.warn(`Không tìm thấy handler cho job name: ${job.name}`);
        }
    }
};
exports.ClassesProcessor = ClassesProcessor;
exports.ClassesProcessor = ClassesProcessor = ClassesProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('classes_queue'),
    __metadata("design:paramtypes", [classes_service_1.ClassesService])
], ClassesProcessor);
//# sourceMappingURL=classes.processor.js.map