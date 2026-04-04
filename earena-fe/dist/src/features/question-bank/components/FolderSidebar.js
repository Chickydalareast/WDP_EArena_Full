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
exports.FolderSidebar = FolderSidebar;
const react_1 = __importStar(require("react"));
const useBankQueries_1 = require("../hooks/useBankQueries");
const FolderNodeItem_1 = require("./FolderNodeItem");
const FolderActionModals_1 = require("./FolderActionModals");
const skeleton_1 = require("@/shared/components/ui/skeleton");
const button_1 = require("@/shared/components/ui/button");
const lucide_react_1 = require("lucide-react");
function FolderSidebar() {
    const { data: treeData, isLoading, isError } = (0, useBankQueries_1.useFolderTree)();
    const [isFormModalOpen, setIsFormModalOpen] = (0, react_1.useState)(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = (0, react_1.useState)(false);
    const [targetFolder, setTargetFolder] = (0, react_1.useState)(null);
    const [parentIdForNew, setParentIdForNew] = (0, react_1.useState)(null);
    const handleAction = (action, node) => {
        setTargetFolder(node);
        if (action === 'CREATE_CHILD') {
            setParentIdForNew(node._id);
            setTargetFolder(null);
            setIsFormModalOpen(true);
        }
        else if (action === 'EDIT') {
            setIsFormModalOpen(true);
        }
        else if (action === 'DELETE') {
            setIsDeleteModalOpen(true);
        }
    };
    const handleCreateRoot = () => {
        setTargetFolder(null);
        setParentIdForNew(null);
        setIsFormModalOpen(true);
    };
    return (<div className="w-full h-full flex flex-col bg-slate-50/50 border-r border-slate-200">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between shrink-0">
                <h2 className="font-bold text-slate-800 tracking-tight text-sm uppercase">Cây Thư Mục</h2>
                <button_1.Button variant="ghost" size="icon" onClick={handleCreateRoot} className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" title="Tạo thư mục gốc">
                    <lucide_react_1.FolderPlus className="w-5 h-5"/>
                </button_1.Button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-200">
                {isLoading ? (<div className="space-y-2 py-2">
                        {[1, 2, 3, 4, 5].map((i) => (<div key={i} className="flex items-center gap-2 px-2"><skeleton_1.Skeleton className="w-4 h-4 rounded-full shrink-0"/><skeleton_1.Skeleton className="h-5 w-full rounded"/></div>))}
                    </div>) : isError ? (<div className="p-4 text-center text-red-500 text-sm flex flex-col items-center">
                        <lucide_react_1.ServerCrash className="w-8 h-8 mb-2 opacity-50"/> Không thể tải thư mục
                    </div>) : treeData && treeData.length > 0 ? (<div className="pb-8">
                        {treeData.map((node) => (<FolderNodeItem_1.FolderNodeItem key={node._id} node={node} level={0} onAction={handleAction}/>))}
                    </div>) : (<div className="p-6 text-center text-slate-400 text-sm">
                        Chưa có thư mục nào. Nhấn biểu tượng <strong>+</strong> để tạo.
                    </div>)}
            </div>

            
            <FolderActionModals_1.FolderFormModal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} folderToEdit={targetFolder} parentIdForNew={parentIdForNew}/>
            <FolderActionModals_1.DeleteFolderConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} folderToDelete={targetFolder}/>
        </div>);
}
//# sourceMappingURL=FolderSidebar.js.map