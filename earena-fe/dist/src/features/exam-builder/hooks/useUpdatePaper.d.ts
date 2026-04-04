import { UpdatePaperDTO } from '../types/exam.schema';
export type OptimisticUpdatePaperDTO = UpdatePaperDTO & {
    questionData?: any;
};
export declare const useUpdatePaper: (paperId: string | null) => any;
