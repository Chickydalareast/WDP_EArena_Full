export declare const useStudyTree: (courseId: string) => any;
export declare const useLessonContent: (courseId: string, lessonId: string | null) => any;
export declare const useMarkLessonCompleted: (courseId: string) => any;
export declare const useRefreshLessonToken: () => {
    refreshToken: (courseId: string, lessonId: string) => Promise<void>;
};
