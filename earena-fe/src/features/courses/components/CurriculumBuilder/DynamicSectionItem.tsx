'use client';

import React, { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Trash2, FolderTree, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { MultiSelect } from '@/shared/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
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
    activeFilters: any;
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
    const { control, setValue } = useFormContext<CreateQuizLessonDTO>();

    const namePath = `dynamicConfig.adHocSections.${sectionIndex}.name` as const;
    const rulePath = `dynamicConfig.adHocSections.${sectionIndex}.rules.0` as const;

    const watchedRule = useWatch({ control, name: rulePath });

    const rulePayload = useMemo(() => ({
        questionType: watchedRule?.questionType || 'FLAT',
        folderIds: watchedRule?.folderIds || [],
        topicIds: watchedRule?.topicIds || [],
        difficulties: watchedRule?.difficulties || [],
        tags: watchedRule?.tags || [],
        limit: watchedRule?.limit || 1,
        subQuestionLimit: watchedRule?.subQuestionLimit
    }), [watchedRule]);

    const debouncedPayload = useDebounce(rulePayload, 500);

    // [CTO FIX]: Cập nhật Logic Sync State để khớp tuyệt đối với Cờ enabled của React Query
    const isMissingSubLimit = debouncedPayload.questionType === 'PASSAGE' &&
        (!debouncedPayload.subQuestionLimit || debouncedPayload.subQuestionLimit < 1);

    const isReadyToCheck = debouncedPayload.folderIds.length > 0 &&
        debouncedPayload.limit > 0 &&
        !isMissingSubLimit;

    const { data: healthData, isFetching: isChecking } = useQuizRuleHealth(isReadyToCheck ? debouncedPayload : null);

    const isSufficient = healthData?.isSufficient ?? true;
    const safetyRatio = healthData?.safetyRatio ?? 1.0;
    const available = healthData?.availableCount ?? 0;

    // [CTO FIX]: Bổ sung trạng thái WAITING_INPUT
    const healthStatus = useMemo(() => {
        if (debouncedPayload.folderIds.length === 0 || debouncedPayload.limit < 1) return 'IDLE';
        if (isMissingSubLimit) return 'WAITING_INPUT';
        if (isChecking) return 'CHECKING';
        if (!isSufficient) return 'ERROR';
        if (safetyRatio < 1.5) return 'WARNING';
        return 'HEALTHY';
    }, [debouncedPayload.folderIds.length, debouncedPayload.limit, isMissingSubLimit, isChecking, isSufficient, safetyRatio]);

    const filterPayload = useMemo(() => {
        const payload: any = { isDraft: false };
        if (debouncedPayload.questionType) payload.questionType = debouncedPayload.questionType;
        if (debouncedPayload.folderIds.length > 0) payload.folderIds = debouncedPayload.folderIds;
        if (debouncedPayload.topicIds.length > 0) payload.topicIds = debouncedPayload.topicIds;
        if (debouncedPayload.difficulties.length > 0) payload.difficulties = debouncedPayload.difficulties;
        if (debouncedPayload.tags.length > 0) payload.tags = debouncedPayload.tags;
        return payload;
    }, [debouncedPayload]);

    const hasAnyFilter = Object.keys(filterPayload).length > 1;

    const { data: rawLocalFilters, isFetching: isFetchingLocalFilters } = useActiveFilters(
        hasAnyFilter ? filterPayload : (null as any)
    );

    const localFilters = (rawLocalFilters as any)?.data || rawLocalFilters;
    const effectiveFilters = (hasAnyFilter && localFilters) ? localFilters : activeFilters;

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
            healthStatus === 'ERROR' ? "border-red-400 bg-red-50/30" : "border-primary/20"
        )}>
            {/* Header Phần thi */}
            <div className="flex justify-between items-center pb-2 border-b border-primary/10">
                <FormField control={control} name={namePath} render={({ field }) => (
                    <FormItem className="flex-1 max-w-sm">
                        <FormControl>
                            <Input {...field} placeholder="Tên phần thi (VD: Phần Đọc Hiểu)" className="font-bold border-none bg-transparent text-slate-800 text-lg px-0 focus-visible:ring-0 shadow-none" disabled={disabled} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <Button type="button" variant="ghost" className="text-red-500 hover:bg-red-50 hover:text-red-600 font-medium" disabled={disabled || !canRemove} onClick={onRemove}>
                    <Trash2 className="w-4 h-4 mr-2" /> Xóa Phần Này
                </Button>
            </div>

            {/* [MAX PING UX] ROW 1: SETUP CƠ BẢN (Loại câu, Giới hạn, Số câu con) */}
            <div className="grid grid-cols-12 gap-5 items-start">
                <div className="col-span-12 md:col-span-4">
                    <FormField control={control} name={`${rulePath}.questionType` as const} render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-[11px] uppercase text-slate-500 font-bold">Loại Câu Hỏi <span className="text-primary">*</span></FormLabel>
                            <Select disabled={disabled} value={field.value || 'FLAT'} onValueChange={(val) => {
                                field.onChange(val);
                                if (val === 'FLAT') {
                                    setValue(`${rulePath}.subQuestionLimit`, undefined as any, { shouldValidate: true });
                                }
                            }}>
                                <FormControl>
                                    <SelectTrigger className="h-10 focus:ring-primary/50">
                                        <SelectValue placeholder="Chọn loại câu" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="FLAT">Câu hỏi đơn lẻ (FLAT)</SelectItem>
                                    <SelectItem value="PASSAGE">Bài đọc đoạn văn (PASSAGE)</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>

                <div className="col-span-6 md:col-span-4">
                    <FormField control={control} name={`${rulePath}.limit` as const} render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-[11px] uppercase text-slate-500 font-bold flex items-center justify-between">
                                <span>{watchedRule?.questionType === 'PASSAGE' ? 'Số Bài Đọc' : 'Số Câu Hỏi'} <span className="text-primary">*</span></span>
                            </FormLabel>
                            <div className="flex items-center gap-2">
                                <FormControl>
                                    <Input type="number" min="1" disabled={disabled} {...field} onChange={e => field.onChange(Number(e.target.value))} className="h-10 w-20 text-center font-bold text-lg focus-visible:ring-primary/50" />
                                </FormControl>

                                <div className="flex-1 flex flex-col justify-center">
                                    {healthStatus === 'IDLE' && <span className="text-xs text-slate-400">Chọn cấu hình</span>}
                                    {healthStatus === 'WAITING_INPUT' && (
                                        <div className="text-[10px] leading-tight font-bold text-amber-600 flex flex-col" title="Cần nhập số câu hỏi con">
                                            <AlertCircle className="w-3 h-3 inline mr-1" />Nhập số câu con
                                        </div>
                                    )}
                                    {healthStatus === 'CHECKING' && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                                    {healthStatus === 'HEALTHY' && (
                                        <div className="text-[10px] leading-tight font-bold text-green-600 flex flex-col"><CheckCircle2 className="w-3 h-3 inline mr-1" />Kho: {available} câu</div>
                                    )}
                                    {healthStatus === 'WARNING' && (
                                        <div className="text-[10px] leading-tight font-bold text-amber-600 flex flex-col" title="Cần bổ sung thêm câu hỏi để tránh trùng đề">
                                            <AlertCircle className="w-3 h-3 inline mr-1" />Kho: {available} câu
                                        </div>
                                    )}
                                    {healthStatus === 'ERROR' && (
                                        <div className="text-[10px] leading-tight font-bold text-red-600 flex flex-col" title={`Thiếu ${debouncedPayload.limit - available} câu`}>
                                            <AlertCircle className="w-3 h-3 inline mr-1" />Chỉ có {available} câu
                                        </div>
                                    )}
                                </div>
                            </div>
                        </FormItem>
                    )} />
                </div>

                {watchedRule?.questionType === 'PASSAGE' && (
                    <div className="col-span-6 md:col-span-4">
                        <FormField control={control} name={`${rulePath}.subQuestionLimit` as const} render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-[11px] uppercase text-slate-500 font-bold flex items-center">
                                    Số Câu Con / 1 Bài <span className="text-primary ml-1">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input type="number" min="1" disabled={disabled} {...field} value={field.value || ''} onChange={e => field.onChange(Number(e.target.value))} className="h-10 w-full font-bold focus-visible:ring-primary/50" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                )}
            </div>

            {/* [MAX PING UX] ROW 2: NGUỒN DATA (Thư mục & Chuyên đề) */}
            <div className="grid grid-cols-12 gap-5 items-start">
                <div className="col-span-12 md:col-span-6">
                    <FormField control={control} name={`${rulePath}.folderIds` as const} render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-[11px] uppercase text-slate-500 font-bold flex items-center">
                                <FolderTree className="w-3 h-3 mr-1" /> Thư mục nguồn <span className="text-primary ml-1">*</span>
                            </FormLabel>
                            <FormControl>
                                <TreeSelectMulti data={folders} selectedIds={field.value || []} onChange={field.onChange} disabled={disabled} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>

                <div className="col-span-12 md:col-span-6">
                    <FormField control={control} name={`${rulePath}.topicIds` as const} render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-[11px] uppercase text-slate-500 font-bold">
                                Chuyên đề {isFetchingLocalFilters && <Loader2 className="w-3 h-3 ml-2 animate-spin inline-block text-primary" />}
                            </FormLabel>
                            <FormControl>
                                <MultiSelect options={topicOptions} selected={field.value || []} onChange={field.onChange} disabled={disabled || isFetchingLocalFilters} placeholder={topicOptions.length ? "Tất cả chuyên đề" : "Không có chuyên đề"} />
                            </FormControl>
                        </FormItem>
                    )} />
                </div>
            </div>

            {/* [MAX PING UX] ROW 3: BỘ LỌC (Độ khó & Tags) */}
            <div className="grid grid-cols-12 gap-5 items-start">
                <div className="col-span-12 md:col-span-4">
                    <FormField control={control} name={`${rulePath}.difficulties` as const} render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-[11px] uppercase text-slate-500 font-bold">
                                Độ khó {isFetchingLocalFilters && <Loader2 className="w-3 h-3 ml-2 animate-spin inline-block text-primary" />}
                            </FormLabel>
                            <FormControl>
                                <MultiSelect options={diffOptions} selected={field.value || []} onChange={field.onChange} disabled={disabled || isFetchingLocalFilters} placeholder={diffOptions.length ? "Ngẫu nhiên" : "Trống"} />
                            </FormControl>
                        </FormItem>
                    )} />
                </div>

                <div className="col-span-12 md:col-span-8">
                    <FormField control={control} name={`${rulePath}.tags` as const} render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-[11px] uppercase text-slate-500 font-bold flex items-center">
                                Lọc theo Tags (Phân cách bởi dấu phẩy)
                            </FormLabel>
                            <FormControl>
                                <MultiSelect options={tagOptions} selected={field.value || []} onChange={field.onChange} disabled={disabled || isFetchingLocalFilters} placeholder={tagOptions.length ? "Bỏ trống nếu không lọc" : "Không có tag nào trong kho"} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
            </div>
        </div>
    );
}