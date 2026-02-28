import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { SubjectsRepository } from './subjects.repository';

@Injectable()
export class TaxonomySeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(TaxonomySeederService.name);

  constructor(private readonly subjectsRepo: SubjectsRepository) {}

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
        await this.subjectsRepo.create(sub as any);
        this.logger.log(`[Seeder] Đã khởi tạo môn học mặc định: ${sub.name}`);
      }
    }
  }
}
