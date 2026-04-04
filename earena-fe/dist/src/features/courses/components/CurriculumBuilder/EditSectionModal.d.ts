import { SectionPreview } from '../../types/course.schema';
interface EditSectionModalProps {
    courseId: string;
    section: SectionPreview | null;
    onClose: () => void;
}
export declare function EditSectionModal({ courseId, section, onClose }: EditSectionModalProps): any;
export {};
