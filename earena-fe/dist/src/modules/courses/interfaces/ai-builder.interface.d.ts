export interface AiDocumentFile {
    originalName: string;
    mimeType: string;
    size: number;
    filePath: string;
}
export interface AiCourseBuilderPayload {
    courseId: string;
    teacherId: string;
    files: AiDocumentFile[];
    targetSectionCount?: number;
    additionalInstructions?: string;
}
export interface AiGeneratedLesson {
    lesson_title: string;
    content: string;
}
export interface AiGeneratedSection {
    module_title: string;
    brief_description: string;
    lessons: AiGeneratedLesson[];
}
export interface AiCurriculumResponse {
    curriculum: AiGeneratedSection[];
}
