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
var TaxonomySeederService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaxonomySeederService = void 0;
const common_1 = require("@nestjs/common");
const subjects_repository_1 = require("./subjects.repository");
let TaxonomySeederService = TaxonomySeederService_1 = class TaxonomySeederService {
    subjectsRepo;
    logger = new common_1.Logger(TaxonomySeederService_1.name);
    constructor(subjectsRepo) {
        this.subjectsRepo = subjectsRepo;
    }
    async onApplicationBootstrap() {
        const subjects = [
            { name: 'Toán học', code: 'MATH' },
            { name: 'Vật lý', code: 'PHYS' },
            { name: 'Hóa học', code: 'CHEM' },
            { name: 'Tiếng Anh', code: 'ENGL' },
            { name: 'Sinh học', code: 'BIOL' },
            { name: 'Ngữ văn', code: 'LITR' },
            { name: 'Lịch sử', code: 'HIST' },
            { name: 'Địa lý', code: 'GEOG' },
            { name: 'GDCD', code: 'CIVI' },
        ];
        for (const sub of subjects) {
            const exists = await this.subjectsRepo.exists({ code: sub.code });
            if (!exists) {
                await this.subjectsRepo.create(sub);
                this.logger.log(`[Seeder] Đã khởi tạo môn học mặc định: ${sub.name}`);
            }
        }
    }
};
exports.TaxonomySeederService = TaxonomySeederService;
exports.TaxonomySeederService = TaxonomySeederService = TaxonomySeederService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [subjects_repository_1.SubjectsRepository])
], TaxonomySeederService);
//# sourceMappingURL=taxonomy-seeder.service.js.map