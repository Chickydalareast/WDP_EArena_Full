import { GenerateAiCourseDto } from '../dto/ai-builder.dto';
import { AiCourseBuilderService } from '../services/ai-course-builder.service';
export declare class AiCourseBuilderController {
    private readonly aiCourseBuilderService;
    constructor(aiCourseBuilderService: AiCourseBuilderService);
    generateCourseContent(courseId: string, teacherId: string, dto: GenerateAiCourseDto, files: Express.Multer.File[]): Promise<{
        message: string;
        data: {
            status: string;
            sectionsGenerated: number;
            message: string;
        };
    }>;
}
