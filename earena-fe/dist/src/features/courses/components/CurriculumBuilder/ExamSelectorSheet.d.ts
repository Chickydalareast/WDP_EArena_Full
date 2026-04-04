interface ExamSelectorSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectExam: (examId: string, examTitle: string) => void;
    currentExamId?: string;
}
export declare function ExamSelectorSheet({ isOpen, onClose, onSelectExam, currentExamId }: ExamSelectorSheetProps): any;
export {};
