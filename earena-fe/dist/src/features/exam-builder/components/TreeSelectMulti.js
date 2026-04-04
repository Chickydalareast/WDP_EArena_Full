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
exports.TreeSelectMulti = TreeSelectMulti;
const react_1 = __importStar(require("react"));
const lucide_react_1 = require("lucide-react");
const checkbox_1 = require("@/shared/components/ui/checkbox");
const button_1 = require("@/shared/components/ui/button");
const popover_1 = require("@/shared/components/ui/popover");
const utils_1 = require("@/shared/lib/utils");
const TreeNode = react_1.default.memo(({ node, depth, selectedIds, onToggleCheck, disabled, availableIds }) => {
    const [isExpanded, setIsExpanded] = (0, react_1.useState)(depth < 1);
    const safeNode = node;
    const safeId = String(safeNode._id ?? safeNode.id ?? '');
    const isChecked = selectedIds.includes(safeId);
    const hasChildren = Array.isArray(safeNode.children) && safeNode.children.length > 0;
    const isAvailable = availableIds ? availableIds.includes(safeId) : true;
    const isEffectivelyDisabled = disabled || !isAvailable;
    return (<div className="flex flex-col">
            <div className={(0, utils_1.cn)("flex items-center gap-2 py-1.5 px-2 hover:bg-slate-100 rounded-md transition-colors group", isEffectivelyDisabled && "opacity-50")} style={{ paddingLeft: `${depth * 16 + 8}px` }}>
                
                <div className={(0, utils_1.cn)("w-5 h-5 flex items-center justify-center text-slate-400 hover:text-slate-800", hasChildren ? "cursor-pointer" : "")} onClick={(e) => { e.stopPropagation(); if (hasChildren)
        setIsExpanded(!isExpanded); }}>
                    {hasChildren ? (isExpanded ? <lucide_react_1.ChevronDown className="w-4 h-4"/> : <lucide_react_1.ChevronRight className="w-4 h-4"/>) : <span className="w-4 h-4"/>}
                </div>

                
                <checkbox_1.Checkbox checked={isChecked} disabled={isEffectivelyDisabled} onCheckedChange={(checked) => onToggleCheck(safeId, !!checked)} className={(0, utils_1.cn)("data-[state=checked]:bg-primary data-[state=checked]:border-primary", isEffectivelyDisabled && "cursor-not-allowed")}/>

                <label className={(0, utils_1.cn)("flex flex-1 items-center gap-2 text-sm font-medium text-slate-700 truncate", isEffectivelyDisabled ? "cursor-not-allowed" : "cursor-pointer")} onClick={(e) => { e.stopPropagation(); if (!isEffectivelyDisabled)
        onToggleCheck(safeId, !isChecked); }}>
                    
                    <lucide_react_1.Folder className={(0, utils_1.cn)("w-4 h-4 shrink-0", isEffectivelyDisabled ? "text-slate-400" : "text-primary/70")}/>
                    <span className="truncate" title={node.name}>{node.name}</span>
                </label>
            </div>

            {isExpanded && hasChildren && (<div className="flex flex-col">
                    {safeNode.children.map((child, index) => {
                const childSafeNode = child;
                const childSafeId = String(childSafeNode._id ?? childSafeNode.id ?? `fallback-${depth}-${index}`);
                return (<TreeNode key={childSafeId} node={child} depth={depth + 1} selectedIds={selectedIds} onToggleCheck={onToggleCheck} disabled={disabled} availableIds={availableIds}/>);
            })}
                </div>)}
        </div>);
});
TreeNode.displayName = 'TreeNode';
function TreeSelectMulti({ data, selectedIds = [], onChange, disabled = false, availableIds }) {
    const [open, setOpen] = (0, react_1.useState)(false);
    const handleToggleCheck = (0, react_1.useCallback)((id, checked) => {
        if (disabled)
            return;
        if (checked)
            onChange([...selectedIds, id]);
        else
            onChange(selectedIds.filter(itemId => itemId !== id));
    }, [disabled, selectedIds, onChange]);
    const displayText = selectedIds.length > 0 ? `Đã chọn ${selectedIds.length} thư mục` : 'Chọn thư mục...';
    return (<popover_1.Popover open={open} onOpenChange={setOpen} modal={true}> 
            <popover_1.PopoverTrigger asChild>
                <button_1.Button variant="outline" role="combobox" aria-expanded={open} disabled={disabled} className="w-full justify-between h-10 bg-white font-normal shadow-sm">
                    <span className={(0, utils_1.cn)("truncate", selectedIds.length === 0 && "text-slate-500")}>
                        {displayText}
                    </span>
                    <lucide_react_1.ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2"/>
                </button_1.Button>
            </popover_1.PopoverTrigger>
            <popover_1.PopoverContent className="w-[320px] p-0" align="start">
                {!data || data.length === 0 ? (<div className="p-4 text-center text-slate-500 text-sm">Chưa có thư mục nào.</div>) : (<div className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2 custom-scrollbar">
                        {data.map((rootNode, index) => {
                const safeRoot = rootNode;
                const rootSafeId = String(safeRoot._id ?? safeRoot.id ?? `fallback-root-${index}`);
                return (<TreeNode key={rootSafeId} node={rootNode} depth={0} selectedIds={selectedIds} onToggleCheck={handleToggleCheck} disabled={disabled} availableIds={availableIds}/>);
            })}
                    </div>)}
            </popover_1.PopoverContent>
        </popover_1.Popover>);
}
//# sourceMappingURL=TreeSelectMulti.js.map