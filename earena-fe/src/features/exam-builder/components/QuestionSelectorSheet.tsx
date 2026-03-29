// src/features/exam-builder/components/QuestionSelectorSheet.tsx
'use client';

import React from 'react';
import { useQuestions } from '../hooks/useQuestions';
import { useUpdatePaper } from '../hooks/useUpdatePaper';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet';
import { Button } from '@/shared/components/ui/button';
import { Loader2, PlusCircle } from 'lucide-react';
import { Skeleton } from '@/shared/components/ui/skeleton';

interface QuestionSelectorSheetProps {
  paperId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  existingQuestionIds: string[]; // Truyền mảng ID các câu đã có trong đề để disable nút "Thêm"
}

export function QuestionSelectorSheet({ paperId, isOpen, onOpenChange, existingQuestionIds }: QuestionSelectorSheetProps) {
  const { data: questionsData, isLoading } = useQuestions();
  const { mutate: updatePaper, isPending: isUpdating } = useUpdatePaper(paperId);

  const questions = questionsData?.data || []; // Tùy cấu trúc bọc meta/data của API BE

  const handleAddQuestion = (question: any) => {
    // Dùng Optimistic Update: Truyền nguyên object questionData để UI vẽ ngay lập tức
    updatePaper({ 
      action: 'ADD', 
      questionId: question._id, // Hoặc question.id tùy BE định nghĩa
      questionData: {
        originalQuestionId: question._id,
        content: question.content,
        answers: question.answers,
      }
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl font-bold">Ngân hàng câu hỏi</SheetTitle>
          <SheetDescription>
            Chọn câu hỏi từ thư viện để thêm vào tờ đề hiện tại.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 pb-12">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)
          ) : questions.length === 0 ? (
            <div className="text-center p-8 text-slate-500 bg-slate-50 rounded-xl border border-dashed">
              Kho câu hỏi đang trống. Vui lòng import thêm.
            </div>
          ) : (
            questions.map((q: any) => {
              const isAlreadyAdded = existingQuestionIds.includes(q._id);

              return (
                <div key={q._id} className={`p-4 rounded-xl border transition-all ${isAlreadyAdded ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-200 hover:border-blue-300 shadow-sm'}`}>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded mb-2 inline-block">
                        {q.difficultyLevel || 'Chưa phân loại'}
                      </span>
                      <p className="text-sm font-medium text-slate-800 line-clamp-3">
                        {q.content}
                      </p>
                    </div>
                    
                    <Button
                      size="sm"
                      variant={isAlreadyAdded ? "secondary" : "default"}
                      disabled={isAlreadyAdded || isUpdating}
                      onClick={() => handleAddQuestion(q)}
                      className="shrink-0 font-semibold"
                    >
                      {isAlreadyAdded ? 'Đã có trong đề' : (
                        <>
                          <PlusCircle className="w-4 h-4 mr-1.5" /> Thêm
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}