'use client';

import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

import { UpdateLessonDTO } from '../../types/curriculum.schema';
import { FolderNode } from '@/features/exam-builder/hooks/useFolders';
import { FlatTopic } from '@/features/exam-builder/hooks/useTopics';
import { DynamicRuleItem } from './DynamicRuleItem';

interface DynamicRuleListProps {
    sectionIndex: number;
    folders: FolderNode[];
    topics: FlatTopic[];
    disabled: boolean;
}

export function DynamicRuleList({ sectionIndex, folders, topics, disabled }: DynamicRuleListProps) {
    const { control } = useFormContext<UpdateLessonDTO>();
    
    const { fields, append, remove } = useFieldArray({
        control,
        name: `dynamicConfig.adHocSections.${sectionIndex}.rules` as "dynamicConfig.adHocSections.0.rules",
    });

    return (
        <div className="space-y-4">
            {fields.map((field, ruleIndex) => (
                <DynamicRuleItem
                    key={field.id} // RHF sử dụng ID nội bộ này để track re-render, cực kỳ tối ưu
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
                <Plus className="w-4 h-4 mr-2" /> Thêm Tiêu Chí Bốc Đề
            </Button>
        </div>
    );
}