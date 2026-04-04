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
exports.BulkMoveModal = BulkMoveModal;
const react_1 = __importStar(require("react"));
const dialog_1 = require("@/shared/components/ui/dialog");
const button_1 = require("@/shared/components/ui/button");
const lucide_react_1 = require("lucide-react");
const useBankQueries_1 = require("../hooks/useBankQueries");
const question_bank_store_1 = require("../stores/question-bank.store");
const utils_1 = require("@/shared/lib/utils");
const sonner_1 = require("sonner");
function BulkMoveModal({ isOpen, onClose }) {
    const { data: treeData, isLoading: isTreeLoading } = (0, useBankQueries_1.useFolderTree)();
    const { mutate: bulkMove, isPending: isMoving } = (0, useBankQueries_1.useBulkMoveQuestions)();
    const selectedQuestionIds = (0, question_bank_store_1.useQuestionBankStore)(state => state.selectedQuestionIds);
    const clearSelection = (0, question_bank_store_1.useQuestionBankStore)(state => state.clearQuestionSelection);
    const [destFolderId, setDestFolderId] = (0, react_1.useState)(null);
    const [localExpanded, setLocalExpanded] = (0, react_1.useState)([]);
    (0, react_1.useEffect)(() => {
        if (isOpen)
            setDestFolderId(null);
    }, [isOpen]);
    const handleToggle = (id, e) => {
        e.stopPropagation();
        setLocalExpanded(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };
    const handleConfirm = () => {
        if (!destFolderId)
            return sonner_1.toast.error('Vui lòng chọn thư mục đích');
        bulkMove({ questionIds: selectedQuestionIds, destFolderId }, {
            onSuccess: () => {
                clearSelection();
                onClose();
            }
        });
    };
    const renderMiniTree = (nodes, level = 0) => {
        return nodes.map(node => {
            const isExpanded = localExpanded.includes(node._id);
            const isSelected = destFolderId === node._id;
            const hasChildren = node.children && node.children.length > 0;
            return (<div key={node._id} className="w-full">
                    <div onClick={() => setDestFolderId(node._id)} className={(0, utils_1.cn)("flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer transition-colors mt-0.5 text-sm", isSelected ? "bg-blue-100 text-blue-700 font-bold" : "hover:bg-slate-100 text-slate-700")} style={{ paddingLeft: `${level * 16 + 8}px` }}>
                        <div onClick={(e) => handleToggle(node._id, e)} className={(0, utils_1.cn)("w-4 h-4 flex items-center justify-center", !hasChildren && "invisible")}>
                            {isExpanded ? <lucide_react_1.ChevronDown className="w-3 h-3 text-slate-500"/> : <lucide_react_1.ChevronRight className="w-3 h-3 text-slate-500"/>}
                        </div>
                        <lucide_react_1.FolderOpen className={(0, utils_1.cn)("w-4 h-4", isSelected ? "text-blue-600" : "text-slate-400")}/>
                        <span className="truncate">{node.name}</span>
                    </div>
                    {isExpanded && hasChildren && renderMiniTree(node.children, level + 1)}
                </div>);
        });
    };
    return (<dialog_1.Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <dialog_1.DialogContent className="max-w-md">
                <dialog_1.DialogHeader>
                    <dialog_1.DialogTitle>Di chuyển {selectedQuestionIds.length} câu hỏi</dialog_1.DialogTitle>
                    <dialog_1.DialogDescription>Chọn thư mục đích để chuyển các câu hỏi này tới.</dialog_1.DialogDescription>
                </dialog_1.DialogHeader>

                <div className="flex flex-col gap-3 min-h-[300px] max-h-[500px] overflow-hidden">
                    
                    <div className="flex-1 overflow-y-auto border rounded-lg p-2 bg-slate-50">
                        {isTreeLoading ? (<div className="flex justify-center items-center h-full text-slate-400">
                                <lucide_react_1.Loader2 className="w-6 h-6 animate-spin"/>
                            </div>) : treeData && treeData.length > 0 ? (renderMiniTree(treeData)) : (<div className="text-center p-4 text-sm text-slate-500">Không có thư mục nào</div>)}
                    </div>
                </div>

                <dialog_1.DialogFooter>
                    <button_1.Button variant="ghost" onClick={onClose} disabled={isMoving}>Hủy</button_1.Button>
                    <button_1.Button onClick={handleConfirm} disabled={isMoving || !destFolderId}>
                        {isMoving && <lucide_react_1.Loader2 className="w-4 h-4 mr-2 animate-spin"/>} Xác nhận chuyển
                    </button_1.Button>
                </dialog_1.DialogFooter>
            </dialog_1.DialogContent>
        </dialog_1.Dialog>);
}
//# sourceMappingURL=BulkMoveModal.js.map