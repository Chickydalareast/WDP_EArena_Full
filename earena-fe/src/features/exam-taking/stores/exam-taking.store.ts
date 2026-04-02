import { create } from 'zustand';

interface ExamTakingState {
  submissionId: string | null;
  courseId: string | null;
  lessonId: string | null;
  paperId: string | null;
  answers: Record<string, string | null>;

  initExamSession: (
    submissionId: string,
    paperId: string,
    context: { courseId: string; lessonId: string },
    savedAnswers?: Array<{ questionId: string, selectedAnswerId: string }>
  ) => void;
  selectAnswer: (questionId: string, answerId: string | null) => void;
  clearSession: () => void;
}

export const useExamTakingStore = create<ExamTakingState>()((set) => ({
  submissionId: null,
  courseId: null,
  lessonId: null,
  paperId: null,
  answers: {},

  initExamSession: (submissionId, paperId, context, savedAnswers = []) => {
    const hydratedAnswers = savedAnswers.reduce((acc, curr) => {
      acc[curr.questionId] = curr.selectedAnswerId;
      return acc;
    }, {} as Record<string, string | null>);

    set({
      submissionId,
      courseId: context.courseId,
      lessonId: context.lessonId,
      paperId,
      answers: hydratedAnswers
    });
  },

  selectAnswer: (questionId, answerId) => {
    set((state) => ({
      answers: { ...state.answers, [questionId]: answerId },
    }));
  },

  clearSession: () => {
    set({ submissionId: null, courseId: null, lessonId: null, paperId: null, answers: {} });
  },
}));