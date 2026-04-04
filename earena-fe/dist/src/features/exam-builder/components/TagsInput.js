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
exports.TagsInput = TagsInput;
const react_1 = __importStar(require("react"));
const lucide_react_1 = require("lucide-react");
const input_1 = require("@/shared/components/ui/input");
const utils_1 = require("@/shared/lib/utils");
function TagsInput({ value = [], onChange, placeholder = 'Nhập tag và ấn Enter...', disabled = false, className }) {
    const [inputValue, setInputValue] = (0, react_1.useState)('');
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const newTag = inputValue.trim();
            if (newTag && !value.includes(newTag)) {
                onChange([...value, newTag]);
                setInputValue('');
            }
        }
    };
    const removeTag = (tagToRemove) => {
        if (disabled)
            return;
        onChange(value.filter(tag => tag !== tagToRemove));
    };
    return (<div className={(0, utils_1.cn)("flex flex-col gap-2", className)}>
            <input_1.Input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} placeholder={placeholder} disabled={disabled}/>

            {value.length > 0 && (<div className="flex flex-wrap gap-2">
                    {value.map((tag) => (<div key={tag} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 transition-colors">
                            <span className="max-w-[150px] truncate">{tag}</span>
                            {!disabled && (<button type="button" onClick={() => removeTag(tag)} className="ml-1.5 hover:bg-indigo-200 hover:text-indigo-900 rounded-full p-0.5 focus:outline-none">
                                    <lucide_react_1.X className="w-3 h-3"/>
                                </button>)}
                        </div>))}
                </div>)}
        </div>);
}
//# sourceMappingURL=TagsInput.js.map