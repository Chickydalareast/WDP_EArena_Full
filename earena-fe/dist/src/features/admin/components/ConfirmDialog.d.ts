export declare function ConfirmDialog({ open, title, description, confirmText, cancelText, variant, onConfirm, onClose, }: {
    open: boolean;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'primary';
    onConfirm: () => void;
    onClose: () => void;
}): any;
