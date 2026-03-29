'use client';

import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/shared/components/ui/sheet';
import { BulkManualQuestionForm } from '@/features/exam-builder/components/BulkManualQuestionForm';
import { useCreateBankQuestions } from '../hooks/useBankMutations';
import { useQuestionBankStore } from '../stores/question-bank.store';
import { QuestionItemDTO } from '@/features/exam-builder/types/exam.schema';
import { toast } from 'sonner';

interface CreateBankQuestionSheetProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateBankQuestionSheet({ isOpen, onClose }: CreateBankQuestionSheetProps) {
    const selectedFolderId = useQuestionBankStore(state => state.selectedFolderId);
    const { mutate: createQuestions, isPending } = useCreateBankQuestions();

    const handleSave = (questionsData: QuestionItemDTO[]) => {
        if (!selectedFolderId) {
            toast.error('Lỗi', { description: 'Chưa chọn thư mục đích.' });
            return;
        }

        createQuestions(
            { folderId: selectedFolderId, questionsData },
            { onSuccess: () => onClose() }
        );
    };

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent side="right" className="w-full sm:max-w-[850px] overflow-y-auto bg-slate-50 sm:rounded-l-2xl p-0 border-none shadow-2xl">
                <SheetHeader className="p-6 bg-white border-b sticky top-0 z-30 shadow-sm">
                    <SheetTitle className="text-2xl font-black text-slate-800">Tạo câu hỏi mới</SheetTitle>
                    <SheetDescription className="text-sm">
                        Soạn câu hỏi trắc nghiệm đơn hoặc khối bài đọc lồng nhau. Dữ liệu sẽ được lưu thẳng vào kho.
                    </SheetDescription>
                </SheetHeader>

                <div className="p-4 sm:p-6 pb-24">
                    <BulkManualQuestionForm
                        onSave={handleSave}
                        isPending={isPending}
                        onCancel={onClose}
                    />
                </div>
            </SheetContent>
        </Sheet>
    );
}