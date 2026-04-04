import { LessonPreview } from '../../types/course.schema';
interface BuilderLessonProps {
    lesson: LessonPreview;
    sectionId: string;
    isTotalLocked: boolean;
    isStructureLocked: boolean;
    onEdit: (lesson: LessonPreview) => void;
    onDelete: (type: 'LESSON', id: string, title: string, parentId: string) => void;
}
export declare function BuilderLesson({ lesson, sectionId, isTotalLocked, isStructureLocked, onEdit, onDelete, }: BuilderLessonProps): any;
export {};
