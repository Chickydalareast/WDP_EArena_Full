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
exports.DynamicSectionItem = DynamicSectionItem;
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
const useQuizRuleHealth_1 = require("../../hooks/useQuizRuleHealth");
const useActiveFilters_1 = require("@/features/exam-builder/hooks/useActiveFilters");
function DynamicSectionItem({ sectionIndex, folders, topics, activeFilters, disabled, onRemove, canRemove }) {
    const { control } = (0, react_hook_form_1.useFormContext)();
    const namePath = `dynamicConfig.adHocSections.${sectionIndex}.name`;
    const rulePath = `dynamicConfig.adHocSections.${sectionIndex}.rules.0`;
    const watchedRule = (0, react_hook_form_1.useWatch)({ control, name: rulePath });
    const rulePayload = (0, react_1.useMemo)(() => ({
        folderIds: watchedRule?.folderIds || [],
        topicIds: watchedRule?.topicIds || [],
        difficulties: watchedRule?.difficulties || [],
        tags: watchedRule?.tags || [],
        limit: watchedRule?.limit || 1
    }), [watchedRule]);
    const debouncedPayload = (0, useDebounce_1.useDebounce)(rulePayload, 500);
    const isReadyToCheck = debouncedPayload.folderIds.length > 0;
    const { data: healthData, isFetching: isChecking } = (0, useQuizRuleHealth_1.useQuizRuleHealth)(isReadyToCheck ? debouncedPayload : null);
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
    const filterPayload = (0, react_1.useMemo)(() => {
        const payload = { isDraft: false };
        if (debouncedPayload.folderIds.length > 0)
            payload.folderIds = debouncedPayload.folderIds;
        if (debouncedPayload.topicIds.length > 0)
            payload.topicIds = debouncedPayload.topicIds;
        if (debouncedPayload.difficulties.length > 0)
            payload.difficulties = debouncedPayload.difficulties;
        if (debouncedPayload.tags.length > 0)
            payload.tags = debouncedPayload.tags;
        return payload;
    }, [debouncedPayload.folderIds, debouncedPayload.topicIds, debouncedPayload.difficulties, debouncedPayload.tags]);
    const hasAnyFilter = Object.keys(filterPayload).length > 1;
    const { data: rawLocalFilters, isFetching: isFetchingLocalFilters } = (0, useActiveFilters_1.useActiveFilters)(hasAnyFilter ? filterPayload : null);
    const localFilters = rawLocalFilters?.data || rawLocalFilters;
    const effectiveFilters = (hasAnyFilter && localFilters) ? localFilters : activeFilters;
    const topicOptions = (0, react_1.useMemo)(() => {
        if (!effectiveFilters?.topics)
            return topics.map(t => ({ label: t.path, value: t.id }));
        const validIds = new Set(effectiveFilters.topics.map((t) => t.id || t._id));
        return topics.filter(t => validIds.has(t.id)).map(t => ({ label: t.path, value: t.id }));
    }, [topics, effectiveFilters?.topics]);
    const diffOptions = (0, react_1.useMemo)(() => {
        const baseOptions = [
            { label: 'Nhận biết', value: 'NB' }, { label: 'Thông hiểu', value: 'TH' },
            { label: 'Vận dụng', value: 'VD' }, { label: 'Vận dụng cao', value: 'VDC' }
        ];
        if (!effectiveFilters?.difficulties)
            return baseOptions;
        return baseOptions.filter(opt => effectiveFilters.difficulties.includes(opt.value));
    }, [effectiveFilters?.difficulties]);
    const tagOptions = (0, react_1.useMemo)(() => {
        const tags = effectiveFilters?.tags || [];
        return tags.map((tag) => ({ label: tag, value: tag }));
    }, [effectiveFilters?.tags]);
    return (<div className={(0, utils_1.cn)("bg-white border p-5 rounded-xl relative group transition-all shadow-sm space-y-5", healthStatus === 'ERROR' ? "border-red-400 bg-red-50/30" : "border-purple-200")}>
            <div className="flex justify-between items-center pb-2 border-b border-purple-100/50">
                <form_1.FormField control={control} name={namePath} render={({ field }) => (<form_1.FormItem className="flex-1 max-w-sm">
                        <form_1.FormControl>
                            <input_1.Input {...field} placeholder="Tên phần thi (VD: Phần Đọc Hiểu)" className="font-bold border-none bg-transparent text-purple-900 text-lg px-0 focus-visible:ring-0 shadow-none" disabled={disabled}/>
                        </form_1.FormControl>
                        <form_1.FormMessage />
                    </form_1.FormItem>)}/>
                <button_1.Button type="button" variant="ghost" className="text-red-500 hover:bg-red-50 hover:text-red-600 font-medium" disabled={disabled || !canRemove} onClick={onRemove}>
                    <lucide_react_1.Trash2 className="w-4 h-4 mr-2"/> Xóa Phần Này
                </button_1.Button>
            </div>

            <div className="grid grid-cols-12 gap-4 items-start">
                <div className="col-span-12 md:col-span-3">
                    <form_1.FormField control={control} name={`${rulePath}.folderIds`} render={({ field }) => (<form_1.FormItem>
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
                    <form_1.FormField control={control} name={`${rulePath}.topicIds`} render={({ field }) => (<form_1.FormItem>
                            <form_1.FormLabel className="text-[11px] uppercase text-muted-foreground font-bold">
                                Chuyên đề {isFetchingLocalFilters && <lucide_react_1.Loader2 className="w-3 h-3 ml-2 animate-spin inline-block text-purple-500"/>}
                            </form_1.FormLabel>
                            <form_1.FormControl>
                                <multi_select_1.MultiSelect options={topicOptions} selected={field.value || []} onChange={field.onChange} disabled={disabled || isFetchingLocalFilters} placeholder={topicOptions.length ? "Tất cả chuyên đề" : "Không có chuyên đề"}/>
                            </form_1.FormControl>
                        </form_1.FormItem>)}/>
                </div>

                <div className="col-span-6 md:col-span-2">
                    <form_1.FormField control={control} name={`${rulePath}.difficulties`} render={({ field }) => (<form_1.FormItem>
                            <form_1.FormLabel className="text-[11px] uppercase text-muted-foreground font-bold">
                                Độ khó {isFetchingLocalFilters && <lucide_react_1.Loader2 className="w-3 h-3 ml-2 animate-spin inline-block text-purple-500"/>}
                            </form_1.FormLabel>
                            <form_1.FormControl>
                                <multi_select_1.MultiSelect options={diffOptions} selected={field.value || []} onChange={field.onChange} disabled={disabled || isFetchingLocalFilters} placeholder={diffOptions.length ? "Ngẫu nhiên" : "Trống"}/>
                            </form_1.FormControl>
                        </form_1.FormItem>)}/>
                </div>

                <div className="col-span-6 md:col-span-3">
                    <form_1.FormField control={control} name={`${rulePath}.limit`} render={({ field }) => (<form_1.FormItem>
                            <form_1.FormLabel className="text-[11px] uppercase text-muted-foreground font-bold flex items-center justify-between">
                                <span>Số Lượng <span className="text-red-500">*</span></span>
                            </form_1.FormLabel>
                            <div className="flex items-center gap-2">
                                <form_1.FormControl>
                                    <input_1.Input type="number" min="1" disabled={disabled} {...field} onChange={e => field.onChange(Number(e.target.value))} className="h-10 w-20 text-center font-bold text-lg"/>
                                </form_1.FormControl>
                                
                                <div className="flex-1 flex flex-col justify-center">
                                    {healthStatus === 'IDLE' && <span className="text-xs text-muted-foreground">Chọn thư mục</span>}
                                    {healthStatus === 'CHECKING' && <lucide_react_1.Loader2 className="w-4 h-4 animate-spin text-purple-500"/>}
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
            </div>

            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12">
                    <form_1.FormField control={control} name={`${rulePath}.tags`} render={({ field }) => (<form_1.FormItem>
                            <form_1.FormLabel className="text-[11px] uppercase text-muted-foreground font-bold flex items-center">
                                Lọc theo Tags (Phân cách bởi dấu phẩy)
                            </form_1.FormLabel>
                            <form_1.FormControl>
                                <multi_select_1.MultiSelect options={tagOptions} selected={field.value || []} onChange={field.onChange} disabled={disabled || isFetchingLocalFilters} placeholder={tagOptions.length ? "Bỏ trống nếu không lọc" : "Không có tag nào trong kho"}/>
                            </form_1.FormControl>
                            <form_1.FormMessage />
                        </form_1.FormItem>)}/>
                </div>
            </div>
        </div>);
}
//# sourceMappingURL=DynamicSectionItem.js.map