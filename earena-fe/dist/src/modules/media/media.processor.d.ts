import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MediaRepository } from './media.repository';
import type { BlurhashJobData } from './media.service';
export declare class MediaProcessor extends WorkerHost {
    private readonly mediaRepository;
    private readonly logger;
    private readonly IMAGE_EXT_REGEX;
    constructor(mediaRepository: MediaRepository);
    process(job: Job<BlurhashJobData>): Promise<void>;
    private handleGenerateBlurhash;
}
