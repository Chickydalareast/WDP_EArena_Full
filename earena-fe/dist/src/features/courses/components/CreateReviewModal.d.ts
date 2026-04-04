interface CreateReviewModalProps {
    courseId: string;
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
}
export declare const CreateReviewModal: ({ courseId, isOpen, onClose, title, message }: CreateReviewModalProps) => any;
export {};
