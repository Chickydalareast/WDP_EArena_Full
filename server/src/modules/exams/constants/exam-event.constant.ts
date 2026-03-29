export enum ExamEventPattern {
    EXAM_SUBMITTED = 'exam.submitted',
    EXAM_GRADED = 'exam.graded',
}

export interface ExamSubmittedEventPayload {
    submissionId: string;
    studentId: string;
}

export interface ExamGradedEventPayload {
    submissionId: string;
    studentId: string;
    courseId: string;
    lessonId: string;
    score: number;
}