interface ForceTakedownModalProps {
    courseId: string | null;
    courseTitle?: string;
    isOpen: boolean;
    onClose: () => void;
}
export declare function ForceTakedownModal({ courseId, courseTitle, isOpen, onClose }: ForceTakedownModalProps): any;
export {};
