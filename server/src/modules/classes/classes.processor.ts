import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ClassesService } from './classes.service';

@Processor('classes_queue')
export class ClassesProcessor extends WorkerHost {
  private readonly logger = new Logger(ClassesProcessor.name);

  constructor(private readonly classesService: ClassesService) {
    super();
  }

  async process(job: Job): Promise<any> {
    switch (job.name) {
      case 'auto_rotate_code':
        return this.classesService.handleAutoRotateCodes();
      default:
        this.logger.warn(`Không tìm thấy handler cho job name: ${job.name}`);
    }
  }
}