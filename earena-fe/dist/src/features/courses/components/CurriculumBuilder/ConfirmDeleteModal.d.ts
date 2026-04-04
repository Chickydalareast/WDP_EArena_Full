interface ConfirmDeleteModalProps {
    courseId: string;
    isOpen: boolean;
    onClose: () => void;
    config: {
        type: 'SECTION' | 'LESSON';
        id: string;
        name: string;
        sectionId?: string;
    } | null;
}
export declare function ConfirmDeleteModal({ courseId, isOpen, onClose, config }: ConfirmDeleteModalProps): any;
export {};
