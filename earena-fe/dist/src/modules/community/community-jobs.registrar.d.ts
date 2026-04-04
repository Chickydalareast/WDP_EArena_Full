import { OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';
export declare class CommunityJobsRegistrar implements OnModuleInit {
    private readonly queue;
    private readonly logger;
    constructor(queue: Queue);
    onModuleInit(): Promise<void>;
}
