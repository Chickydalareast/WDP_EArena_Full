import { FolderNode } from '@/features/exam-builder/hooks/useFolders';
import { FlatTopic } from '@/features/exam-builder/hooks/useTopics';
interface DynamicQuizBuilderProps {
    folders: FolderNode[];
    topics: FlatTopic[];
    activeFilters: Record<string, unknown> | unknown;
    disabled: boolean;
}
export declare function DynamicQuizBuilder({ folders, topics, activeFilters, disabled }: DynamicQuizBuilderProps): any;
export {};
