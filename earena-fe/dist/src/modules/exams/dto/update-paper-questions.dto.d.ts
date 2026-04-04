export declare enum PaperUpdateAction {
    ADD = "ADD",
    REMOVE = "REMOVE",
    REORDER = "REORDER"
}
export declare class UpdatePaperQuestionsDto {
    action: PaperUpdateAction;
    questionId?: string;
    questionIds?: string[];
}
