'use client';

import React, { useEffect, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Trash2, FolderTree, Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { MultiSelect } from '@/shared/components/ui/multi-select';
import { TreeSelectMulti } from '@/features/exam-builder/components/TreeSelectMulti';

import { FolderNode } from '@/features/exam-builder/hooks/useFolders';
import { FlatTopic } from '@/features/exam-builder/hooks/useTopics';
import { useActiveFilters } from '@/features/exam-builder/hooks/useActiveFilters';
import { useDynamicPreview } from '../../hooks/useDynamicPreview';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { cn } from '@/shared/lib/utils';
import { MatrixRuleDTO } from '@/features/exam-builder/types/exam.schema';
import { UpdateLessonDTO } from '../../types/curriculum.schema';

interface DynamicRuleItemProps {
    sectionIndex: number;
    ruleIndex: number;
    folders: FolderNode[];
    topics: FlatTopic[];
    disabled: boolean;
    onRemove: () => void;
    canRemove: boolean;
}

export function DynamicRuleItem({
    sectionIndex,
    ruleIndex,
    folders,
    topics,
    disabled,
    onRemove,
    canRemove
}: DynamicRuleItemProps) {
    // Ép kiểu chuẩn xác UpdateLessonDTO, nhưng dùng as any cho các path sâu để vượt qua RHF Type Inference Issue
    const { control, setValue, getValues, setError, clearErrors } = useFormContext<UpdateLessonDTO>();
    
    const basePath = `dynamicConfig.adHocSections.${sectionIndex}.rules.${ruleIndex}` as any;

    const watchedFolderIds = useWatch({ control, name: `${basePath}.folderIds` }) || [];
    const watchedTopicIds = useWatch({ control, name: `${basePath}.topicIds` }) || [];
    const watchedDifficulties = useWatch({ control, name: `${basePath}.difficulties` }) || [];
    const watchedTags = useWatch({ control, name: `${basePath}.tags` }) || [];
    const watchedLimit = useWatch({ control, name: `${basePath}.limit` }) || 1;

    const rulePayload: MatrixRuleDTO = useMemo(() => ({
        folderIds: watchedFolderIds,
        topicIds: watchedTopicIds,
        difficulties: watchedDifficulties,
        tags: watchedTags,
        limit: watchedLimit
    }), [watchedFolderIds, watchedTopicIds, watchedDifficulties, watchedTags, watchedLimit]);

    const debouncedPayload = useDebounce(rulePayload, 500);

    // [CTO FIX 1]: Loại bỏ trường 'limit' ra khỏi payload ném lên Active Filters để BE không chửi
    const filterPayload = useMemo(() => {
        const { limit: _ignored, ...rest } = debouncedPayload;
        return rest;
    }, [debouncedPayload]);

    const { data: rawFilterData, isFetching: isFetchingFilters } = useActiveFilters({
        ...filterPayload,
        isDraft: false, 
    });

    // [CTO FIX 2]: Gói payload chạy thử vào đúng cấu trúc `adHocSections` mà BE yêu cầu
    const previewRequest = useMemo(() => {
        if (!debouncedPayload.folderIds || debouncedPayload.folderIds.length === 0) return null;
        return { 
            adHocSections: [{
                name: 'Temp Section',
                orderIndex: 0,
                rules: [debouncedPayload]
            }] 
        };
    }, [debouncedPayload]);

    const { data: rawPreviewData, isFetching: isFetchingPreview } = useDynamicPreview(previewRequest);

    // [CTO FIX 3]: Xử lý bẫy Axios Unwrap (Luôn lấy đúng data dù có bị lột vỏ hay chưa)
    const actualFilterData = (rawFilterData as any)?.data || rawFilterData;
    const actualPreviewData = (rawPreviewData as any)?.data || rawPreviewData;

    const availableFolderIds = actualFilterData?.folders?.map((f: any) => f.id || f._id) || actualFilterData?.folderIds;
    const availableTags = actualFilterData?.tags || [];
    const maxAvailable = actualPreviewData?.totalActualQuestions;

    // AUTO-CLEARING BẪY CHỐNG INFINITE LOOP
    useEffect(() => {
        if (!actualFilterData) return;

        const currentFolderIds = getValues(`${basePath}.folderIds`) || [];
        const currentTags = getValues(`${basePath}.tags`) || [];

        if (currentFolderIds.length > 0 && availableFolderIds) {
            const validFolderIds = currentFolderIds.filter((id: string) => availableFolderIds.includes(id));
            if (validFolderIds.join(',') !== currentFolderIds.join(',')) {
                setValue(`${basePath}.folderIds`, validFolderIds, { shouldValidate: true });
            }
        }

        if (currentTags.length > 0) {
            const validTags = currentTags.filter((tag: string) => availableTags.includes(tag));
            if (validTags.join(',') !== currentTags.join(',')) {
                setValue(`${basePath}.tags`, validTags, { shouldValidate: true });
            }
        }
    }, [actualFilterData, availableFolderIds, availableTags, basePath, setValue, getValues]);

    useEffect(() => {
        if (maxAvailable !== undefined) {
            if (watchedLimit > maxAvailable) {
                setError(`${basePath}.limit`, { type: 'manual', message: `Kho chỉ còn ${maxAvailable} câu` });
            } else if (watchedLimit <= 0) {
                setError(`${basePath}.limit`, { type: 'manual', message: 'Lớn hơn 0' });
            } else {
                clearErrors(`${basePath}.limit`);
            }
        }
    }, [maxAvailable, watchedLimit, basePath, setError, clearErrors]);

    // Dữ liệu Selectors
    const validTopicIds = useMemo(() => {
        if (!actualFilterData?.topics) return null; 
        const ids = new Set<string>();
        const extractIds = (nodes: any[]) => {
            nodes.forEach(node => {
                // [CTO FIX 4]: Bắt cả _id và id đề phòng BE trả về bất nhất
                ids.add(node.id || node._id); 
                if (node.children && node.children.length > 0) extractIds(node.children);
            });
        };
        extractIds(actualFilterData.topics);
        return ids;
    }, [actualFilterData?.topics]);

    const topicOptions = useMemo(() => {
        return topics.map(t => ({ 
            label: t.path, 
            value: t.id,
            disabled: validTopicIds ? !validTopicIds.has(t.id) : false
        }));
    }, [topics, validTopicIds]);

    const diffOptions = useMemo(() => {
        const baseOptions = [{ label: 'Nhận biết', value: 'NB' }, { label: 'Thông hiểu', value: 'TH' }, { label: 'Vận dụng', value: 'VD' }, { label: 'Vận dụng cao', value: 'VDC' }];
        if (!actualFilterData?.difficulties) return baseOptions;
        return baseOptions.map(opt => ({ ...opt, disabled: !actualFilterData.difficulties.includes(opt.value) }));
    }, [actualFilterData?.difficulties]);

    const tagOptions = useMemo(() => {
        const allVisibleTags = Array.from(new Set([...availableTags, ...watchedTags]));
        return allVisibleTags.map(tag => ({ 
            label: tag, value: tag, disabled: actualFilterData?.tags ? !actualFilterData.tags.includes(tag) : false
        }));
    }, [availableTags, watchedTags, actualFilterData?.tags]);

    return (
        <div className={cn("grid grid-cols-12 gap-4 items-start bg-slate-50 border p-4 rounded-xl relative group transition-all", maxAvailable === 0 && "border-destructive/50 bg-destructive/5")}>
            <div className="col-span-12 md:col-span-3">
                <FormField control={control} name={`${basePath}.folderIds`} render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-[11px] uppercase text-muted-foreground font-bold flex items-center"><FolderTree className="w-3 h-3 mr-1" /> Thư mục</FormLabel>
                        <FormControl><TreeSelectMulti data={folders} selectedIds={field.value || []} onChange={field.onChange} disabled={disabled} availableIds={availableFolderIds} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
            </div>
            
            <div className="col-span-12 md:col-span-4">
                <FormField control={control} name={`${basePath}.topicIds`} render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-[11px] uppercase text-muted-foreground font-bold">Chuyên đề</FormLabel>
                        <FormControl><MultiSelect options={topicOptions} selected={field.value || []} onChange={field.onChange} disabled={disabled} placeholder="Tất cả chuyên đề" /></FormControl>
                    </FormItem>
                )}/>
            </div>

            <div className="col-span-6 md:col-span-2">
                <FormField control={control} name={`${basePath}.difficulties`} render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-[11px] uppercase text-muted-foreground font-bold">Độ khó</FormLabel>
                        <FormControl><MultiSelect options={diffOptions} selected={field.value || []} onChange={field.onChange} disabled={disabled} placeholder="Tất cả" /></FormControl>
                    </FormItem>
                )}/>
            </div>

            <div className="col-span-6 md:col-span-3">
                <FormField control={control} name={`${basePath}.limit`} render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-[11px] uppercase text-muted-foreground font-bold flex items-center justify-between">
                            <span>Số Câu</span>
                            {isFetchingPreview ? <Loader2 className="w-3 h-3 animate-spin text-primary" /> : maxAvailable !== undefined ? <span className={cn("text-[10px] lowercase px-1.5 rounded-sm", maxAvailable === 0 ? "bg-destructive text-destructive-foreground" : "bg-primary/10 text-primary")}>Max: {maxAvailable}</span> : null}
                        </FormLabel>
                        <FormControl><Input type="number" min="1" max={maxAvailable !== undefined ? maxAvailable : undefined} disabled={disabled || (watchedFolderIds.length === 0)} {...field} onChange={e => field.onChange(Number(e.target.value))} className="h-10"/></FormControl>
                        {watchedFolderIds.length === 0 && <p className="text-[10px] text-muted-foreground leading-tight">Vui lòng chọn thư mục trước</p>}
                        <FormMessage />
                    </FormItem>
                )}/>
            </div>
            
            <div className="col-span-12">
                <FormField control={control} name={`${basePath}.tags`} render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-[11px] uppercase text-muted-foreground font-bold flex items-center">
                            Lọc theo Tags {isFetchingFilters && <Loader2 className="w-3 h-3 ml-2 animate-spin text-primary" />}
                        </FormLabel>
                        <FormControl><MultiSelect options={tagOptions} selected={field.value || []} onChange={field.onChange} disabled={disabled || isFetchingFilters} placeholder={availableTags.length === 0 ? "Không có Tag nào" : "Chọn Tags..."} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
            </div>

            <Button type="button" variant="destructive" size="icon" className="absolute -top-3 -right-3 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm" disabled={disabled || !canRemove} onClick={onRemove}>
                <Trash2 className="w-3 h-3" />
            </Button>
        </div>
    );
}