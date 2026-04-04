export declare const useAddBulkManual: (paperId: string) => any;
export declare const useDeleteQuestion: (paperId: string) => any;
export interface MutationContext {
    paperId?: string;
    isBankMode?: boolean;
}
export declare const useUpdateSingleQuestion: (context?: MutationContext) => any;
export declare const useUpdatePassageQuestion: (context?: MutationContext) => any;
