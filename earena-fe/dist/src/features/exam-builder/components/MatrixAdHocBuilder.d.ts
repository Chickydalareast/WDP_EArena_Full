import { FolderNode } from '../hooks/useFolders';
import { FlatTopic } from '../hooks/useTopics';
interface MatrixAdHocBuilderProps {
    paperId: string;
    folders: FolderNode[];
    topics: FlatTopic[];
    disabled: boolean;
}
export declare const MatrixAdHocBuilder: ({ paperId, folders, topics, disabled }: MatrixAdHocBuilderProps) => any;
export {};
