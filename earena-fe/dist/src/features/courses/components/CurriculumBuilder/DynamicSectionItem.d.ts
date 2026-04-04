import { FolderNode } from '@/features/exam-builder/hooks/useFolders';
import { FlatTopic } from '@/features/exam-builder/hooks/useTopics';
interface DynamicSectionItemProps {
    sectionIndex: number;
    folders: FolderNode[];
    topics: FlatTopic[];
    activeFilters: any;
    disabled: boolean;
    onRemove: () => void;
    canRemove: boolean;
}
export declare function DynamicSectionItem({ sectionIndex, folders, topics, activeFilters, disabled, onRemove, canRemove }: DynamicSectionItemProps): any;
export {};
