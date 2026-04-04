export interface StartExamPayload {
  studentId: string;
  courseId: string;
  lessonId: string;
}

export interface GetStudentHistoryPayload {
  studentId: string;
  page?: number;
  limit?: number;
  courseId?: string;
  lessonId?: string;
}

export interface GetStudentHistoryOverviewPayload {
  studentId: string;
  page: number;
  limit: number;
  courseId?: string;
}

export interface GetLessonAttemptsPayload {
  studentId: string;
  lessonId: string;
  page: number;
  limit: number;
}

export interface GetExamPaperPayload {
  submissionId: string;
  studentId: string;
}