interface StudentExamEngineProps {
    courseId: string;
    lessonId: string;
    onComplete: (submissionId: string) => void;
}
export declare function StudentExamEngine({ courseId, lessonId, onComplete }: StudentExamEngineProps): any;
export {};
