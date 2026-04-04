import { NestedQuestionPreview } from '../../lib/quiz-utils';
interface QuizLivePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    questions: NestedQuestionPreview[];
    totalItems: number;
    totalActualQuestions: number;
}
export declare function QuizLivePreviewModal({ isOpen, onClose, questions, totalItems, totalActualQuestions }: QuizLivePreviewModalProps): any;
export {};
