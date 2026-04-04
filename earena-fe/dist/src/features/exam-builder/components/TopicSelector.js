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
exports.TopicSelector = void 0;
const react_1 = __importStar(require("react"));
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/shared/lib/utils");
exports.TopicSelector = react_1.default.memo(({ value, onChange, topics, isLoading = false, disabled = false, placeholder = "Tìm và chọn chuyên đề...", className }) => {
    const [isOpen, setIsOpen] = (0, react_1.useState)(false);
    const [searchTerm, setSearchTerm] = (0, react_1.useState)('');
    const dropdownRef = (0, react_1.useRef)(null);
    const selectedTopic = (0, react_1.useMemo)(() => topics.find(t => t.id === value), [topics, value]);
    const filteredTopics = (0, react_1.useMemo)(() => {
        if (!searchTerm.trim())
            return topics;
        const lowerSearch = searchTerm.toLowerCase();
        return topics.filter(t => {
            const targetString = t.path || t.name || '';
            return targetString.toLowerCase().includes(lowerSearch);
        });
    }, [topics, searchTerm]);
    (0, react_1.useEffect)(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);
    const handleSelect = (topicId) => {
        onChange(topicId);
        setIsOpen(false);
        setSearchTerm('');
    };
    const handleClear = (e) => {
        e.stopPropagation();
        onChange('');
    };
    return (<div className="relative w-full" ref={dropdownRef}>
            <div onClick={() => !disabled && !isLoading && setIsOpen(!isOpen)} className={(0, utils_1.cn)("flex min-h-[40px] w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm transition-all", disabled || isLoading ? "cursor-not-allowed opacity-50 bg-muted" : "cursor-pointer hover:bg-accent hover:border-accent-foreground/20", isOpen && "ring-2 ring-ring border-primary", className)}>
                
                <div className="flex-1 min-w-0 overflow-hidden pr-2 text-left">
                    {isLoading ? (<span className="text-muted-foreground block truncate">Đang tải dữ liệu...</span>) : selectedTopic ? (<span className="text-foreground font-medium block truncate" title={selectedTopic.path}>
                            {selectedTopic.path}
                        </span>) : (<span className="text-muted-foreground block truncate">{placeholder}</span>)}
                </div>

                <div className="flex items-center gap-1 shrink-0 text-muted-foreground">
                    {selectedTopic && !disabled && (<div onClick={handleClear} className="p-1 hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors shrink-0">
                            <lucide_react_1.X className="w-3.5 h-3.5"/>
                        </div>)}
                    <lucide_react_1.ChevronDown className={(0, utils_1.cn)("w-4 h-4 transition-transform duration-200 shrink-0", isOpen && "rotate-180")}/>
                </div>
            </div>

            {isOpen && (<div className="absolute top-full left-0 z-50 mt-1 w-full rounded-md border border-border bg-popover text-popover-foreground shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="sticky top-0 flex items-center border-b border-border bg-popover/80 backdrop-blur-sm px-3 py-2 rounded-t-md">
                        <lucide_react_1.Search className="w-4 h-4 text-muted-foreground mr-2 shrink-0"/>
                        <input type="text" placeholder="Gõ để tìm kiếm chuyên đề..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground min-w-0" autoFocus/>
                    </div>

                    <div className="max-h-[250px] overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-border">
                        {filteredTopics.length === 0 ? (<div className="py-6 text-center text-sm text-muted-foreground flex flex-col items-center">
                                <lucide_react_1.BookOpen className="w-6 h-6 mb-2 opacity-20"/>
                                Không tìm thấy chuyên đề phù hợp.
                            </div>) : (filteredTopics.map((topic) => (<div key={topic.id} onClick={() => handleSelect(topic.id)} className={(0, utils_1.cn)("flex items-center justify-between px-3 py-2 text-sm rounded-sm cursor-pointer transition-colors mt-0.5", value === topic.id
                    ? "bg-primary/10 text-primary font-bold"
                    : "text-foreground hover:bg-accent hover:text-accent-foreground")} title={topic.path}>
                                    <span className="flex-1 min-w-0 truncate pr-4">{topic.path}</span>
                                    {value === topic.id && <lucide_react_1.Check className="w-4 h-4 shrink-0"/>}
                                </div>)))}
                    </div>
                </div>)}
        </div>);
});
exports.TopicSelector.displayName = 'TopicSelector';
//# sourceMappingURL=TopicSelector.js.map