import { PopulatedQuestion, AnswerKey } from '../lib/hydration-utils';
interface EditQuestionSheetProps {
    question: PopulatedQuestion | null;
    answerKeys?: AnswerKey[];
    paperId?: string;
    mode?: 'EXAM' | 'BANK';
    onClose: () => void;
}
export declare function EditQuestionSheet({ question, answerKeys, paperId, mode, onClose }: EditQuestionSheetProps): any;
export {};
