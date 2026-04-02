'use client';

import React, { useEffect, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Trash2, FolderTree, Loader2, Info } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { MultiSelect } from '@/shared/components/ui/multi-select';
import { TreeSelectMulti } from './TreeSelectMulti';

import { FillFromMatrixFormValues, ActiveFiltersPayloadDTO, MatrixRuleDTO } from '../types/exam.schema';
import { FolderNode } from '../hooks/useFolders';
import { FlatTopic } from '../hooks/useTopics';
import { useActiveFilters } from '../hooks/useActiveFilters';
import { usePreviewMatrixRule } from '../hooks/usePreviewMatrixRule';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { cn } from '@/shared/lib/utils';

interface AdHocRuleItemProps {
    paperId: string; // [CTO FIX]: Nhận paperId từ cha
    sectionIndex: number;
    ruleIndex: number;
    folders: FolderNode[];
    topics: FlatTopic[];
    disabled: boolean;
    onRemove: () => void;
    canRemove: boolean;
}

export default function AdHocRuleItem({
    paperId,
    sectionIndex,
    ruleIndex,
    folders,
    topics,
    disabled,
    onRemove,
    canRemove
}: AdHocRuleItemProps) {
    const { control, setValue, getValues, setError, clearErrors } = useFormContext<FillFromMatrixFormValues>();

    // 1. Reactive State
    const watchedFolderIds = useWatch({ control, name: `adHocSections.${sectionIndex}.rules.${ruleIndex}.folderIds` }) || [];
    const watchedTopicIds = useWatch({ control, name: `adHocSections.${sectionIndex}.rules.${ruleIndex}.topicIds` }) || [];
    const watchedDifficulties = useWatch({ control, name: `adHocSections.${sectionIndex}.rules.${ruleIndex}.difficulties` }) || [];
    const watchedTags = useWatch({ control, name: `adHocSections.${sectionIndex}.rules.${ruleIndex}.tags` }) || [];
    const watchedLimit = useWatch({ control, name: `adHocSections.${sectionIndex}.rules.${ruleIndex}.limit` }) || 1;

    // 2. Debounce Payload (Dùng chung cho cả 2 API)
    const rulePayload: MatrixRuleDTO = useMemo(() => ({
        folderIds: watchedFolderIds,
        topicIds: watchedTopicIds,
        difficulties: watchedDifficulties,
        tags: watchedTags,
        limit: watchedLimit
    }), [watchedFolderIds, watchedTopicIds, watchedDifficulties, watchedTags, watchedLimit]);

    const debouncedPayload = useDebounce(rulePayload, 500);

    // 3. FETCH: API 1 - Bộ lọc thả xuống (Faceted)
    const { data: filterData, isFetching: isFetchingFilters } = useActiveFilters({
        folderIds: debouncedPayload.folderIds,
        topicIds: debouncedPayload.topicIds,
        difficulties: debouncedPayload.difficulties,
        tags: debouncedPayload.tags,
        // [CTO FIX]: Hardcode cờ chặn hiển thị Thư mục/Chuyên đề nháp ở màn tạo đề
        isDraft: false,
    });

    // 4. FETCH: API 2 - Tính toán số lượng câu khả dụng (Backend đếm ngầm)
    const { data: previewData, isFetching: isFetchingPreview } = usePreviewMatrixRule(paperId, debouncedPayload);

    const availableFolderIds = filterData?.folderIds;
    const availableTags = filterData?.tags || [];
    const maxAvailable = previewData?.availableQuestionsCount;

    // 5. AUTO-CLEARING BẪY CHỐNG INFINITE LOOP
    useEffect(() => {
        if (!filterData) return;

        const currentFolderIds = getValues(`adHocSections.${sectionIndex}.rules.${ruleIndex}.folderIds`) || [];
        const currentTags = getValues(`adHocSections.${sectionIndex}.rules.${ruleIndex}.tags`) || [];

        if (currentFolderIds.length > 0 && filterData.folderIds) {
            const validFolderIds = currentFolderIds.filter(id => filterData.folderIds.includes(id));
            // Deep compare bằng join để tránh loop
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

    // 6. VALIDATION MAX LIMIT ĐỘNG TỪ API PREVIEW
    useEffect(() => {
        const fieldName = `adHocSections.${sectionIndex}.rules.${ruleIndex}.limit` as const;
        
        if (maxAvailable !== undefined) {
            if (watchedLimit > maxAvailable) {
                setError(fieldName, { type: 'manual', message: `Kho chỉ còn ${maxAvailable} câu hợp lệ` });
            } else if (watchedLimit <= 0) {
                setError(fieldName, { type: 'manual', message: 'Số câu phải lớn hơn 0' });
            } else {
                clearErrors(fieldName);
            }
        }
    }, [maxAvailable, watchedLimit, sectionIndex, ruleIndex, setError, clearErrors]);


    // ==========================================
    // DATA BINDING & CROSS-FILTERING (THE CASCADE)
    // ==========================================

    // 1. CHUYÊN ĐỀ (TOPICS): Cào ID đệ quy từ Pruned Tree của BE
    const validTopicIds = useMemo(() => {
        if (!filterData?.topics) return null; // Null khi chưa có data/đang loading
        const ids = new Set<string>();
        const extractIds = (nodes: any[]) => {
            nodes.forEach(node => {
                ids.add(node.id);
                if (node.children && node.children.length > 0) extractIds(node.children);
            });
        };
        extractIds(filterData.topics);
        return ids;
    }, [filterData?.topics]);

    const topicOptions = useMemo(() => {
        return topics.map(t => ({ 
            label: t.path, 
            value: t.id,
            // Nếu API đã trả về bộ lọc hợp lệ, ta disable những ID không nằm trong Set
            disabled: validTopicIds ? !validTopicIds.has(t.id) : false
        }));
    }, [topics, validTopicIds]);


    // 2. MỨC ĐỘ (DIFFICULTIES): Đối chiếu mảng 1 chiều
    const diffOptions = useMemo(() => {
        const baseOptions = [
            { label: 'Nhận biết', value: 'NB' }, 
            { label: 'Thông hiểu', value: 'TH' },
            { label: 'Vận dụng', value: 'VD' }, 
            { label: 'Vận dụng cao', value: 'VDC' }
        ];
        
        if (!filterData?.difficulties) return baseOptions;
        
        return baseOptions.map(opt => ({
            ...opt,
            disabled: !filterData.difficulties.includes(opt.value)
        }));
    }, [filterData?.difficulties]);


    // 3. TAGS: Gộp Tags đang chọn và Tags khả dụng để UX mượt mà
    const tagOptions = useMemo(() => {
        // Gộp mảng để tránh tag bị tàng hình đột ngột khi đang chờ auto-clear
        const allVisibleTags = Array.from(new Set([...availableTags, ...watchedTags]));
        
        return allVisibleTags.map(tag => ({ 
            label: tag, 
            value: tag,
            disabled: filterData?.tags ? !filterData.tags.includes(tag) : false
        }));
    }, [availableTags, watchedTags, filterData?.tags]);

    // ==========================================

    return (
        <div className={cn(
            "grid grid-cols-12 gap-4 items-start bg-slate-50 border p-4 rounded-xl relative group transition-all",
            (maxAvailable === 0) ? "border-destructive/50 bg-destructive/5" : "border-border"
        )}>
            {/* THƯ MỤC NGUỒN */}
            <div className="col-span-12 md:col-span-3">
                <FormField control={control} name={`adHocSections.${sectionIndex}.rules.${ruleIndex}.folderIds`} render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-[11px] uppercase text-muted-foreground font-bold flex items-center">
                            <FolderTree className="w-3 h-3 mr-1" /> Thư mục
                        </FormLabel>
                        <FormControl>
                            <TreeSelectMulti data={folders} selectedIds={field.value || []} onChange={field.onChange} disabled={disabled} availableIds={availableFolderIds} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
            </div>

            {/* CHUYÊN ĐỀ & MỨC ĐỘ */}
            <div className="col-span-12 md:col-span-4">
                <FormField control={control} name={`adHocSections.${sectionIndex}.rules.${ruleIndex}.topicIds`} render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-[11px] uppercase text-muted-foreground font-bold">Chuyên đề</FormLabel>
                        <FormControl>
                            <MultiSelect options={topicOptions} selected={field.value || []} onChange={field.onChange} disabled={disabled} placeholder="Tất cả chuyên đề" />
                        </FormControl>
                    </FormItem>
                )}/>
            </div>

            <div className="col-span-6 md:col-span-2">
                <FormField control={control} name={`adHocSections.${sectionIndex}.rules.${ruleIndex}.difficulties`} render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-[11px] uppercase text-muted-foreground font-bold">Độ khó</FormLabel>
                        <FormControl>
                            <MultiSelect options={diffOptions} selected={field.value || []} onChange={field.onChange} disabled={disabled} placeholder="Tất cả" />
                        </FormControl>
                    </FormItem>
                )}/>
            </div>

            {/* SỐ CÂU KẾT HỢP API PREVIEW */}
            <div className="col-span-6 md:col-span-3">
                <FormField control={control} name={`adHocSections.${sectionIndex}.rules.${ruleIndex}.limit`} render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-[11px] uppercase text-muted-foreground font-bold flex items-center justify-between">
                            <span>Số Câu</span>
                            {isFetchingPreview ? (
                                <Loader2 className="w-3 h-3 animate-spin text-primary" />
                            ) : maxAvailable !== undefined ? (
                                <span className={cn("text-[10px] lowercase px-1.5 rounded-sm", maxAvailable === 0 ? "bg-destructive text-destructive-foreground" : "bg-primary/10 text-primary")}>
                                    Max: {maxAvailable}
                                </span>
                            ) : null}
                        </FormLabel>
                        <FormControl>
                            <Input 
                                type="number" 
                                min="1" 
                                // [CTO FIX]: Gắn native max validation. Nếu maxAvailable undefined, để trống.
                                max={maxAvailable !== undefined ? maxAvailable : undefined}
                                disabled={disabled || (watchedFolderIds.length === 0)} 
                                className={cn((maxAvailable !== undefined && watchedLimit > maxAvailable) && "border-destructive focus-visible:ring-destructive")}
                                {...field} 
                                onChange={e => field.onChange(Number(e.target.value))} 
                            />
                        </FormControl>
                        {watchedFolderIds.length === 0 && (
                            <FormDescription className="text-[10px] leading-tight">Vui lòng chọn thư mục trước</FormDescription>
                        )}
                        <FormMessage />
                    </FormItem>
                )}/>
            </div>

            {/* BỘ LỌC TAGS */}
            <div className="col-span-12">
                <FormField control={control} name={`adHocSections.${sectionIndex}.rules.${ruleIndex}.tags`} render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-[11px] uppercase text-muted-foreground font-bold flex items-center">
                            Lọc theo Tags
                            {isFetchingFilters && <Loader2 className="w-3 h-3 ml-2 animate-spin text-primary" />}
                        </FormLabel>
                        <FormControl>
                            <MultiSelect options={tagOptions} selected={field.value || []} onChange={field.onChange} disabled={disabled || isFetchingFilters} placeholder={availableTags.length === 0 ? "Không có Tag nào" : "Chọn Tags..."} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
            </div>

            <Button type="button" variant="destructive" size="icon" className="absolute -top-3 -right-3 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" disabled={disabled || !canRemove} onClick={onRemove}>
                <Trash2 className="w-3 h-3" />
            </Button>
        </div>
    );
}