export enum ProgressEventPattern {
    LESSON_COMPLETED = 'learning.lesson.completed',

    COURSE_MILESTONE_REACHED = 'learning.course.milestone.reached',
}

export interface LessonCompletedEventPayload {
    userId: string;
    courseId: string;
    lessonId: string;
    isFirstCompletion: boolean;
}

export interface CourseMilestoneEventPayload {
    userId: string;
    courseId: string;
    milestoneType: 'FIRST_3_LESSONS' | 'PERCENT_20' | 'COMPLETED';
}