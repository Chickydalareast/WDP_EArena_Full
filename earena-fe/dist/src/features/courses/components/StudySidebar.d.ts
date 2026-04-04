import { SectionPreview } from '../types/course.schema';
interface StudySidebarProps {
    sections: SectionPreview[];
    currentLessonId: string | null;
    treeStatus?: 'ACTIVE' | 'EXPIRED' | 'BANNED' | string;
    progressionMode?: 'FREE' | 'STRICT_LINEAR';
}
export declare function StudySidebar({ sections, currentLessonId, treeStatus, progressionMode }: StudySidebarProps): any;
export {};
