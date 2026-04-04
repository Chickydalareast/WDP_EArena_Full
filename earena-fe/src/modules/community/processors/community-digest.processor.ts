import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { CommunityService } from '../community.service';
import { COMMUNITY_QUEUE } from '../constants/community.constants';

@Processor(COMMUNITY_QUEUE)
export class CommunityDigestProcessor extends WorkerHost {
  private readonly logger = new Logger(CommunityDigestProcessor.name);

  constructor(private readonly communityService: CommunityService) {
    super();
  }

  async process(job: Job<{ kind: string }>): Promise<void> {
    if (job.name === 'weekly-digest') {
      const r = await this.communityService.runWeeklyDigestBatch();
      this.logger.log(`Weekly digest processed: ${r.processed} users`);
    }
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    this.logger.error(`Community job ${job?.name} failed: ${err.message}`);
  }
}
