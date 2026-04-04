import { z } from 'zod';
export declare const ExamRuleSchema: any;
export type ExamRuleDTO = z.infer<typeof ExamRuleSchema>;
export declare const createSectionSchema: any;
export type CreateSectionDTO = z.infer<typeof createSectionSchema>;
export declare const createLessonSchema: any;
export type CreateLessonDTO = z.infer<typeof createLessonSchema>;
export declare const updateSectionSchema: any;
export type UpdateSectionDTO = z.infer<typeof updateSectionSchema>;
export declare const aiBuilderFormSchema: any;
export type AiBuilderFormDTO = z.infer<typeof aiBuilderFormSchema>;
export interface AiBuilderResponse {
    status: 'SUCCESS';
    sectionsGenerated: number;
    message: string;
}
export declare const DynamicConfigSchema: any;
export type DynamicConfigDTO = z.infer<typeof DynamicConfigSchema>;
export declare const updateLessonSchema: any;
export type UpdateLessonDTO = z.infer<typeof updateLessonSchema>;
export declare const CreateQuizLessonSchema: any;
export type CreateQuizLessonDTO = z.infer<typeof CreateQuizLessonSchema>;
export declare const UpdateQuizLessonSchema: any;
export type UpdateQuizLessonDTO = z.infer<typeof UpdateQuizLessonSchema>;
