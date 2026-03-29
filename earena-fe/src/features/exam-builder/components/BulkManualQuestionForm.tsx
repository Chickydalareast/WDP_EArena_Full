'use client';

import React, { useCallback } from 'react';
import { useForm, useFieldArray, FormProvider, useFormContext, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { QuestionItemSchema, QuestionItemDTO, AnswerOptionDTO } from '../types/exam.schema';
import { useSession } from '@/features/auth/hooks/useSession';
import { useTopicsTree } from '../hooks/useTopics';
import { RichTextEditor } from '@/shared/components/ui/rich-text-editor';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { FormField, FormItem, FormControl, FormMessage, FormLabel } from '@/shared/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { CheckCircle2, Circle, Loader2, Plus, Trash2, Layers, FileText, Send, Save, Check } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { QuestionMediaUploader } from './QuestionMediaUploader';
import { TopicSelector } from './TopicSelector'; // Đã thêm import TopicSelector

// ==========================================
// 1. LOCAL SCHEMA & HELPER FUNCTIONS
// ==========================================
const FormSchema = z.object({
  questions: z.array(QuestionItemSchema).min(1, 'Phải có ít nhất 1 câu hỏi'),
});

type FormDTO = z.infer<typeof FormSchema>;

const createDefaultAnswers = (): AnswerOptionDTO[] => [
  { id: 'A', content: '', isCorrect: true },
  { id: 'B', content: '', isCorrect: false },
  { id: 'C', content: '', isCorrect: false },
  { id: 'D', content: '', isCorrect: false },
];

const createQuestionItem = (type: 'MULTIPLE_CHOICE' | 'PASSAGE'): QuestionItemDTO => {
  const baseData = {
    type,
    content: '',
    difficultyLevel: 'UNKNOWN' as const,
    topicId: '', 
    isDraft: true, 
    attachedMedia: [],
  };

  if (type === 'PASSAGE') {
    return {
      ...baseData,
      subQuestions: [
        { 
          content: '', 
          difficultyLevel: 'UNKNOWN', 
          answers: createDefaultAnswers(),
          attachedMedia: [] 
        }
      ]
    };
  }
  return {
    ...baseData,
    answers: createDefaultAnswers()
  };
};

const DIFFICULTY_OPTIONS = [
  { value: 'UNKNOWN', label: 'Chưa xác định (Chỉ lưu nháp)' },
  { value: 'NB', label: 'Nhận biết' },
  { value: 'TH', label: 'Thông hiểu' },
  { value: 'VD', label: 'Vận dụng' },
  { value: 'VDC', label: 'Vận dụng cao' },
];

// ==========================================
// 2. COMPOUND COMPONENTS (MEMOIZED & ISOLATED)
// ==========================================

const AnswerOptionsBlock = React.memo(({ path, disabled }: { path: string; disabled?: boolean }) => {
  const { control, setValue } = useFormContext<FormDTO>();
  const { fields } = useFieldArray({ control, name: path as any });
  
  // Dùng useWatch thay vì watch để tránh re-render cả form
  const currentAnswers = useWatch({ control, name: path as any }) as AnswerOptionDTO[];

  const handleSetCorrect = useCallback((selectedIndex: number) => {
    fields.forEach((_, idx) => {
      setValue(`${path}.${idx}.isCorrect` as any, idx === selectedIndex, { 
        shouldValidate: true, 
        shouldDirty: true 
      });
    });
  }, [fields, path, setValue]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      {fields.map((field, idx) => {
        const letter = ['A', 'B', 'C', 'D'][idx] || 'X';
        const isCorrect = currentAnswers?.[idx]?.isCorrect || false;

        return (
          <div key={field.id} className="flex items-start gap-3">
            <button
              type="button"
              disabled={disabled}
              onClick={() => handleSetCorrect(idx)}
              className={cn("mt-1 flex-shrink-0 transition-colors", isCorrect ? "text-green-500" : "text-slate-300 hover:text-slate-400")}
            >
              {isCorrect ? <CheckCircle2 className="w-7 h-7" /> : <Circle className="w-7 h-7" />}
            </button>
            <FormField
              control={control}
              name={`${path}.${idx}.content` as any}
              render={({ field: inputField }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input placeholder={`Nội dung đáp án ${letter}...`} disabled={disabled} {...inputField} className={cn(isCorrect && "border-green-300 bg-green-50/30 font-medium")} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );
      })}
    </div>
  );
});
AnswerOptionsBlock.displayName = 'AnswerOptionsBlock';

const SubQuestionsBlock = React.memo(({ parentIndex, disabled, mode }: { parentIndex: number; disabled?: boolean; mode: 'QUICK_EXAM' | 'QUESTION_BANK' }) => {
  const { control } = useFormContext<FormDTO>();
  const path = `questions.${parentIndex}.subQuestions`;
  const { fields, append, remove } = useFieldArray({ control, name: path as any });

  return (
    <div className="mt-6 pl-4 md:pl-8 border-l-2 border-slate-200 space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-slate-700 flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-500" />
          Danh sách câu hỏi phụ
        </h4>
      </div>

      {fields.map((subField, subIdx) => (
        <div key={subField.id} className="p-5 bg-white border border-slate-200 shadow-sm rounded-xl relative">
          <div className="absolute -left-3 top-5 w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-xs shadow-sm">
            {subIdx + 1}
          </div>
          
          {fields.length > 1 && (
            <button type="button" onClick={() => remove(subIdx)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {/* Chỉ hiển thị Độ khó nếu không phải Quick Exam */}
          {mode === 'QUESTION_BANK' && (
             <div className="mb-4 w-full md:w-1/2">
               <FormField
                  control={control}
                  name={`${path}.${subIdx}.difficultyLevel` as any}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-slate-500 font-semibold">Độ khó câu hỏi phụ</FormLabel>
                      <Select disabled={disabled} onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Chọn độ khó" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {DIFFICULTY_OPTIONS.map(opt => (
                             <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
               />
            </div>
          )}

          <FormField
            control={control}
            name={`${path}.${subIdx}.content` as any}
            render={({ field }) => (
              <FormItem>
                <FormControl><RichTextEditor value={field.value} onChange={field.onChange} disabled={disabled} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`${path}.${subIdx}.attachedMedia` as any}
            render={({ field }) => (
              <FormItem className="mt-2">
                <FormControl><QuestionMediaUploader value={field.value} onChange={field.onChange} disabled={disabled} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <AnswerOptionsBlock path={`${path}.${subIdx}.answers`} disabled={disabled} />
        </div>
      ))}

      <Button
        type="button" variant="outline" size="sm" disabled={disabled}
        onClick={() => append({ content: '', difficultyLevel: 'UNKNOWN', answers: createDefaultAnswers(), attachedMedia: [] })}
        className="text-purple-600 border-purple-200 hover:bg-purple-50 border-dashed w-full"
      >
        <Plus className="w-4 h-4 mr-2" /> Thêm câu hỏi phụ
      </Button>
    </div>
  );
});
SubQuestionsBlock.displayName = 'SubQuestionsBlock';

// --- MAIN QUESTION BLOCK (MEMOIZED TO PREVENT TYPING LAG) ---
interface QuestionBlockProps {
  qIndex: number;
  qType: 'MULTIPLE_CHOICE' | 'PASSAGE';
  isBusy: boolean;
  mode: 'QUICK_EXAM' | 'QUESTION_BANK';
  topics: { id: string; name: string }[];
  isTopicsLoading: boolean;
  remove: (index: number) => void;
  canRemove: boolean;
}

const QuestionBlock = React.memo(({ qIndex, qType, isBusy, mode, topics, isTopicsLoading, remove, canRemove }: QuestionBlockProps) => {
  const { control } = useFormContext<FormDTO>();
  const isPassage = qType === 'PASSAGE';

  return (
    <div className={cn("relative p-6 rounded-2xl border-2 transition-colors", isPassage ? "bg-purple-50/30 border-purple-100" : "bg-blue-50/30 border-blue-100")}>
      <div className={cn("absolute -top-4 -left-4 w-10 h-10 text-white rounded-xl flex items-center justify-center font-black shadow-lg", isPassage ? "bg-purple-600" : "bg-blue-600")}>
        {qIndex + 1}
      </div>
      
      {canRemove && (
        <button type="button" onClick={() => remove(qIndex)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors bg-white p-2 rounded-lg shadow-sm" title="Xóa toàn bộ khối này">
          <Trash2 className="w-5 h-5" />
        </button>
      )}

      <div className="mb-4">
        <span className={cn("text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider", isPassage ? "bg-purple-200 text-purple-800" : "bg-blue-200 text-blue-800")}>
          {isPassage ? 'Đoạn Văn Mẹ (Passage)' : 'Câu Hỏi Trắc Nghiệm'}
        </span>
      </div>

      {/* CHỈ HIỂN THỊ CHUYÊN ĐỀ VÀ ĐỘ KHÓ NẾU LÀ LUỒNG QUESTION_BANK */}
      {mode === 'QUESTION_BANK' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
           <FormField
              control={control}
              name={`questions.${qIndex}.topicId` as const}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-slate-700">Chuyên đề môn học</FormLabel>
                  <FormControl>
                    <TopicSelector 
                        value={field.value} 
                        onChange={field.onChange} 
                        topics={topics} 
                        isLoading={isTopicsLoading}
                        disabled={isBusy}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
           />
           
           <FormField
              control={control}
              name={`questions.${qIndex}.difficultyLevel` as const}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-slate-700">Độ khó câu gốc</FormLabel>
                  <Select disabled={isBusy} onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Chọn độ khó" /></SelectTrigger></FormControl>
                    <SelectContent>
                       {DIFFICULTY_OPTIONS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                       ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
           />
        </div>
      )}

      {/* NỘI DUNG RICH TEXT CHÍNH */}
      <FormField 
        control={control} 
        name={`questions.${qIndex}.content` as const} 
        render={({ field }) => (
          <FormItem>
            <FormControl><RichTextEditor value={field.value} onChange={field.onChange} disabled={isBusy} /></FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={`questions.${qIndex}.attachedMedia` as const}
        render={({ field }) => (
          <FormItem className="mt-2">
            <FormControl><QuestionMediaUploader value={field.value} onChange={field.onChange} disabled={isBusy} /></FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {isPassage ? (
        <SubQuestionsBlock parentIndex={qIndex} disabled={isBusy} mode={mode} />
      ) : (
        <div className="mt-4 border-t pt-4">
           <AnswerOptionsBlock path={`questions.${qIndex}.answers`} disabled={isBusy} />
        </div>
      )}
    </div>
  );
});
QuestionBlock.displayName = 'QuestionBlock';

// ==========================================
// 3. MAIN FORM COMPONENT
// ==========================================

export interface BulkManualQuestionFormProps {
  mode?: 'QUICK_EXAM' | 'QUESTION_BANK'; // Dùng để quyết định UI Render
  onSave: (data: QuestionItemDTO[]) => void;
  isPending?: boolean;
  onCancel: () => void;
}

export function BulkManualQuestionForm({ mode = 'QUESTION_BANK', onSave, isPending, onCancel }: BulkManualQuestionFormProps) {
  // --- Data Fetching ---
  const { user } = useSession();
  const subjectId = user?.subjects?.[0]?.id;
  // Chỉ gọi fetch topic nếu đang ở luồng Ngân hàng
  const { data: topics = [], isLoading: isTopicsLoading } = useTopicsTree(mode === 'QUESTION_BANK' ? subjectId : undefined);

  // --- Form Initialization ---
  const methods = useForm<FormDTO>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      questions: [createQuestionItem('MULTIPLE_CHOICE')],
    },
  });

  const { control, handleSubmit, setValue, getValues, formState: { isSubmitting } } = methods;
  const { fields, append, remove } = useFieldArray({ control, name: 'questions' });
  const isBusy = isPending || isSubmitting;

  // --- Handlers ---
  const processSubmit = useCallback((submitMode: 'DRAFT' | 'PUBLISH') => {
    const currentValues = getValues('questions');
    currentValues.forEach((_, idx) => {
       // Ép cờ isDraft đồng bộ trước khi trigger Zod Validate
       setValue(`questions.${idx}.isDraft`, submitMode === 'DRAFT', { shouldValidate: false });
    });
    
    handleSubmit((data) => {
        onSave(data.questions);
    })();
  }, [getValues, setValue, handleSubmit, onSave]);

  return (
    <div className={cn("bg-white border-2 shadow-xl rounded-2xl overflow-hidden", mode === 'QUICK_EXAM' ? 'border-indigo-200' : 'border-blue-200')}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-slate-50 border-b gap-4">
        <div>
          <h3 className="text-lg font-black text-slate-800">
            {mode === 'QUICK_EXAM' ? 'Soạn Nhanh Câu Hỏi' : 'Soạn Đề Đa Hình (Polymorphic)'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {mode === 'QUICK_EXAM' ? 'Thêm câu hỏi trực tiếp vào vỏ đề. (Có thể phân loại sau)' : 'Hỗ trợ soạn câu hỏi đơn hoặc khối bài đọc lồng nhau.'}
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button type="button" variant="outline" disabled={isBusy} onClick={() => append(createQuestionItem('MULTIPLE_CHOICE'))} className="flex-1 md:flex-none font-bold text-blue-600 border-blue-200 hover:bg-blue-50">
            <Plus className="w-4 h-4 mr-2" /> Câu Đơn
          </Button>
          <Button type="button" variant="outline" disabled={isBusy} onClick={() => append(createQuestionItem('PASSAGE'))} className="flex-1 md:flex-none font-bold text-purple-600 border-purple-200 hover:bg-purple-50">
            <FileText className="w-4 h-4 mr-2" /> Khối Bài Đọc
          </Button>
        </div>
      </div>

      <FormProvider {...methods}>
        <form className="space-y-8 p-6">
          
          {fields.map((qField, qIndex) => (
             <QuestionBlock
                key={qField.id}
                qIndex={qIndex}
                qType={qField.type}
                isBusy={isBusy}
                mode={mode}
                topics={topics}
                isTopicsLoading={isTopicsLoading}
                remove={remove}
                canRemove={fields.length > 1}
             />
          ))}

          <div className="flex justify-end gap-3 pt-6 border-t sticky bottom-0 bg-white/90 backdrop-blur-sm p-4 -mx-6 -mb-6 shadow-[0_-15px_30px_-15px_rgba(0,0,0,0.1)] z-20">
            <Button type="button" variant="ghost" onClick={onCancel} disabled={isBusy} className="font-semibold">
              Hủy bỏ
            </Button>
            
            {/* RENDER NÚT DỰA VÀO LUỒNG NGHIỆP VỤ */}
            {mode === 'QUICK_EXAM' ? (
              <Button 
                type="button" 
                disabled={isBusy} 
                onClick={() => processSubmit('DRAFT')}
                className="bg-indigo-600 text-white hover:bg-indigo-700 font-bold px-8 shadow-xl"
              >
                {isBusy ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Check className="w-5 h-5 mr-2" />}
                Lưu vào Đề Thi
              </Button>
            ) : (
              <>
                <Button 
                    type="button" 
                    variant="outline"
                    disabled={isBusy} 
                    onClick={() => processSubmit('DRAFT')}
                    className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200 font-bold shadow-sm"
                >
                  {isBusy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Lưu Thành Nháp
                </Button>

                <Button 
                    type="button" 
                    disabled={isBusy} 
                    onClick={() => processSubmit('PUBLISH')}
                    className="bg-slate-900 text-white hover:bg-slate-800 font-bold px-8 shadow-xl"
                >
                  {isBusy ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Send className="w-5 h-5 mr-2" />}
                  Lưu & Xuất Bản ({fields.length} Khối)
                </Button>
              </>
            )}
          </div>
        </form>
      </FormProvider>
    </div>
  );
}