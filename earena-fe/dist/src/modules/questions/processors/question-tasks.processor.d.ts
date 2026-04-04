import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AutoTagJobPayload } from '../interfaces/question-jobs.interface';
import { QuestionsRepository } from '../questions.repository';
import { AiService } from '../../ai/ai.service';
import { KnowledgeTopicsService } from '../../taxonomy/knowledge-topics.service';
export declare class QuestionTasksProcessor extends WorkerHost {
    private readonly questionsRepo;
    private readonly aiService;
    private readonly topicsService;
    private readonly configService;
    private readonly eventEmitter;
    private readonly logger;
    private readonly CHUNK_SIZE;
    constructor(questionsRepo: QuestionsRepository, aiService: AiService, topicsService: KnowledgeTopicsService, configService: ConfigService, eventEmitter: EventEmitter2);
    process(job: Job<AutoTagJobPayload>): Promise<void>;
    private handleAutoTagging;
    private processChunk;
    private sanitizeAiOutput;
    private flattenTopicTree;
    private extractJsonFromAiResponse;
    private buildTaggerPrompt;
}
