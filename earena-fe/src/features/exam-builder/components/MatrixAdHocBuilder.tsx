'use client';

import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { FormField, FormItem, FormControl, FormMessage } from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';

import { FillFromMatrixFormValues } from '../types/exam.schema';
import { FolderNode } from '../hooks/useFolders';
import { FlatTopic } from '../hooks/useTopics';
import AdHocRuleItem from './AdHocRuleItem';

interface AdHocRuleListProps {
    paperId: string; // [CTO FIX]: Bổ sung
    sectionIndex: number;
    folders: FolderNode[];
    topics: FlatTopic[];
    disabled: boolean;
}

// --- SUB-COMPONENT: QUẢN LÝ DANH SÁCH CÁC LUẬT (RULES) TRONG 1 SECTION ---
const AdHocRuleList = ({ paperId, sectionIndex, folders, topics, disabled }: AdHocRuleListProps) => {
    const { control } = useFormContext<FillFromMatrixFormValues>();
    const { fields, append, remove } = useFieldArray({
        control,
        name: `adHocSections.${sectionIndex}.rules` as const,
    });

    return (
        <div className="space-y-4">
            {fields.map((field, ruleIndex) => (
                <AdHocRuleItem
                    key={field.id}
                    paperId={paperId} // [CTO FIX]: Truyền paperId xuống AdHocRuleItem
                    sectionIndex={sectionIndex}
                    ruleIndex={ruleIndex}
                    folders={folders}
                    topics={topics}
                    disabled={disabled}
                    onRemove={() => remove(ruleIndex)}
                    canRemove={fields.length > 1}
                />
            ))}
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ limit: 1, folderIds: [], topicIds: [], difficulties: [], tags: [] })}
                disabled={disabled}
                className="bg-white hover:bg-slate-50 text-blue-600 border-blue-200 hover:text-blue-700 font-medium"
            >
                <Plus className="w-4 h-4 mr-2" /> Thêm Luật Bốc
            </Button>
        </div>
    );
};

// --- COMPONENT CHÍNH ---
interface MatrixAdHocBuilderProps {
    paperId: string; // [CTO FIX]: Bổ sung
    folders: FolderNode[];
    topics: FlatTopic[];
    disabled: boolean;
}

export const MatrixAdHocBuilder = ({ paperId, folders, topics, disabled }: MatrixAdHocBuilderProps) => {
    const { control } = useFormContext<FillFromMatrixFormValues>();
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'adHocSections',
    });

    return (
        <div className="space-y-6">
            {fields.map((field, sectionIndex) => (
                <div key={field.id} className="border border-slate-200 bg-white p-5 rounded-xl shadow-sm space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b">
                        <FormField
                            control={control}
                            name={`adHocSections.${sectionIndex}.name`}
                            render={({ field: nameField }) => (
                                <FormItem className="flex-1 max-w-sm">
                                    <FormControl>
                                        <Input
                                            placeholder="Tên phần thi (VD: Trắc nghiệm)"
                                            className="font-bold border-none bg-slate-50 text-lg focus-visible:ring-1"
                                            disabled={disabled}
                                            {...nameField}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            className="text-red-500 hover:bg-red-50 hover:text-red-600 font-medium transition-colors"
                            disabled={disabled || fields.length === 1}
                            onClick={() => remove(sectionIndex)}
                        >
                            <Trash2 className="w-4 h-4 mr-2" /> Xóa Phần Thi
                        </Button>
                    </div>

                    {/* Kết nối với Sub-component quản lý mảng Rule */}
                    <AdHocRuleList
                        paperId={paperId} // [CTO FIX]: Truyền paperId xuống AdHocRuleList
                        sectionIndex={sectionIndex}
                        folders={folders}
                        topics={topics}
                        disabled={disabled}
                    />
                </div>
            ))}

            <Button
                type="button"
                variant="outline"
                className="w-full py-8 border-2 border-dashed border-slate-300 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:border-slate-400 font-bold transition-all"
                disabled={disabled}
                onClick={() => append({
                    name: `Phần ${fields.length + 1}`,
                    orderIndex: fields.length,
                    rules: [{ limit: 1, folderIds: [], topicIds: [], difficulties: [], tags: [] }]
                })}
            >
                <Plus className="w-5 h-5 mr-2 text-slate-400" /> THÊM PHẦN THI MỚI
            </Button>
        </div>
    );
};