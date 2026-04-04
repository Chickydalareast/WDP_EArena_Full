import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ExamPapersRepository } from './exam-papers.repository';
import { ExamsRepository } from './exams.repository';
import { QuestionsRepository } from '../questions/questions.repository';
import { QuestionSyncJobData } from '../questions/interfaces/question.interface';
export declare class QuestionSyncProcessor extends WorkerHost {
    private readonly examPapersRepo;
    private readonly examsRepo;
    private readonly questionsRepo;
    private readonly logger;
    constructor(examPapersRepo: ExamPapersRepository, examsRepo: ExamsRepository, questionsRepo: QuestionsRepository);
    process(job: Job<QuestionSyncJobData>): Promise<void>;
}
