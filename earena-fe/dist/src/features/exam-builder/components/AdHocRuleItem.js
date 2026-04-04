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
exports.default = AdHocRuleItem;
const react_1 = __importStar(require("react"));
const react_hook_form_1 = require("react-hook-form");
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/shared/components/ui/button");
const form_1 = require("@/shared/components/ui/form");
const input_1 = require("@/shared/components/ui/input");
const multi_select_1 = require("@/shared/components/ui/multi-select");
const TreeSelectMulti_1 = require("./TreeSelectMulti");
const useActiveFilters_1 = require("../hooks/useActiveFilters");
const usePreviewMatrixRule_1 = require("../hooks/usePreviewMatrixRule");
const useDebounce_1 = require("@/shared/hooks/useDebounce");
const utils_1 = require("@/shared/lib/utils");
function AdHocRuleItem({ paperId, sectionIndex, ruleIndex, folders, topics, disabled, onRemove, canRemove }) {
    const { control, setValue, getValues, setError, clearErrors } = (0, react_hook_form_1.useFormContext)();
    const watchedFolderIds = (0, react_hook_form_1.useWatch)({ control, name: `adHocSections.${sectionIndex}.rules.${ruleIndex}.folderIds` }) || [];
    const watchedTopicIds = (0, react_hook_form_1.useWatch)({ control, name: `adHocSections.${sectionIndex}.rules.${ruleIndex}.topicIds` }) || [];
    const watchedDifficulties = (0, react_hook_form_1.useWatch)({ control, name: `adHocSections.${sectionIndex}.rules.${ruleIndex}.difficulties` }) || [];
    const watchedTags = (0, react_hook_form_1.useWatch)({ control, name: `adHocSections.${sectionIndex}.rules.${ruleIndex}.tags` }) || [];
    const watchedLimit = (0, react_hook_form_1.useWatch)({ control, name: `adHocSections.${sectionIndex}.rules.${ruleIndex}.limit` }) || 1;
    const rulePayload = (0, react_1.useMemo)(() => ({
        folderIds: watchedFolderIds,
        topicIds: watchedTopicIds,
        difficulties: watchedDifficulties,
        tags: watchedTags,
        limit: watchedLimit
    }), [watchedFolderIds, watchedTopicIds, watchedDifficulties, watchedTags, watchedLimit]);
    const debouncedPayload = (0, useDebounce_1.useDebounce)(rulePayload, 500);
    const { data: filterData, isFetching: isFetchingFilters } = (0, useActiveFilters_1.useActiveFilters)({
        folderIds: debouncedPayload.folderIds,
        topicIds: debouncedPayload.topicIds,
        difficulties: debouncedPayload.difficulties,
        tags: debouncedPayload.tags,
        isDraft: false,
    });
    const { data: previewData, isFetching: isFetchingPreview } = (0, usePreviewMatrixRule_1.usePreviewMatrixRule)(paperId, debouncedPayload);
    const availableFolderIds = filterData?.folderIds;
    const availableTags = filterData?.tags || [];
    const maxAvailable = previewData?.availableQuestionsCount;
    (0, react_1.useEffect)(() => {
        if (!filterData)
            return;
        const currentFolderIds = getValues(`adHocSections.${sectionIndex}.rules.${ruleIndex}.folderIds`) || [];
        const currentTags = getValues(`adHocSections.${sectionIndex}.rules.${ruleIndex}.tags`) || [];
        if (currentFolderIds.length > 0 && filterData.folderIds) {
            const validFolderIds = currentFolderIds.filter(id => filterData.folderIds.includes(id));
            if (validFolderIds.join(',') !== currentFolderIds.join(',')) {
                setValue(`adHocSections.${sectionIndex}.rules.${ruleIndex}.folderIds`, validFolderIds, { shouldValidate: true });
            }
        }
        if (currentTags.length > 0) {
            const validTags = currentTags.filter(tag => filterData.tags.includes(tag));
            if (validTags.join(',') !== currentTags.join(',')) {
                setValue(`adHocSections.${sectionIndex}.rules.${ruleIndex}.tags`, validTags, { shouldValidate: true });
            }
        }
    }, [filterData, sectionIndex, ruleIndex, setValue, getValues]);
    (0, react_1.useEffect)(() => {
        const fieldName = `adHocSections.${sectionIndex}.rules.${ruleIndex}.limit`;
        if (maxAvailable !== undefined) {
            if (watchedLimit > maxAvailable) {
                setError(fieldName, { type: 'manual', message: `Kho chỉ còn ${maxAvailable} câu hợp lệ` });
            }
            else if (watchedLimit <= 0) {
                setError(fieldName, { type: 'manual', message: 'Số câu phải lớn hơn 0' });
            }
            else {
                clearErrors(fieldName);
            }
        }
    }, [maxAvailable, watchedLimit, sectionIndex, ruleIndex, setError, clearErrors]);
    const validTopicIds = (0, react_1.useMemo)(() => {
        if (!filterData?.topics)
            return null;
        const ids = new Set();
        const extractIds = (nodes) => {
            nodes.forEach(node => {
                ids.add(node.id);
                if (node.children && node.children.length > 0)
                    extractIds(node.children);
            });
        };
        extractIds(filterData.topics);
        return ids;
    }, [filterData?.topics]);
    const topicOptions = (0, react_1.useMemo)(() => {
        return topics.map(t => ({
            label: t.path,
            value: t.id,
            disabled: validTopicIds ? !validTopicIds.has(t.id) : false
        }));
    }, [topics, validTopicIds]);
    const diffOptions = (0, react_1.useMemo)(() => {
        const baseOptions = [
            { label: 'Nhận biết', value: 'NB' },
            { label: 'Thông hiểu', value: 'TH' },
            { label: 'Vận dụng', value: 'VD' },
            { label: 'Vận dụng cao', value: 'VDC' }
        ];
        if (!filterData?.difficulties)
            return baseOptions;
        return baseOptions.map(opt => ({
            ...opt,
            disabled: !filterData.difficulties.includes(opt.value)
        }));
    }, [filterData?.difficulties]);
    const tagOptions = (0, react_1.useMemo)(() => {
        const allVisibleTags = Array.from(new Set([...availableTags, ...watchedTags]));
        return allVisibleTags.map(tag => ({
            label: tag,
            value: tag,
            disabled: filterData?.tags ? !filterData.tags.includes(tag) : false
        }));
    }, [availableTags, watchedTags, filterData?.tags]);
    return (<div className={(0, utils_1.cn)("grid grid-cols-12 gap-4 items-start bg-slate-50 border p-4 rounded-xl relative group transition-all", (maxAvailable === 0) ? "border-destructive/50 bg-destructive/5" : "border-border")}>
            
            <div className="col-span-12 md:col-span-3">
                <form_1.FormField control={control} name={`adHocSections.${sectionIndex}.rules.${ruleIndex}.folderIds`} render={({ field }) => (<form_1.FormItem>
                        <form_1.FormLabel className="text-[11px] uppercase text-muted-foreground font-bold flex items-center">
                            <lucide_react_1.FolderTree className="w-3 h-3 mr-1"/> Thư mục
                        </form_1.FormLabel>
                        <form_1.FormControl>
                            <TreeSelectMulti_1.TreeSelectMulti data={folders} selectedIds={field.value || []} onChange={field.onChange} disabled={disabled} availableIds={availableFolderIds}/>
                        </form_1.FormControl>
                        <form_1.FormMessage />
                    </form_1.FormItem>)}/>
            </div>

            
            <div className="col-span-12 md:col-span-4">
                <form_1.FormField control={control} name={`adHocSections.${sectionIndex}.rules.${ruleIndex}.topicIds`} render={({ field }) => (<form_1.FormItem>
                        <form_1.FormLabel className="text-[11px] uppercase text-muted-foreground font-bold">Chuyên đề</form_1.FormLabel>
                        <form_1.FormControl>
                            <multi_select_1.MultiSelect options={topicOptions} selected={field.value || []} onChange={field.onChange} disabled={disabled} placeholder="Tất cả chuyên đề"/>
                        </form_1.FormControl>
                    </form_1.FormItem>)}/>
            </div>

            <div className="col-span-6 md:col-span-2">
                <form_1.FormField control={control} name={`adHocSections.${sectionIndex}.rules.${ruleIndex}.difficulties`} render={({ field }) => (<form_1.FormItem>
                        <form_1.FormLabel className="text-[11px] uppercase text-muted-foreground font-bold">Độ khó</form_1.FormLabel>
                        <form_1.FormControl>
                            <multi_select_1.MultiSelect options={diffOptions} selected={field.value || []} onChange={field.onChange} disabled={disabled} placeholder="Tất cả"/>
                        </form_1.FormControl>
                    </form_1.FormItem>)}/>
            </div>

            
            <div className="col-span-6 md:col-span-3">
                <form_1.FormField control={control} name={`adHocSections.${sectionIndex}.rules.${ruleIndex}.limit`} render={({ field }) => (<form_1.FormItem>
                        <form_1.FormLabel className="text-[11px] uppercase text-muted-foreground font-bold flex items-center justify-between">
                            <span>Số Câu</span>
                            {isFetchingPreview ? (<lucide_react_1.Loader2 className="w-3 h-3 animate-spin text-primary"/>) : maxAvailable !== undefined ? (<span className={(0, utils_1.cn)("text-[10px] lowercase px-1.5 rounded-sm", maxAvailable === 0 ? "bg-destructive text-destructive-foreground" : "bg-primary/10 text-primary")}>
                                    Max: {maxAvailable}
                                </span>) : null}
                        </form_1.FormLabel>
                        <form_1.FormControl>
                            <input_1.Input type="number" min="1" max={maxAvailable !== undefined ? maxAvailable : undefined} disabled={disabled || (watchedFolderIds.length === 0)} className={(0, utils_1.cn)((maxAvailable !== undefined && watchedLimit > maxAvailable) && "border-destructive focus-visible:ring-destructive")} {...field} onChange={e => field.onChange(Number(e.target.value))}/>
                        </form_1.FormControl>
                        {watchedFolderIds.length === 0 && (<form_1.FormDescription className="text-[10px] leading-tight">Vui lòng chọn thư mục trước</form_1.FormDescription>)}
                        <form_1.FormMessage />
                    </form_1.FormItem>)}/>
            </div>

            
            <div className="col-span-12">
                <form_1.FormField control={control} name={`adHocSections.${sectionIndex}.rules.${ruleIndex}.tags`} render={({ field }) => (<form_1.FormItem>
                        <form_1.FormLabel className="text-[11px] uppercase text-muted-foreground font-bold flex items-center">
                            Lọc theo Tags
                            {isFetchingFilters && <lucide_react_1.Loader2 className="w-3 h-3 ml-2 animate-spin text-primary"/>}
                        </form_1.FormLabel>
                        <form_1.FormControl>
                            <multi_select_1.MultiSelect options={tagOptions} selected={field.value || []} onChange={field.onChange} disabled={disabled || isFetchingFilters} placeholder={availableTags.length === 0 ? "Không có Tag nào" : "Chọn Tags..."}/>
                        </form_1.FormControl>
                        <form_1.FormMessage />
                    </form_1.FormItem>)}/>
            </div>

            <button_1.Button type="button" variant="destructive" size="icon" className="absolute -top-3 -right-3 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" disabled={disabled || !canRemove} onClick={onRemove}>
                <lucide_react_1.Trash2 className="w-3 h-3"/>
            </button_1.Button>
        </div>);
}
//# sourceMappingURL=AdHocRuleItem.js.map