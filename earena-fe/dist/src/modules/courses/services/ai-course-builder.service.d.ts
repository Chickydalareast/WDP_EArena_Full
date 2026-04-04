import { AiCourseBuilderPayload } from '../interfaces/ai-builder.interface';
import { CoursesRepository } from '../courses.repository';
import { CurriculumService } from './curriculum.service';
import { AiService } from '../../ai/ai.service';
export declare class AiCourseBuilderService {
    private readonly coursesRepo;
    private readonly curriculumService;
    private readonly aiService;
    private readonly logger;
    constructor(coursesRepo: CoursesRepository, curriculumService: CurriculumService, aiService: AiService);
    generateCurriculum(payload: AiCourseBuilderPayload): Promise<{
        status: string;
        sectionsGenerated: number;
        message: string;
    }>;
    private injectCurriculumTree;
    private extractJsonFromAiResponse;
    private buildInstructionalDesignerPrompt;
    private cleanupTempFiles;
}
