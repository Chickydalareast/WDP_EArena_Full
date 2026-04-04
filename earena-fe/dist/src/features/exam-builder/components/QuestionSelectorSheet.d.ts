interface QuestionSelectorSheetProps {
    paperId: string;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    existingQuestionIds: string[];
}
export declare function QuestionSelectorSheet({ paperId, isOpen, onOpenChange, existingQuestionIds }: QuestionSelectorSheetProps): any;
export {};
