import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ExamSubmissionsRepository } from './exam-submissions.repository';
import { ExamPapersRepository } from './exam-papers.repository';
import { ExamsRepository } from './exams.repository';
import { EnrollmentsService } from '../courses/services/enrollments.service';
export declare class ExamSubmissionProcessor extends WorkerHost {
    private readonly submissionsRepo;
    private readonly papersRepo;
    private readonly examsRepo;
    private readonly enrollmentsService;
    private readonly eventEmitter;
    private readonly logger;
    constructor(submissionsRepo: ExamSubmissionsRepository, papersRepo: ExamPapersRepository, examsRepo: ExamsRepository, enrollmentsService: EnrollmentsService, eventEmitter: EventEmitter2);
    process(job: Job<{
        submissionId: string;
    }>): Promise<any>;
    private handleGrading;
}
