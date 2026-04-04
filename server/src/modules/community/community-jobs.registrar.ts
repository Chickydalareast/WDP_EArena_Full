import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { COMMUNITY_QUEUE } from './constants/community.constants';

@Injectable()
export class CommunityJobsRegistrar implements OnModuleInit {
  private readonly logger = new Logger(CommunityJobsRegistrar.name);

  constructor(@InjectQueue(COMMUNITY_QUEUE) private readonly queue: Queue) {}

  async onModuleInit() {
    try {
      await this.queue.add(
        'weekly-digest',
        { kind: 'weekly' },
        {
          repeat: { pattern: '0 8 * * 1' },
          jobId: 'community-weekly-digest',
          removeOnComplete: true,
        },
      );
      this.logger.log('Đã đăng ký job digest tuần (Community).');
    } catch (e) {
      this.logger.warn(
        `Không thể đăng ký repeat job Community (có thể đã tồn tại): ${e instanceof Error ? e.message : e}`,
      );
    }
  }
}
