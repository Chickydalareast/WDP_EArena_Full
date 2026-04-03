'use client';

import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

import { MatrixSectionDTO } from '@/features/exam-builder/types/exam.schema';
import { FolderNode } from '@/features/exam-builder/hooks/useFolders';
import { FlatTopic } from '@/features/exam-builder/hooks/useTopics';
import { DynamicSectionItem } from './DynamicSectionItem'; // Component hợp nhất từ Phase 6

interface DynamicQuizBuilderProps {
    folders: FolderNode[];
    topics: FlatTopic[];
    activeFilters: Record<string, unknown> | unknown;
    disabled: boolean;
}

// [CTO ARCHITECTURE]: Định nghĩa Type chung để ép RHF hiểu cấu trúc mảng mà KHÔNG DÙNG ANY
type SharedFormType = {
    dynamicConfig: {
        adHocSections: MatrixSectionDTO[];
    }
};

export function DynamicQuizBuilder({ folders, topics, activeFilters, disabled }: DynamicQuizBuilderProps) {
    const { control } = useFormContext<SharedFormType>();
    
    const { fields, append, remove } = useFieldArray({
        control,
        name: "dynamicConfig.adHocSections"
    });

    return (
        <div className="space-y-6">
            {fields.map((field, sectionIndex) => (
                <DynamicSectionItem
                    key={field.id}
                    sectionIndex={sectionIndex}
                    folders={folders}
                    topics={topics}
                    activeFilters={activeFilters}
                    disabled={disabled}
                    onRemove={() => remove(sectionIndex)}
                    canRemove={fields.length > 1}
                />
            ))}

            <Button
                type="button"
                variant="outline"
                className="w-full py-8 border-2 border-dashed border-purple-300 bg-purple-50/50 text-purple-600 hover:bg-purple-100 hover:border-purple-400 font-bold transition-all"
                disabled={disabled}
                onClick={() => append({
                    name: `Phần ${fields.length + 1}`,
                    orderIndex: fields.length,
                    rules: [{ limit: 10, folderIds: [], topicIds: [], difficulties: [], tags: [] }]
                })}
            >
                <Plus className="w-5 h-5 mr-2 text-purple-400" /> THÊM PHẦN THI / LUẬT BỐC
            </Button>
        </div>
    );
}