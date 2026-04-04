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
var CommunityDigestProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunityDigestProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const bullmq_2 = require("bullmq");
const community_service_1 = require("../community.service");
const community_constants_1 = require("../constants/community.constants");
let CommunityDigestProcessor = CommunityDigestProcessor_1 = class CommunityDigestProcessor extends bullmq_1.WorkerHost {
    communityService;
    logger = new common_1.Logger(CommunityDigestProcessor_1.name);
    constructor(communityService) {
        super();
        this.communityService = communityService;
    }
    async process(job) {
        if (job.name === 'weekly-digest') {
            const r = await this.communityService.runWeeklyDigestBatch();
            this.logger.log(`Weekly digest processed: ${r.processed} users`);
        }
    }
    onFailed(job, err) {
        this.logger.error(`Community job ${job?.name} failed: ${err.message}`);
    }
};
exports.CommunityDigestProcessor = CommunityDigestProcessor;
__decorate([
    (0, bullmq_1.OnWorkerEvent)('failed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bullmq_2.Job, Error]),
    __metadata("design:returntype", void 0)
], CommunityDigestProcessor.prototype, "onFailed", null);
exports.CommunityDigestProcessor = CommunityDigestProcessor = CommunityDigestProcessor_1 = __decorate([
    (0, bullmq_1.Processor)(community_constants_1.COMMUNITY_QUEUE),
    __metadata("design:paramtypes", [community_service_1.CommunityService])
], CommunityDigestProcessor);
//# sourceMappingURL=community-digest.processor.js.map