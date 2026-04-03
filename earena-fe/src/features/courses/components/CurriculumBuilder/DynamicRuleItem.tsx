'use client';

import React, { useMemo } from 'react';
import { useFormContext, useWatch, Path } from 'react-hook-form';
import { Trash2, FolderTree, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { MultiSelect } from '@/shared/components/ui/multi-select';
import { TreeSelectMulti } from '@/features/exam-builder/components/TreeSelectMulti';

import { useDebounce } from '@/shared/hooks/useDebounce';
import { cn } from '@/shared/lib/utils';
import { CreateQuizLessonDTO } from '../../types/curriculum.schema';
import { useRuleHealthCheck } from '../../hooks/useRuleHealthCheck';

interface DynamicRuleItemProps {
    sectionIndex: number;
    ruleIndex: number;
    folders: any[];
    topics: any[];
    activeFilters: any;
    disabled: boolean;
    onRemove: () => void;
    canRemove: boolean;
}

export function DynamicRuleItem({
    sectionIndex,
    ruleIndex,
    folders,
    topics,
    activeFilters, // Đã được fetch sẵn 1 lần từ Cha, truyền xuống đây
    disabled,
    onRemove,
    canRemove
}: DynamicRuleItemProps) {
    const { control } = useFormContext<CreateQuizLessonDTO>();
    const basePath = `dynamicConfig.adHocSections.${sectionIndex}.rules.${ruleIndex}` as const;

    // 1. Lấy dữ liệu Real-time từ Form
    const watchedRule = useWatch({ control, name: basePath });
    
    // 2. Chuẩn bị payload cho Backend (Debounce để không bị DdoS)
    const rulePayload = useMemo(() => ({
        folderIds: watchedRule?.folderIds || [],
        topicIds: watchedRule?.topicIds || [],
        difficulties: watchedRule?.difficulties || [],
        tags: watchedRule?.tags || [],
        limit: watchedRule?.limit || 1
    }), [watchedRule]);

    const debouncedPayload = useDebounce(rulePayload, 600);

    // 3. Gọi Hook Health Check để lấy tình trạng Kho câu hỏi
    const isReadyToCheck = debouncedPayload.folderIds.length > 0;
    const { data: healthData, isFetching: isChecking } = useRuleHealthCheck(isReadyToCheck ? debouncedPayload : null);

    // 4. Xác định trạng thái UI dựa vào Business Rules
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

    // Options tĩnh lấy từ Cha
    const topicOptions = topics.map(t => ({ label: t.path, value: t.id }));
    const diffOptions = [
        { label: 'Nhận biết', value: 'NB' }, { label: 'Thông hiểu', value: 'TH' }, 
        { label: 'Vận dụng', value: 'VD' }, { label: 'Vận dụng cao', value: 'VDC' }
    ];
    const tagOptions = (activeFilters?.tags || []).map((tag: string) => ({ label: tag, value: tag }));

    return (
        <div className={cn(
            "grid grid-cols-12 gap-4 items-start bg-white border p-4 rounded-xl relative group transition-all shadow-sm",
            healthStatus === 'ERROR' && "border-red-400 bg-red-50/30",
            healthStatus === 'WARNING' && "border-amber-300 bg-amber-50/30",
            healthStatus === 'HEALTHY' && "border-green-300"
        )}>
            {/* Folder Select - BẮT BUỘC */}
            <div className="col-span-12 md:col-span-3">
                <FormField control={control} name={`${basePath}.folderIds` as const} render={({ field }) => (
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
            
            {/* Chuyên Đề - OPTIONAL */}
            <div className="col-span-12 md:col-span-4">
                <FormField control={control} name={`${basePath}.topicIds` as const} render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-[11px] uppercase text-muted-foreground font-bold">Chuyên đề (Tùy chọn)</FormLabel>
                        <FormControl>
                            <MultiSelect options={topicOptions} selected={field.value || []} onChange={field.onChange} disabled={disabled} placeholder="Tất cả chuyên đề" />
                        </FormControl>
                    </FormItem>
                )}/>
            </div>

            {/* Độ Khó - OPTIONAL */}
            <div className="col-span-6 md:col-span-2">
                <FormField control={control} name={`${basePath}.difficulties` as const} render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-[11px] uppercase text-muted-foreground font-bold">Độ khó (Tùy chọn)</FormLabel>
                        <FormControl>
                            <MultiSelect options={diffOptions} selected={field.value || []} onChange={field.onChange} disabled={disabled} placeholder="Trộn ngẫu nhiên" />
                        </FormControl>
                    </FormItem>
                )}/>
            </div>

            {/* Số Lượng & Cảnh Báo - BẮT BUỘC */}
            <div className="col-span-6 md:col-span-3">
                <FormField control={control} name={`${basePath}.limit` as const} render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-[11px] uppercase text-muted-foreground font-bold flex items-center justify-between">
                            <span>Số Lượng <span className="text-red-500">*</span></span>
                        </FormLabel>
                        <div className="flex items-center gap-2">
                            <FormControl>
                                <Input type="number" min="1" disabled={disabled} {...field} onChange={e => field.onChange(Number(e.target.value))} className="h-10 w-20 text-center font-bold text-lg"/>
                            </FormControl>
                            
                            {/* [CTO UX]: Indicator sức khỏe */}
                            <div className="flex-1 flex flex-col justify-center">
                                {healthStatus === 'IDLE' && <span className="text-xs text-muted-foreground">Chọn thư mục</span>}
                                {healthStatus === 'CHECKING' && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
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

            <Button type="button" variant="ghost" size="icon" className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-red-100 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-red-200" disabled={disabled || !canRemove} onClick={onRemove}>
                <Trash2 className="w-3.5 h-3.5" />
            </Button>
        </div>
    );
}