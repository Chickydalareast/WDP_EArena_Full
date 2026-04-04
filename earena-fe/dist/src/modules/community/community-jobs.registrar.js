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
var CommunityJobsRegistrar_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunityJobsRegistrar = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const community_constants_1 = require("./constants/community.constants");
let CommunityJobsRegistrar = CommunityJobsRegistrar_1 = class CommunityJobsRegistrar {
    queue;
    logger = new common_1.Logger(CommunityJobsRegistrar_1.name);
    constructor(queue) {
        this.queue = queue;
    }
    async onModuleInit() {
        try {
            await this.queue.add('weekly-digest', { kind: 'weekly' }, {
                repeat: { pattern: '0 8 * * 1' },
                jobId: 'community-weekly-digest',
                removeOnComplete: true,
            });
            this.logger.log('Đã đăng ký job digest tuần (Community).');
        }
        catch (e) {
            this.logger.warn(`Không thể đăng ký repeat job Community (có thể đã tồn tại): ${e instanceof Error ? e.message : e}`);
        }
    }
};
exports.CommunityJobsRegistrar = CommunityJobsRegistrar;
exports.CommunityJobsRegistrar = CommunityJobsRegistrar = CommunityJobsRegistrar_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bullmq_1.InjectQueue)(community_constants_1.COMMUNITY_QUEUE)),
    __metadata("design:paramtypes", [bullmq_2.Queue])
], CommunityJobsRegistrar);
//# sourceMappingURL=community-jobs.registrar.js.map