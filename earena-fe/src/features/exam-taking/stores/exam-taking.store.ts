import { create } from 'zustand';

interface ExamTakingState {
  submissionId: string | null;
  courseId: string | null;
  lessonId: string | null;
  answers: Record<string, string | null>;

  initExamSession: (
    submissionId: string,
    context: { courseId: string; lessonId: string },
    questions: Array<{ originalQuestionId: string; selectedAnswerId: string | null }>
  ) => void;
  selectAnswer: (questionId: string, answerId: string | null) => void;
  clearSession: () => void;
}

export const useExamTakingStore = create<ExamTakingState>()((set) => ({
  submissionId: null,
  courseId: null,
  lessonId: null,
  answers: {},

  initExamSession: (submissionId, context, questions = []) => {
    const hydratedAnswers = questions.reduce((acc, curr) => {
      if (curr.selectedAnswerId) {
        acc[curr.originalQuestionId] = curr.selectedAnswerId;
      }
      return acc;
    }, {} as Record<string, string | null>);

    set({
      submissionId,
      courseId: context.courseId,
      lessonId: context.lessonId,
      answers: hydratedAnswers,
    });
  },

  selectAnswer: (questionId, answerId) => {
    set((state) => ({
      answers: { ...state.answers, [questionId]: answerId },
    }));
  },

  clearSession: () => {
    set({ submissionId: null, courseId: null, lessonId: null, answers: {} });
  },
}));