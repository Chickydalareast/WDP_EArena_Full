'use client';
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FolderFormModal = FolderFormModal;
exports.DeleteFolderConfirmModal = DeleteFolderConfirmModal;
const react_1 = __importStar(require("react"));
const react_hook_form_1 = require("react-hook-form");
const rhf_zod_resolver_1 = require("@/shared/lib/rhf-zod-resolver");
const question_bank_schema_1 = require("../types/question-bank.schema");
const useFolderMutations_1 = require("../hooks/useFolderMutations");
const button_1 = require("@/shared/components/ui/button");
const input_1 = require("@/shared/components/ui/input");
const textarea_1 = require("@/shared/components/ui/textarea");
const form_1 = require("@/shared/components/ui/form");
const dialog_1 = require("@/shared/components/ui/dialog");
const lucide_react_1 = require("lucide-react");
function FolderFormModal({ isOpen, onClose, folderToEdit, parentIdForNew }) {
    const { mutate: createFolder, isPending: isCreating } = (0, useFolderMutations_1.useCreateFolder)();
    const { mutate: updateFolder, isPending: isUpdating } = (0, useFolderMutations_1.useUpdateFolder)();
    const isEdit = !!folderToEdit;
    const form = (0, react_hook_form_1.useForm)({
        resolver: (0, rhf_zod_resolver_1.rhfZodResolver)(question_bank_schema_1.FolderPayloadSchema),
        defaultValues: { name: '', description: '', parentId: null },
    });
    (0, react_1.useEffect)(() => {
        if (isOpen) {
            if (isEdit) {
                form.reset({
                    name: folderToEdit.name,
                    description: folderToEdit.description || '',
                    parentId: folderToEdit.parentId || null,
                });
            }
            else {
                form.reset({ name: '', description: '', parentId: parentIdForNew || null });
            }
        }
    }, [isOpen, isEdit, folderToEdit, parentIdForNew, form]);
    const onSubmit = (data) => {
        if (isEdit) {
            updateFolder({ id: folderToEdit._id, data }, { onSuccess: onClose });
        }
        else {
            createFolder(data, { onSuccess: onClose });
        }
    };
    const isPending = isCreating || isUpdating;
    return (<dialog_1.Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <dialog_1.DialogContent>
                <dialog_1.DialogHeader>
                    <dialog_1.DialogTitle>{isEdit ? 'Chỉnh sửa thư mục' : 'Tạo thư mục mới'}</dialog_1.DialogTitle>
                </dialog_1.DialogHeader>
                <form_1.Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <form_1.FormField control={form.control} name="name" render={({ field }) => (<form_1.FormItem>
                                    <form_1.FormLabel>Tên thư mục <span className="text-red-500">*</span></form_1.FormLabel>
                                    <form_1.FormControl><input_1.Input placeholder="Ví dụ: Đề thi thử 2026..." {...field}/></form_1.FormControl>
                                    <form_1.FormMessage />
                                </form_1.FormItem>)}/>
                        <form_1.FormField control={form.control} name="description" render={({ field }) => (<form_1.FormItem>
                                    <form_1.FormLabel>Mô tả (Không bắt buộc)</form_1.FormLabel>
                                    <form_1.FormControl><textarea_1.Textarea placeholder="Ghi chú thêm về thư mục này..." {...field}/></form_1.FormControl>
                                    <form_1.FormMessage />
                                </form_1.FormItem>)}/>
                        <dialog_1.DialogFooter className="mt-6">
                            <button_1.Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>Hủy</button_1.Button>
                            <button_1.Button type="submit" disabled={isPending}>
                                {isPending && <lucide_react_1.Loader2 className="w-4 h-4 mr-2 animate-spin"/>}
                                {isEdit ? 'Lưu thay đổi' : 'Tạo mới'}
                            </button_1.Button>
                        </dialog_1.DialogFooter>
                    </form>
                </form_1.Form>
            </dialog_1.DialogContent>
        </dialog_1.Dialog>);
}
function DeleteFolderConfirmModal({ isOpen, onClose, folderToDelete }) {
    const { mutate: deleteFolder, isPending } = (0, useFolderMutations_1.useDeleteFolder)();
    const handleConfirm = () => {
        if (folderToDelete) {
            deleteFolder(folderToDelete._id, { onSuccess: onClose });
        }
    };
    return (<dialog_1.Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <dialog_1.DialogContent>
                <dialog_1.DialogHeader>
                    <dialog_1.DialogTitle className="text-red-600">Xóa thư mục?</dialog_1.DialogTitle>
                    <dialog_1.DialogDescription>
                        Bạn có chắc chắn muốn xóa thư mục <strong>{folderToDelete?.name}</strong> không? Hành động này không thể hoàn tác.
                        <br className="mb-2"/>
                        <span className="text-xs text-slate-500">*Lưu ý: Bạn chỉ có thể xóa thư mục rỗng.</span>
                    </dialog_1.DialogDescription>
                </dialog_1.DialogHeader>
                <dialog_1.DialogFooter>
                    <button_1.Button variant="ghost" onClick={onClose} disabled={isPending}>Hủy</button_1.Button>
                    <button_1.Button variant="destructive" onClick={handleConfirm} disabled={isPending}>
                        {isPending && <lucide_react_1.Loader2 className="w-4 h-4 mr-2 animate-spin"/>} Xóa vĩnh viễn
                    </button_1.Button>
                </dialog_1.DialogFooter>
            </dialog_1.DialogContent>
        </dialog_1.Dialog>);
}
//# sourceMappingURL=FolderActionModals.js.map