import { QuestionItemDTO } from '../types/exam.schema';
export interface BulkManualQuestionFormProps {
    mode?: 'QUICK_EXAM' | 'QUESTION_BANK';
    onSave: (data: QuestionItemDTO[]) => void;
    isPending?: boolean;
    onCancel: () => void;
}
export declare function BulkManualQuestionForm({ mode, onSave, isPending, onCancel }: BulkManualQuestionFormProps): any;
