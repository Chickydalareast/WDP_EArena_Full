'use client';

import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { CreateQuizLessonDTO } from '../../types/curriculum.schema';
import { DynamicRuleItem } from './DynamicRuleItem';

interface DynamicRuleListProps {
    sectionIndex: number;
    folders: any[];
    topics: any[];
    activeFilters: any;
    disabled: boolean;
}

export function DynamicRuleList({ sectionIndex, folders, topics, activeFilters, disabled }: DynamicRuleListProps) {
    const { control } = useFormContext<CreateQuizLessonDTO>();
    
    // Type-safe array mapping
    const { fields, append, remove } = useFieldArray({
        control,
        name: `dynamicConfig.adHocSections.${sectionIndex}.rules` as const,
    });

    return (
        <div className="space-y-3">
            {fields.map((field, ruleIndex) => (
                <DynamicRuleItem
                    key={field.id} 
                    sectionIndex={sectionIndex}
                    ruleIndex={ruleIndex}
                    folders={folders}
                    topics={topics}
                    activeFilters={activeFilters}
                    disabled={disabled}
                    onRemove={() => remove(ruleIndex)}
                    canRemove={fields.length > 1}
                />
            ))}
            
            <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => append({ limit: 5, folderIds: [], topicIds: [], difficulties: [], tags: [] })}
                disabled={disabled}
                className="mt-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100"
            >
                <Plus className="w-4 h-4 mr-2" /> Thêm tiêu chí bốc
            </Button>
        </div>
    );
}