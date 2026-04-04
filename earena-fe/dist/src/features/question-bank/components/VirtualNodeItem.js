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
exports.VirtualNodeItem = void 0;
const react_1 = __importStar(require("react"));
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/shared/lib/utils");
exports.VirtualNodeItem = react_1.default.memo(({ node, level = 0 }) => {
    const hasChildren = node.children && node.children.length > 0;
    const [isExpanded, setIsExpanded] = (0, react_1.useState)(true);
    return (<div className="w-full">
            <div className={(0, utils_1.cn)("flex items-center gap-2 py-1.5 px-2 rounded-md transition-colors text-sm hover:bg-slate-50", node.isNew ? "bg-primary/5 border border-primary/20" : "")} style={{ paddingLeft: `${level * 16 + 8}px` }}>
                <div onClick={() => hasChildren && setIsExpanded(!isExpanded)} className={(0, utils_1.cn)("w-4 h-4 flex items-center justify-center cursor-pointer", !hasChildren && "invisible")}>
                    {isExpanded ? <lucide_react_1.ChevronDown className="w-3 h-3 text-slate-500"/> : <lucide_react_1.ChevronRight className="w-3 h-3 text-slate-500"/>}
                </div>

                <lucide_react_1.FolderOpen className={(0, utils_1.cn)("w-4 h-4", node.isNew ? "text-primary" : "text-slate-400")}/>

                <span className={(0, utils_1.cn)("truncate", node.isNew ? "font-bold text-primary" : "font-medium text-slate-700")}>
                    {node.name}
                </span>

                {node.isNew && (<span className="text-[9px] font-black bg-primary text-primary-foreground px-1.5 py-0.5 rounded uppercase tracking-wider shadow-sm">
                        Mới
                    </span>)}

                {node.questionCount > 0 && (<span className="text-xs text-slate-500 ml-auto font-medium bg-white px-2 py-0.5 rounded border shadow-sm">
                        {node.questionCount} câu
                    </span>)}
            </div>

            {isExpanded && hasChildren && (<div className="flex flex-col">
                    {node.children.map(child => (<exports.VirtualNodeItem key={child._id} node={child} level={level + 1}/>))}
                </div>)}
        </div>);
});
exports.VirtualNodeItem.displayName = 'VirtualNodeItem';
//# sourceMappingURL=VirtualNodeItem.js.map