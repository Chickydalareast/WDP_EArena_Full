import { LessonPreview } from '../types/course.schema';
interface FreePreviewModalProps {
    courseId: string;
    lesson: LessonPreview | null;
    isOpen: boolean;
    onClose: () => void;
}
export declare function FreePreviewModal({ courseId, lesson, isOpen, onClose }: FreePreviewModalProps): any;
export {};
