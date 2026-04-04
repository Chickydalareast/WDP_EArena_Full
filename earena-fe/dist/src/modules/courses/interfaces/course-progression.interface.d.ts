export interface ProgressionCheckPayload {
    userId: string;
    courseId: string;
    currentLessonId: string;
    currentSectionOrder: number;
    currentLessonOrder: number;
    progressionMode: string;
}
export interface PreviousLessonContext {
    id: string;
    isCompleted: boolean;
}
