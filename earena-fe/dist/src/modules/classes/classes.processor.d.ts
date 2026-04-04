import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ClassesService } from './classes.service';
export declare class ClassesProcessor extends WorkerHost {
    private readonly classesService;
    private readonly logger;
    constructor(classesService: ClassesService);
    process(job: Job): Promise<any>;
}
