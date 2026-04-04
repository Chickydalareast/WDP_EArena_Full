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
exports.DynamicRuleItem = DynamicRuleItem;
const react_1 = __importStar(require("react"));
const react_hook_form_1 = require("react-hook-form");
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/shared/components/ui/button");
const form_1 = require("@/shared/components/ui/form");
const input_1 = require("@/shared/components/ui/input");
const multi_select_1 = require("@/shared/components/ui/multi-select");
const TreeSelectMulti_1 = require("@/features/exam-builder/components/TreeSelectMulti");
const useDebounce_1 = require("@/shared/hooks/useDebounce");
const utils_1 = require("@/shared/lib/utils");
const useRuleHealthCheck_1 = require("../../hooks/useRuleHealthCheck");
function DynamicRuleItem({ sectionIndex, ruleIndex, folders, topics, activeFilters, disabled, onRemove, canRemove }) {
    const { control } = (0, react_hook_form_1.useFormContext)();
    const basePath = `dynamicConfig.adHocSections.${sectionIndex}.rules.${ruleIndex}`;
    const watchedRule = (0, react_hook_form_1.useWatch)({ control, name: basePath });
    const rulePayload = (0, react_1.useMemo)(() => ({
        folderIds: watchedRule?.folderIds || [],
        topicIds: watchedRule?.topicIds || [],
        difficulties: watchedRule?.difficulties || [],
        tags: watchedRule?.tags || [],
        limit: watchedRule?.limit || 1
    }), [watchedRule]);
    const debouncedPayload = (0, useDebounce_1.useDebounce)(rulePayload, 600);
    const isReadyToCheck = debouncedPayload.folderIds.length > 0;
    const { data: healthData, isFetching: isChecking } = (0, useRuleHealthCheck_1.useRuleHealthCheck)(isReadyToCheck ? debouncedPayload : null);
    const isSufficient = healthData?.isSufficient ?? true;
    const safetyRatio = healthData?.safetyRatio ?? 1.0;
    const available = healthData?.availableCount ?? 0;
    const healthStatus = (0, react_1.useMemo)(() => {
        if (!isReadyToCheck)
            return 'IDLE';
        if (isChecking)
            return 'CHECKING';
        if (!isSufficient)
            return 'ERROR';
        if (safetyRatio < 1.5)
            return 'WARNING';
        return 'HEALTHY';
    }, [isReadyToCheck, isChecking, isSufficient, safetyRatio]);
    const topicOptions = topics.map(t => ({ label: t.path, value: t.id }));
    const diffOptions = [
        { label: 'Nhận biết', value: 'NB' }, { label: 'Thông hiểu', value: 'TH' },
        { label: 'Vận dụng', value: 'VD' }, { label: 'Vận dụng cao', value: 'VDC' }
    ];
    const tagOptions = (activeFilters?.tags || []).map((tag) => ({ label: tag, value: tag }));
    return (<div className={(0, utils_1.cn)("grid grid-cols-12 gap-4 items-start bg-white border p-4 rounded-xl relative group transition-all shadow-sm", healthStatus === 'ERROR' && "border-red-400 bg-red-50/30", healthStatus === 'WARNING' && "border-amber-300 bg-amber-50/30", healthStatus === 'HEALTHY' && "border-green-300")}>
            
            <div className="col-span-12 md:col-span-3">
                <form_1.FormField control={control} name={`${basePath}.folderIds`} render={({ field }) => (<form_1.FormItem>
                        <form_1.FormLabel className="text-[11px] uppercase text-muted-foreground font-bold flex items-center">
                            <lucide_react_1.FolderTree className="w-3 h-3 mr-1"/> Thư mục <span className="text-red-500 ml-1">*</span>
                        </form_1.FormLabel>
                        <form_1.FormControl>
                            <TreeSelectMulti_1.TreeSelectMulti data={folders} selectedIds={field.value || []} onChange={field.onChange} disabled={disabled}/>
                        </form_1.FormControl>
                        <form_1.FormMessage />
                    </form_1.FormItem>)}/>
            </div>
            
            
            <div className="col-span-12 md:col-span-4">
                <form_1.FormField control={control} name={`${basePath}.topicIds`} render={({ field }) => (<form_1.FormItem>
                        <form_1.FormLabel className="text-[11px] uppercase text-muted-foreground font-bold">Chuyên đề (Tùy chọn)</form_1.FormLabel>
                        <form_1.FormControl>
                            <multi_select_1.MultiSelect options={topicOptions} selected={field.value || []} onChange={field.onChange} disabled={disabled} placeholder="Tất cả chuyên đề"/>
                        </form_1.FormControl>
                    </form_1.FormItem>)}/>
            </div>

            
            <div className="col-span-6 md:col-span-2">
                <form_1.FormField control={control} name={`${basePath}.difficulties`} render={({ field }) => (<form_1.FormItem>
                        <form_1.FormLabel className="text-[11px] uppercase text-muted-foreground font-bold">Độ khó (Tùy chọn)</form_1.FormLabel>
                        <form_1.FormControl>
                            <multi_select_1.MultiSelect options={diffOptions} selected={field.value || []} onChange={field.onChange} disabled={disabled} placeholder="Trộn ngẫu nhiên"/>
                        </form_1.FormControl>
                    </form_1.FormItem>)}/>
            </div>

            
            <div className="col-span-6 md:col-span-3">
                <form_1.FormField control={control} name={`${basePath}.limit`} render={({ field }) => (<form_1.FormItem>
                        <form_1.FormLabel className="text-[11px] uppercase text-muted-foreground font-bold flex items-center justify-between">
                            <span>Số Lượng <span className="text-red-500">*</span></span>
                        </form_1.FormLabel>
                        <div className="flex items-center gap-2">
                            <form_1.FormControl>
                                <input_1.Input type="number" min="1" disabled={disabled} {...field} onChange={e => field.onChange(Number(e.target.value))} className="h-10 w-20 text-center font-bold text-lg"/>
                            </form_1.FormControl>
                            
                            
                            <div className="flex-1 flex flex-col justify-center">
                                {healthStatus === 'IDLE' && <span className="text-xs text-muted-foreground">Chọn thư mục</span>}
                                {healthStatus === 'CHECKING' && <lucide_react_1.Loader2 className="w-4 h-4 animate-spin text-primary"/>}
                                {healthStatus === 'HEALTHY' && (<div className="text-[10px] leading-tight font-bold text-green-600 flex flex-col"><lucide_react_1.CheckCircle2 className="w-3 h-3 inline mr-1"/>Kho: {available} câu</div>)}
                                {healthStatus === 'WARNING' && (<div className="text-[10px] leading-tight font-bold text-amber-600 flex flex-col" title="Cần bổ sung thêm câu hỏi để tránh trùng đề">
                                        <lucide_react_1.AlertCircle className="w-3 h-3 inline mr-1"/>Kho: {available} câu
                                    </div>)}
                                {healthStatus === 'ERROR' && (<div className="text-[10px] leading-tight font-bold text-red-600 flex flex-col" title={`Thiếu ${debouncedPayload.limit - available} câu`}>
                                        <lucide_react_1.AlertCircle className="w-3 h-3 inline mr-1"/>Chỉ có {available} câu
                                    </div>)}
                            </div>
                        </div>
                    </form_1.FormItem>)}/>
            </div>

            <button_1.Button type="button" variant="ghost" size="icon" className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-red-100 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-red-200" disabled={disabled || !canRemove} onClick={onRemove}>
                <lucide_react_1.Trash2 className="w-3.5 h-3.5"/>
            </button_1.Button>
        </div>);
}
//# sourceMappingURL=DynamicRuleItem.js.map