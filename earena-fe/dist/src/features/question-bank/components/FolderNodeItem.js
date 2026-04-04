'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FolderNodeItem = void 0;
const react_1 = __importDefault(require("react"));
const question_bank_store_1 = require("../stores/question-bank.store");
const utils_1 = require("@/shared/lib/utils");
const lucide_react_1 = require("lucide-react");
const dropdown_menu_1 = require("@/shared/components/ui/dropdown-menu");
exports.FolderNodeItem = react_1.default.memo(({ node, level = 0, onAction }) => {
    const selectedFolderId = (0, question_bank_store_1.useQuestionBankStore)(state => state.selectedFolderId);
    const setSelectedFolderId = (0, question_bank_store_1.useQuestionBankStore)(state => state.setSelectedFolderId);
    const expandedFolderIds = (0, question_bank_store_1.useQuestionBankStore)(state => state.expandedFolderIds);
    const toggleFolderExpand = (0, question_bank_store_1.useQuestionBankStore)(state => state.toggleFolderExpand);
    const isExpanded = expandedFolderIds.includes(node._id);
    const isSelected = selectedFolderId === node._id;
    const hasChildren = node.children && node.children.length > 0;
    const handleToggle = (e) => {
        e.stopPropagation();
        toggleFolderExpand(node._id);
    };
    const handleSelect = () => {
        setSelectedFolderId(node._id);
    };
    return (<div className="w-full">
            <div className={(0, utils_1.cn)("group flex items-center justify-between py-1.5 px-2 rounded-lg cursor-pointer transition-colors mt-0.5 text-sm font-medium", isSelected ? "bg-primary/10 text-primary" : "text-slate-700 hover:bg-slate-100")} style={{ paddingLeft: `${level * 16 + 8}px` }} onClick={handleSelect}>
                <div className="flex items-center gap-1.5 truncate flex-1">
                    <div className={(0, utils_1.cn)("w-5 h-5 flex items-center justify-center rounded hover:bg-slate-200 transition-colors", !hasChildren && "invisible")} onClick={handleToggle}>
                        {isExpanded ? <lucide_react_1.ChevronDown className="w-4 h-4 text-slate-500"/> : <lucide_react_1.ChevronRight className="w-4 h-4 text-slate-500"/>}
                    </div>

                    {isExpanded && hasChildren ? (<lucide_react_1.FolderOpen className={(0, utils_1.cn)("w-4 h-4 shrink-0", isSelected ? "text-primary" : "text-amber-500")}/>) : (<lucide_react_1.Folder className={(0, utils_1.cn)("w-4 h-4 shrink-0", isSelected ? "text-primary" : "text-amber-500")}/>)}

                    <span className="truncate">{node.name}</span>
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={e => e.stopPropagation()}>
                    <dropdown_menu_1.DropdownMenu>
                        <dropdown_menu_1.DropdownMenuTrigger asChild>
                            <div className="p-1 rounded hover:bg-slate-200 cursor-pointer text-slate-500">
                                <lucide_react_1.MoreVertical className="w-4 h-4"/>
                            </div>
                        </dropdown_menu_1.DropdownMenuTrigger>
                        <dropdown_menu_1.DropdownMenuContent align="end" className="w-48">
                            <dropdown_menu_1.DropdownMenuItem onClick={() => onAction('CREATE_CHILD', node)}>
                                <lucide_react_1.Plus className="w-4 h-4 mr-2"/> Thêm thư mục con
                            </dropdown_menu_1.DropdownMenuItem>
                            <dropdown_menu_1.DropdownMenuItem onClick={() => onAction('EDIT', node)}>
                                <lucide_react_1.Edit className="w-4 h-4 mr-2"/> Đổi tên
                            </dropdown_menu_1.DropdownMenuItem>
                            <dropdown_menu_1.DropdownMenuItem onClick={() => onAction('DELETE', node)} className="text-destructive focus:text-destructive">
                                <lucide_react_1.Trash2 className="w-4 h-4 mr-2"/> Xóa thư mục
                            </dropdown_menu_1.DropdownMenuItem>
                        </dropdown_menu_1.DropdownMenuContent>
                    </dropdown_menu_1.DropdownMenu>
                </div>
            </div>

            {isExpanded && hasChildren && (<div className="w-full">
                    {node.children.map(childNode => (<exports.FolderNodeItem key={childNode._id} node={childNode} level={level + 1} onAction={onAction}/>))}
                </div>)}
        </div>);
});
exports.FolderNodeItem.displayName = 'FolderNodeItem';
//# sourceMappingURL=FolderNodeItem.js.map