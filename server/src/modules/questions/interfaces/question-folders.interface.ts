export interface CreateFolderPayload {
    name: string;
    description?: string;
    parentId?: string;
}

export interface UpdateFolderPayload {
    name?: string;
    description?: string;
    parentId?: string | null;
}