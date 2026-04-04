import { LessonPreview } from '../../types/course.schema';
interface EditLessonModalProps {
    courseId: string;
    lessonData: {
        lesson: LessonPreview;
        sectionId: string;
    } | null;
    onClose: () => void;
}
export declare function EditLessonModal({ courseId, lessonData, onClose }: EditLessonModalProps): any;
export {};
