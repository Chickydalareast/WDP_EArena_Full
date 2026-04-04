export interface FolderNode {
    _id?: string;
    id?: string;
    name: string;
    children?: FolderNode[];
}
export interface FolderResponse {
    items?: FolderNode[];
    data?: FolderNode[];
}
export declare const useFoldersList: () => any;
export declare const useRawFoldersTree: () => any;
