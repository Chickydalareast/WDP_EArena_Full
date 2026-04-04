import { FolderNode } from '../types/question-bank.schema';
interface FolderModalProps {
    isOpen: boolean;
    onClose: () => void;
    folderToEdit?: FolderNode | null;
    parentIdForNew?: string | null;
}
export declare function FolderFormModal({ isOpen, onClose, folderToEdit, parentIdForNew }: FolderModalProps): any;
export declare function DeleteFolderConfirmModal({ isOpen, onClose, folderToDelete }: Omit<FolderModalProps, 'parentIdForNew' | 'folderToEdit'> & {
    folderToDelete?: FolderNode | null;
}): any;
export {};
