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
exports.SmartOrganizeModal = SmartOrganizeModal;
const react_1 = __importStar(require("react"));
const react_hook_form_1 = require("react-hook-form");
const rhf_zod_resolver_1 = require("@/shared/lib/rhf-zod-resolver");
const lucide_react_1 = require("lucide-react");
const question_bank_store_1 = require("../stores/question-bank.store");
const useBankMutations_1 = require("../hooks/useBankMutations");
const useBankQueries_1 = require("../hooks/useBankQueries");
const question_bank_schema_1 = require("../types/question-bank.schema");
const tree_utils_1 = require("../lib/tree-utils");
const VirtualNodeItem_1 = require("./VirtualNodeItem");
const dialog_1 = require("@/shared/components/ui/dialog");
const form_1 = require("@/shared/components/ui/form");
const select_1 = require("@/shared/components/ui/select");
const button_1 = require("@/shared/components/ui/button");
const ROOT_FOLDER_VALUE = 'ROOT_FOLDER_NONE';
const flattenFolders = (nodes, level = 0) => {
    let result = [];
    nodes.forEach(node => {
        result.push({ id: node._id, name: node.name, level });
        if (node.children && node.children.length > 0) {
            result = result.concat(flattenFolders(node.children, level + 1));
        }
    });
    return result;
};
function SmartOrganizeModal({ isOpen, onClose }) {
    const selectedIds = (0, question_bank_store_1.useQuestionBankStore)(state => state.selectedQuestionIds);
    const clearSelection = (0, question_bank_store_1.useQuestionBankStore)(state => state.clearQuestionSelection);
    const { data: treeData } = (0, useBankQueries_1.useFolderTree)();
    const flatExistingFolders = (0, react_1.useMemo)(() => treeData ? flattenFolders(treeData) : [], [treeData]);
    const form = (0, react_hook_form_1.useForm)({
        resolver: (0, rhf_zod_resolver_1.rhfZodResolver)(question_bank_schema_1.OrganizeQuestionsPayloadSchema),
        defaultValues: {
            questionIds: [],
            strategy: 'TOPIC_AND_DIFFICULTY',
            baseFolderId: ROOT_FOLDER_VALUE
        },
    });
    const previewMutation = (0, useBankMutations_1.usePreviewOrganize)();
    const executeMutation = (0, useBankMutations_1.useExecuteOrganize)();
    (0, react_1.useEffect)(() => {
        if (isOpen) {
            form.reset({
                questionIds: selectedIds,
                strategy: 'TOPIC_AND_DIFFICULTY',
                baseFolderId: ROOT_FOLDER_VALUE
            });
            previewMutation.reset();
            executeMutation.reset();
        }
    }, [isOpen]);
    const virtualTree = (0, react_1.useMemo)(() => {
        if (!previewMutation.data)
            return [];
        return (0, tree_utils_1.buildVirtualTree)(previewMutation.data.virtualTree, previewMutation.data.mappings);
    }, [previewMutation.data]);
    const handleExecute = () => {
        const data = form.getValues();
        const payload = {
            ...data,
            baseFolderId: data.baseFolderId === ROOT_FOLDER_VALUE ? undefined : data.baseFolderId
        };
        executeMutation.mutate(payload, {
            onSuccess: () => {
                clearSelection();
                onClose();
            }
        });
    };
    return (<dialog_1.Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <dialog_1.DialogContent className="sm:max-w-[650px] max-h-[85vh] flex flex-col">
                <dialog_1.DialogHeader className="shrink-0">
                    <dialog_1.DialogTitle className="flex items-center gap-2 text-xl">
                        {!previewMutation.data ? (<><lucide_react_1.Target className="w-5 h-5 text-primary"/> Cấu hình Phân luồng Tự động</>) : (<><lucide_react_1.Map className="w-5 h-5 text-primary"/> Kiểm tra Bản đồ Thư mục ảo</>)}
                    </dialog_1.DialogTitle>
                </dialog_1.DialogHeader>

                <div className="flex-1 overflow-y-auto pr-2 py-4">
                    {!previewMutation.data && (<form_1.Form {...form}>
                            <form id="organize-form" onSubmit={form.handleSubmit((data) => {
                const payload = {
                    ...data,
                    baseFolderId: data.baseFolderId === ROOT_FOLDER_VALUE ? undefined : data.baseFolderId
                };
                previewMutation.mutate(payload);
            })} className="space-y-5">
                                <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg text-sm text-slate-700">
                                    Hệ thống sẽ dựa vào <strong>Chuyên đề</strong> và <strong>Độ khó</strong> của {selectedIds.length} câu hỏi đã chọn để tự động gom nhóm và sinh ra các thư mục tương ứng.
                                </div>

                                <form_1.FormField control={form.control} name="strategy" render={({ field }) => (<form_1.FormItem>
                                            <form_1.FormLabel className="font-semibold text-slate-800">Chiến lược sắp xếp <span className="text-red-500">*</span></form_1.FormLabel>
                                            <select_1.Select disabled={previewMutation.isPending} onValueChange={field.onChange} defaultValue={field.value}>
                                                <form_1.FormControl>
                                                    <select_1.SelectTrigger>
                                                        <select_1.SelectValue placeholder="Chọn chiến lược"/>
                                                    </select_1.SelectTrigger>
                                                </form_1.FormControl>
                                                <select_1.SelectContent>
                                                    <select_1.SelectItem value="TOPIC_AND_DIFFICULTY">Gom theo Chuyên đề {'>'} Phân tách Mức độ (Khuyên dùng)</select_1.SelectItem>
                                                    <select_1.SelectItem value="TOPIC_STRICT">Chỉ gom theo Chuyên đề chung</select_1.SelectItem>
                                                    <select_1.SelectItem value="FLAT_DIFFICULTY">Chỉ chia theo Mức độ (Không phân Chuyên đề)</select_1.SelectItem>
                                                </select_1.SelectContent>
                                            </select_1.Select>
                                            <form_1.FormMessage />
                                        </form_1.FormItem>)}/>

                                <form_1.FormField control={form.control} name="baseFolderId" render={({ field }) => (<form_1.FormItem>
                                            <form_1.FormLabel className="font-semibold text-slate-800">Thư mục gốc (Tùy chọn)</form_1.FormLabel>
                                            <select_1.Select disabled={previewMutation.isPending} onValueChange={field.onChange} value={field.value}>
                                                <form_1.FormControl>
                                                    <select_1.SelectTrigger>
                                                        <select_1.SelectValue placeholder="-- Đặt tại ngoài cùng --"/>
                                                    </select_1.SelectTrigger>
                                                </form_1.FormControl>
                                                <select_1.SelectContent className="max-h-[250px]">
                                                    <select_1.SelectItem value={ROOT_FOLDER_VALUE}>-- Đặt tại ngoài cùng --</select_1.SelectItem>
                                                    {flatExistingFolders.map(folder => (<select_1.SelectItem key={folder.id} value={folder.id}>
                                                            
                                                            {'—'.repeat(folder.level)} {folder.level > 0 ? ' ' : ''}{folder.name}
                                                        </select_1.SelectItem>))}
                                                </select_1.SelectContent>
                                            </select_1.Select>
                                            <div className="text-xs text-slate-500 mt-1">Nếu chọn, toàn bộ thư mục tự động sẽ được nhét vào bên trong thư mục này.</div>
                                            <form_1.FormMessage />
                                        </form_1.FormItem>)}/>
                            </form>
                        </form_1.Form>)}

                    {previewMutation.data && (<div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
                            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Tổng số câu phân loại</p>
                                    <p className="text-2xl font-black text-slate-800">{previewMutation.data.stats.totalQuestions}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-primary uppercase font-bold tracking-wider mb-1">Thư mục sẽ tạo mới</p>
                                    <p className="text-2xl font-black text-primary">{previewMutation.data.stats.newFoldersToCreate}</p>
                                </div>
                            </div>

                            {previewMutation.data.stats.unclassifiedQuestions > 0 && (<div className="flex gap-3 bg-red-50 border border-red-200 p-4 rounded-lg text-red-800">
                                    <lucide_react_1.AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600"/>
                                    <div>
                                        <h4 className="font-bold text-sm">Chú ý: Có câu hỏi chưa gán thuộc tính</h4>
                                        <p className="text-xs mt-1">
                                            Có <strong>{previewMutation.data.stats.unclassifiedQuestions}</strong> câu hỏi chưa được chọn Chuyên đề hoặc Mức độ. Hệ thống sẽ bơ đi và để lại vị trí cũ.
                                        </p>
                                    </div>
                                </div>)}

                            <div>
                                <h3 className="text-sm font-bold text-slate-800 mb-2">Bản đồ mô phỏng:</h3>
                                <div className="border border-slate-200 rounded-lg bg-white p-3 min-h-[250px] shadow-inner">
                                    {virtualTree.length > 0 ? (virtualTree.map(node => <VirtualNodeItem_1.VirtualNodeItem key={node._id} node={node}/>)) : (<div className="text-center text-slate-400 py-10 text-sm">Không thể phân loại các câu hỏi này.</div>)}
                                </div>
                            </div>
                        </div>)}
                </div>

                <dialog_1.DialogFooter className="pt-4 border-t shrink-0">
                    {!previewMutation.data ? (<>
                            <button_1.Button variant="ghost" onClick={onClose}>Hủy bỏ</button_1.Button>
                            <button_1.Button form="organize-form" type="submit" disabled={previewMutation.isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                                {previewMutation.isPending ? <><lucide_react_1.Loader2 className="w-4 h-4 mr-2 animate-spin"/> Đang mô phỏng...</> : "Xem trước sơ đồ"}
                            </button_1.Button>
                        </>) : (<>
                            <button_1.Button variant="outline" onClick={() => previewMutation.reset()} disabled={executeMutation.isPending}>
                                Quay lại sửa
                            </button_1.Button>
                            <button_1.Button onClick={handleExecute} disabled={executeMutation.isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md">
                                {executeMutation.isPending ? <><lucide_react_1.Loader2 className="w-4 h-4 mr-2 animate-spin"/> Đang chốt hạ...</> : "Xác nhận & Ghi vào CSDL"}
                            </button_1.Button>
                        </>)}
                </dialog_1.DialogFooter>
            </dialog_1.DialogContent>
        </dialog_1.Dialog>);
}
//# sourceMappingURL=SmartOrganizeModal.js.map