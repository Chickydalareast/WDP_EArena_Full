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
exports.MultiSelect = MultiSelect;
const React = __importStar(require("react"));
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/shared/lib/utils");
const button_1 = require("@/shared/components/ui/button");
const popover_1 = require("@/shared/components/ui/popover");
function MultiSelect({ options, selected, onChange, placeholder = 'Chọn...', disabled }) {
    const [open, setOpen] = React.useState(false);
    const handleUnselect = (value) => {
        onChange(selected.filter((s) => s !== value));
    };
    const handleSelect = (value) => {
        if (selected.includes(value)) {
            handleUnselect(value);
        }
        else {
            onChange([...selected, value]);
        }
    };
    return (<popover_1.Popover open={open} onOpenChange={setOpen} modal={true}>
            <popover_1.PopoverTrigger asChild>
                <button_1.Button variant="outline" role="combobox" aria-expanded={open} disabled={disabled} className="w-full justify-between h-auto min-h-10 bg-white shadow-sm" onClick={() => setOpen(!open)}>
                    <div className="flex flex-wrap gap-1">
                        {selected.length === 0 && <span className="text-muted-foreground font-normal">{placeholder}</span>}
                        {selected.map((val) => {
            const option = options.find((o) => o.value === val);
            if (!option)
                return null;
            return (<div key={val} className="flex items-center gap-1 bg-slate-100 rounded-sm px-2 py-0.5 text-xs font-semibold text-slate-700" onClick={(e) => {
                    e.stopPropagation();
                    handleUnselect(val);
                }}>
                                    {option.label}
                                    <lucide_react_1.X className="h-3 w-3 hover:text-destructive cursor-pointer transition-colors"/>
                                </div>);
        })}
                    </div>
                    <lucide_react_1.ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50"/>
                </button_1.Button>
            </popover_1.PopoverTrigger>
            <popover_1.PopoverContent className="w-[300px] p-0 max-h-[250px] overflow-y-auto" align="start">
                <div className="flex flex-col p-1">
                    {options.length === 0 ? (<div className="p-4 text-sm text-slate-500 text-center">Không có dữ liệu</div>) : (options.map((option) => {
            const isSelected = selected.includes(option.value);
            return (<div key={option.value} className={(0, utils_1.cn)("relative flex select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors", isSelected ? "bg-primary/10 text-primary font-medium" : "", option.disabled
                    ? "opacity-50 cursor-not-allowed bg-slate-50/50"
                    : "cursor-pointer hover:bg-slate-100 hover:text-slate-900")} onClick={(e) => {
                    if (option.disabled) {
                        e.preventDefault();
                        return;
                    }
                    handleSelect(option.value);
                }}>
                                    <div className={(0, utils_1.cn)("mr-2 flex h-4 w-4 items-center justify-center rounded-sm border transition-colors", isSelected ? "bg-primary border-primary text-primary-foreground" : "border-primary/50 opacity-50 [&_svg]:invisible", option.disabled && !isSelected && "border-slate-300 bg-slate-200/50")}>
                                        <lucide_react_1.Check className={(0, utils_1.cn)("h-3 w-3")}/>
                                    </div>
                                    <span className="truncate">{option.label}</span>
                                </div>);
        }))}
                </div>
            </popover_1.PopoverContent>
        </popover_1.Popover>);
}
//# sourceMappingURL=multi-select.js.map