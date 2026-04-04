import { FolderNode } from '../hooks/useFolders';
import { FlatTopic } from '../hooks/useTopics';
interface AdHocRuleItemProps {
    paperId: string;
    sectionIndex: number;
    ruleIndex: number;
    folders: FolderNode[];
    topics: FlatTopic[];
    disabled: boolean;
    onRemove: () => void;
    canRemove: boolean;
}
export default function AdHocRuleItem({ paperId, sectionIndex, ruleIndex, folders, topics, disabled, onRemove, canRemove }: AdHocRuleItemProps): any;
export {};
