import { SectionPreview, LessonPreview } from '../../types/course.schema';
interface BuilderSectionProps {
    section: SectionPreview;
    isTotalLocked: boolean;
    isStructureLocked: boolean;
    isModeLocked: boolean;
    onAddLesson: (sectionId: string, type: 'STATIC' | 'DYNAMIC') => void;
    onEditSection: (section: SectionPreview) => void;
    onDeleteTrigger: (type: 'SECTION' | 'LESSON', id: string, title: string, parentId?: string) => void;
    onEditLesson: (lesson: LessonPreview) => void;
}
export declare function BuilderSection({ section, isTotalLocked, isStructureLocked, isModeLocked, onAddLesson, onEditSection, onDeleteTrigger, onEditLesson }: BuilderSectionProps): any;
export {};
