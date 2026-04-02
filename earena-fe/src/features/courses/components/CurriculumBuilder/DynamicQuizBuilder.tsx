'use client';

import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { FormField, FormItem, FormControl, FormMessage } from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';

import { UpdateLessonDTO } from '../../types/curriculum.schema';
import { FolderNode } from '@/features/exam-builder/hooks/useFolders';
import { FlatTopic } from '@/features/exam-builder/hooks/useTopics';
import { DynamicRuleList } from './DynamicRuleList';

interface DynamicQuizBuilderProps {
    folders: FolderNode[];
    topics: FlatTopic[];
    disabled: boolean;
}

export function DynamicQuizBuilder({ folders, topics, disabled }: DynamicQuizBuilderProps) {
    const { control } = useFormContext<UpdateLessonDTO>();
    const { fields, append, remove } = useFieldArray({
        control,
        // Type assert chính xác path của RHF để tránh lỗi Type Inference
        name: 'dynamicConfig.adHocSections' as any,
    });

    return (
        <div className="space-y-6">
            {fields.map((field, sectionIndex) => (
                <div key={field.id} className="border border-purple-200 bg-white p-5 rounded-xl shadow-sm space-y-4 relative">
                    <div className="flex justify-between items-center pb-2 border-b border-purple-100">
                        <FormField
                            control={control}
                            // Type assert để RHF nhận đúng đường dẫn
                            name={`dynamicConfig.adHocSections.${sectionIndex}.name` as any}
                            render={({ field: nameField }) => (
                                <FormItem className="flex-1 max-w-sm">
                                    <FormControl>
                                        <Input
                                            placeholder="Tên phần thi (VD: Trắc nghiệm)"
                                            className="font-bold border-none bg-purple-50/50 text-purple-900 text-lg focus-visible:ring-1 focus-visible:ring-purple-300"
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

                    <DynamicRuleList
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
                className="w-full py-8 border-2 border-dashed border-purple-300 bg-purple-50/50 text-purple-600 hover:bg-purple-100 hover:border-purple-400 font-bold transition-all"
                disabled={disabled}
                onClick={() => append({
                    name: `Phần ${fields.length + 1}`,
                    orderIndex: fields.length,
                    rules: [{ limit: 1, folderIds: [], topicIds: [], difficulties: [], tags: [] }]
                } as any)}
            >
                <Plus className="w-5 h-5 mr-2 text-purple-400" /> THÊM PHẦN THI MỚI
            </Button>
        </div>
    );
}