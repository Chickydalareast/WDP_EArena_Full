import { FolderNode } from '../hooks/useFolders';
interface TreeSelectMultiProps {
    data: FolderNode[];
    selectedIds: string[];
    onChange: (selectedIds: string[]) => void;
    disabled?: boolean;
    availableIds?: string[];
}
export declare function TreeSelectMulti({ data, selectedIds, onChange, disabled, availableIds }: TreeSelectMultiProps): any;
export {};
