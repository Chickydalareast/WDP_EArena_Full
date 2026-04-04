import * as z from 'zod';
declare const ManualQuestionSchema: any;
export type OmitFolderIdDTO = z.infer<typeof ManualQuestionSchema>;
interface ManualQuestionFormProps {
    onSave: (data: OmitFolderIdDTO) => void;
    isPending?: boolean;
    onCancel: () => void;
}
export declare function ManualQuestionForm({ onSave, isPending, onCancel }: ManualQuestionFormProps): any;
export {};
