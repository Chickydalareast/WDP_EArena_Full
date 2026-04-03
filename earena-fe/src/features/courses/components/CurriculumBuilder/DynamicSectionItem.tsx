'use client';

import React, { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Trash2, FolderTree, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { MultiSelect } from '@/shared/components/ui/multi-select';
import { TreeSelectMulti } from '@/features/exam-builder/components/TreeSelectMulti';

import { FolderNode } from '@/features/exam-builder/hooks/useFolders';
import { FlatTopic } from '@/features/exam-builder/hooks/useTopics';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { cn } from '@/shared/lib/utils';
import { CreateQuizLessonDTO } from '../../types/curriculum.schema';
import { useQuizRuleHealth } from '../../hooks/useQuizRuleHealth';
import { useActiveFilters } from '@/features/exam-builder/hooks/useActiveFilters';

interface DynamicSectionItemProps {
    sectionIndex: number;
    folders: FolderNode[];
    topics: FlatTopic[];
    activeFilters: any; // Global filters từ Root truyền xuống (Fallback)
    disabled: boolean;
    onRemove: () => void;
    canRemove: boolean;
}

export function DynamicSectionItem({
    sectionIndex,
    folders,
    topics,
    activeFilters,
    disabled,
    onRemove,
    canRemove
}: DynamicSectionItemProps) {
    const { control } = useFormContext<CreateQuizLessonDTO>();
    
    const namePath = `dynamicConfig.adHocSections.${sectionIndex}.name` as const;
    const rulePath = `dynamicConfig.adHocSections.${sectionIndex}.rules.0` as const;

    const watchedRule = useWatch({ control, name: rulePath });
    
    const rulePayload = useMemo(() => ({
        folderIds: watchedRule?.folderIds || [],
        topicIds: watchedRule?.topicIds || [],
        difficulties: watchedRule?.difficulties || [],
        tags: watchedRule?.tags || [],
        limit: watchedRule?.limit || 1
    }), [watchedRule]);

    const debouncedPayload = useDebounce(rulePayload, 500);

    // 1. KIỂM TRA SỨC KHỎE (HEALTH CHECK)
    const isReadyToCheck = debouncedPayload.folderIds.length > 0;
    const { data: healthData, isFetching: isChecking } = useQuizRuleHealth(isReadyToCheck ? debouncedPayload : null);

    const isSufficient = healthData?.isSufficient ?? true;
    const safetyRatio = healthData?.safetyRatio ?? 1.0;
    const available = healthData?.availableCount ?? 0;

    const healthStatus = useMemo(() => {
        if (!isReadyToCheck) return 'IDLE';
        if (isChecking) return 'CHECKING';
        if (!isSufficient) return 'ERROR';
        if (safetyRatio < 1.5) return 'WARNING';
        return 'HEALTHY';
    }, [isReadyToCheck, isChecking, isSufficient, safetyRatio]);

    // 2. LỌC CHÉO ĐA CHIỀU (FULL CASCADE FILTERING)
    // [CTO FIX]: Bao gồm TOÀN BỘ các trường vào payload để backend lọc giao (intersection)
    const filterPayload = useMemo(() => {
        const payload: any = { isDraft: false };
        if (debouncedPayload.folderIds.length > 0) payload.folderIds = debouncedPayload.folderIds;
        if (debouncedPayload.topicIds.length > 0) payload.topicIds = debouncedPayload.topicIds;
        if (debouncedPayload.difficulties.length > 0) payload.difficulties = debouncedPayload.difficulties;
        if (debouncedPayload.tags.length > 0) payload.tags = debouncedPayload.tags;
        return payload;
    }, [debouncedPayload.folderIds, debouncedPayload.topicIds, debouncedPayload.difficulties, debouncedPayload.tags]);

    // Kích hoạt Local Fetch nếu có BẤT KỲ filter nào được chọn
    const hasAnyFilter = Object.keys(filterPayload).length > 1; // Lớn hơn 1 vì luôn có isDraft

    const { data: rawLocalFilters, isFetching: isFetchingLocalFilters } = useActiveFilters(
        hasAnyFilter ? filterPayload : (null as any) // Ép null để ngắt query nếu không có filter
    );
    
    const localFilters = (rawLocalFilters as any)?.data || rawLocalFilters;

    // Ưu tiên dùng LocalFilters nếu đang có filter, ngược lại fallback về GlobalFilters
    const effectiveFilters = (hasAnyFilter && localFilters) ? localFilters : activeFilters;

    // 3. TẠO OPTION DROP-DOWN (ẨN OPTION KHÔNG TỒN TẠI)
    const topicOptions = useMemo(() => {
        if (!effectiveFilters?.topics) return topics.map(t => ({ label: t.path, value: t.id }));
        const validIds = new Set<string>(effectiveFilters.topics.map((t: any) => t.id || t._id));
        return topics.filter(t => validIds.has(t.id)).map(t => ({ label: t.path, value: t.id }));
    }, [topics, effectiveFilters?.topics]);

    const diffOptions = useMemo(() => {
        const baseOptions = [
            { label: 'Nhận biết', value: 'NB' }, { label: 'Thông hiểu', value: 'TH' }, 
            { label: 'Vận dụng', value: 'VD' }, { label: 'Vận dụng cao', value: 'VDC' }
        ];
        if (!effectiveFilters?.difficulties) return baseOptions;
        return baseOptions.filter(opt => effectiveFilters.difficulties.includes(opt.value));
    }, [effectiveFilters?.difficulties]);

    const tagOptions = useMemo(() => {
        const tags = effectiveFilters?.tags || [];
        return tags.map((tag: string) => ({ label: tag, value: tag }));
    }, [effectiveFilters?.tags]);

    return (
        <div className={cn(
            "bg-white border p-5 rounded-xl relative group transition-all shadow-sm space-y-5",
            healthStatus === 'ERROR' ? "border-red-400 bg-red-50/30" : "border-purple-200"
        )}>
            <div className="flex justify-between items-center pb-2 border-b border-purple-100/50">
                <FormField control={control} name={namePath} render={({ field }) => (
                    <FormItem className="flex-1 max-w-sm">
                        <FormControl>
                            <Input {...field} placeholder="Tên phần thi (VD: Phần Đọc Hiểu)" className="font-bold border-none bg-transparent text-purple-900 text-lg px-0 focus-visible:ring-0 shadow-none" disabled={disabled} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
                <Button type="button" variant="ghost" className="text-red-500 hover:bg-red-50 hover:text-red-600 font-medium" disabled={disabled || !canRemove} onClick={onRemove}>
                    <Trash2 className="w-4 h-4 mr-2" /> Xóa Phần Này
                </Button>
            </div>

            <div className="grid grid-cols-12 gap-4 items-start">
                <div className="col-span-12 md:col-span-3">
                    <FormField control={control} name={`${rulePath}.folderIds` as const} render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-[11px] uppercase text-muted-foreground font-bold flex items-center">
                                <FolderTree className="w-3 h-3 mr-1" /> Thư mục <span className="text-red-500 ml-1">*</span>
                            </FormLabel>
                            <FormControl>
                                <TreeSelectMulti data={folders} selectedIds={field.value || []} onChange={field.onChange} disabled={disabled} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                </div>
                
                <div className="col-span-12 md:col-span-4">
                    <FormField control={control} name={`${rulePath}.topicIds` as const} render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-[11px] uppercase text-muted-foreground font-bold">
                                Chuyên đề {isFetchingLocalFilters && <Loader2 className="w-3 h-3 ml-2 animate-spin inline-block text-purple-500" />}
                            </FormLabel>
                            <FormControl>
                                <MultiSelect options={topicOptions} selected={field.value || []} onChange={field.onChange} disabled={disabled || isFetchingLocalFilters} placeholder={topicOptions.length ? "Tất cả chuyên đề" : "Không có chuyên đề"} />
                            </FormControl>
                        </FormItem>
                    )}/>
                </div>

                <div className="col-span-6 md:col-span-2">
                    <FormField control={control} name={`${rulePath}.difficulties` as const} render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-[11px] uppercase text-muted-foreground font-bold">
                                Độ khó {isFetchingLocalFilters && <Loader2 className="w-3 h-3 ml-2 animate-spin inline-block text-purple-500" />}
                            </FormLabel>
                            <FormControl>
                                <MultiSelect options={diffOptions} selected={field.value || []} onChange={field.onChange} disabled={disabled || isFetchingLocalFilters} placeholder={diffOptions.length ? "Ngẫu nhiên" : "Trống"} />
                            </FormControl>
                        </FormItem>
                    )}/>
                </div>

                <div className="col-span-6 md:col-span-3">
                    <FormField control={control} name={`${rulePath}.limit` as const} render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-[11px] uppercase text-muted-foreground font-bold flex items-center justify-between">
                                <span>Số Lượng <span className="text-red-500">*</span></span>
                            </FormLabel>
                            <div className="flex items-center gap-2">
                                <FormControl>
                                    <Input type="number" min="1" disabled={disabled} {...field} onChange={e => field.onChange(Number(e.target.value))} className="h-10 w-20 text-center font-bold text-lg"/>
                                </FormControl>
                                
                                <div className="flex-1 flex flex-col justify-center">
                                    {healthStatus === 'IDLE' && <span className="text-xs text-muted-foreground">Chọn thư mục</span>}
                                    {healthStatus === 'CHECKING' && <Loader2 className="w-4 h-4 animate-spin text-purple-500" />}
                                    {healthStatus === 'HEALTHY' && (
                                        <div className="text-[10px] leading-tight font-bold text-green-600 flex flex-col"><CheckCircle2 className="w-3 h-3 inline mr-1"/>Kho: {available} câu</div>
                                    )}
                                    {healthStatus === 'WARNING' && (
                                        <div className="text-[10px] leading-tight font-bold text-amber-600 flex flex-col" title="Cần bổ sung thêm câu hỏi để tránh trùng đề">
                                            <AlertCircle className="w-3 h-3 inline mr-1"/>Kho: {available} câu
                                        </div>
                                    )}
                                    {healthStatus === 'ERROR' && (
                                        <div className="text-[10px] leading-tight font-bold text-red-600 flex flex-col" title={`Thiếu ${debouncedPayload.limit - available} câu`}>
                                            <AlertCircle className="w-3 h-3 inline mr-1"/>Chỉ có {available} câu
                                        </div>
                                    )}
                                </div>
                            </div>
                        </FormItem>
                    )}/>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12">
                    <FormField control={control} name={`${rulePath}.tags` as const} render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-[11px] uppercase text-muted-foreground font-bold flex items-center">
                                Lọc theo Tags (Phân cách bởi dấu phẩy)
                            </FormLabel>
                            <FormControl>
                                <MultiSelect options={tagOptions} selected={field.value || []} onChange={field.onChange} disabled={disabled || isFetchingLocalFilters} placeholder={tagOptions.length ? "Bỏ trống nếu không lọc" : "Không có tag nào trong kho"} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                </div>
            </div>
        </div>
    );
}