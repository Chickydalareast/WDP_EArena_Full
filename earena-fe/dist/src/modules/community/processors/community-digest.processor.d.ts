import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CommunityService } from '../community.service';
export declare class CommunityDigestProcessor extends WorkerHost {
    private readonly communityService;
    private readonly logger;
    constructor(communityService: CommunityService);
    process(job: Job<{
        kind: string;
    }>): Promise<void>;
    onFailed(job: Job, err: Error): void;
}
