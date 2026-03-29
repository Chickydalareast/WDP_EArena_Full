'use client';

import React, { useEffect } from 'react';
import { useForm, useFieldArray, FormProvider, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
    EditQuestionFormSchema,
    EditQuestionFormDTO,
    UpdateSingleQuestionDTO,
    UpdatePassageDTO
} from '../types/exam.schema';
import {
    PopulatedQuestion,
    AnswerKey,
    hydrateQuestionForEdit
} from '../lib/hydration-utils';
import { useUpdateSingleQuestion, useUpdatePassageQuestion } from '../hooks/useQuestionMutations';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet'; 
import { Button } from '@/shared/components/ui/button'; 
import { FormField, FormItem, FormControl, FormMessage, FormLabel } from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input'; 
import { RichTextEditor } from '@/shared/components/ui/rich-text-editor'; 
import { QuestionMediaUploader } from './QuestionMediaUploader';
import { CheckCircle2, Circle, Loader2, Plus, Trash2, Layers, Save, Send } from 'lucide-react';
import { cn } from '@/shared/lib/utils'; 
import { toast } from 'sonner';

// Bổ sung imports cho quản lý Topic và Option
import { useSession } from '@/features/auth/hooks/useSession';
import { useTopicsTree, FlatTopic } from '../hooks/useTopics';
import { TopicSelector } from './TopicSelector';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';

const DIFFICULTY_OPTIONS = [
    { value: 'UNKNOWN', label: 'Chưa xác định (Chỉ lưu nháp)' },
    { value: 'NB', label: 'Nhận biết' },
    { value: 'TH', label: 'Thông hiểu' },
    { value: 'VD', label: 'Vận dụng' },
    { value: 'VDC', label: 'Vận dụng cao' },
];

const EditAnswersBlock = ({ path, disabled }: { path: string; disabled?: boolean }) => {
    const { control, setValue, watch } = useFormContext();
    const { fields } = useFieldArray({ control, name: path });
    const currentAnswers = watch(path) as any[];

    const handleSetCorrect = (selectedIndex: number) => {
        fields.forEach((_, idx) => {
            setValue(`${path}.${idx}.isCorrect`, idx === selectedIndex, { shouldValidate: true, shouldDirty: true });
        });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {fields.map((field, idx) => {
                const letter = ['A', 'B', 'C', 'D'][idx] || 'X';
                const isCorrect = currentAnswers?.[idx]?.isCorrect || false;

                return (
                    <div key={field.id} className="flex items-start gap-3">
                        <button
                            type="button" disabled={disabled} onClick={() => handleSetCorrect(idx)}
                            className={cn("mt-1 shrink-0 transition-colors", isCorrect ? "text-green-500" : "text-slate-300")}
                        >
                            {isCorrect ? <CheckCircle2 className="w-7 h-7" /> : <Circle className="w-7 h-7" />}
                        </button>
                        <FormField
                            control={control} name={`${path}.${idx}.content`}
                            render={({ field: inputField }) => (
                                <FormItem className="flex-1">
                                    <FormControl>
                                        <Input placeholder={`Đáp án ${letter}...`} disabled={disabled} {...inputField} className={cn(isCorrect && "border-green-300 bg-green-50/30")} />
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
};

const EditSubQuestionsBlock = ({ disabled, question }: { disabled?: boolean; question?: PopulatedQuestion | null }) => {
    const { control } = useFormContext();
    const path = `subQuestions`;
    const { fields, append, remove } = useFieldArray({ control, name: path });

    return (
        <div className="mt-6 space-y-6">
            <h4 className="font-bold text-slate-700 flex items-center gap-2 border-b pb-2">
                <Layers className="w-5 h-5 text-purple-500" /> Quản lý Câu hỏi con
            </h4>

            {fields.map((subField, subIdx) => (
                <div key={subField.id} className="p-5 bg-slate-50 border border-slate-200 rounded-xl relative">
                    <div className="absolute -left-3 top-5 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xs shadow-sm">
                        {subIdx + 1}
                    </div>

                    <button
                        type="button" onClick={() => remove(subIdx)}
                        className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="mb-4 w-full md:w-1/2 pt-6">
                        <FormField
                            control={control}
                            name={`${path}.${subIdx}.difficultyLevel`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs text-slate-500 font-semibold">Độ khó câu hỏi phụ</FormLabel>
                                    <Select disabled={disabled} onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger className="bg-white"><SelectValue placeholder="Chọn độ khó" /></SelectTrigger></FormControl>
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

                    <FormField
                        control={control} name={`${path}.${subIdx}.content`}
                        render={({ field }) => (
                            <FormItem><FormControl><RichTextEditor value={field.value} onChange={field.onChange} disabled={disabled} /></FormControl><FormMessage /></FormItem>
                        )}
                    />

                    <FormField
                        control={control} name={`${path}.${subIdx}.attachedMedia`}
                        render={({ field }) => (
                            <FormItem className="mt-4">
                                <FormControl>
                                    <QuestionMediaUploader 
                                        value={field.value} 
                                        onChange={field.onChange} 
                                        disabled={disabled} 
                                        initialMedia={question?.subQuestions?.[subIdx]?.attachedMedia}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <EditAnswersBlock path={`${path}.${subIdx}.answers`} disabled={disabled} />
                </div>
            ))}

            <Button
                type="button" variant="outline" size="sm" disabled={disabled}
                onClick={() => append({
                    content: '', difficultyLevel: 'UNKNOWN', attachedMedia: [],
                    answers: [{ id: 'A', content: '', isCorrect: true }, { id: 'B', content: '', isCorrect: false }, { id: 'C', content: '', isCorrect: false }, { id: 'D', content: '', isCorrect: false }]
                })}
                className="w-full border-dashed text-purple-600 hover:bg-purple-50"
            >
                <Plus className="w-4 h-4 mr-2" /> Thêm câu hỏi phụ mới
            </Button>
        </div>
    );
};

interface EditQuestionSheetProps {
    question: PopulatedQuestion | null;
    answerKeys?: AnswerKey[];
    paperId?: string;
    mode?: 'EXAM' | 'BANK';
    onClose: () => void;
}

export function EditQuestionSheet({ question, answerKeys, paperId, mode = 'EXAM', onClose }: EditQuestionSheetProps) {
    const isOpen = !!question;

    const { user } = useSession();
    const subjectId = user?.subjects?.[0]?.id;
    const { data: topics = [], isLoading: isTopicsLoading } = useTopicsTree(mode === 'BANK' ? subjectId : undefined);

    const { mutate: updateSingle, isPending: isUpdatingSingle } = useUpdateSingleQuestion({ paperId, isBankMode: mode === 'BANK' });
    const { mutate: updatePassage, isPending: isUpdatingPassage } = useUpdatePassageQuestion({ paperId, isBankMode: mode === 'BANK' });
    const isPending = isUpdatingSingle || isUpdatingPassage;

    const methods = useForm<EditQuestionFormDTO>({
        resolver: zodResolver(EditQuestionFormSchema),
        defaultValues: { type: 'MULTIPLE_CHOICE', content: '', isDraft: true }, 
    });

    // --- STATE MACHINE: THEO DÕI ĐIỀU KIỆN XUẤT BẢN ---
    const watchedTopicId = methods.watch('topicId');
    const watchedDifficulty = methods.watch('difficultyLevel');
    const watchedType = methods.watch('type');
    const watchedSubQuestions = methods.watch('subQuestions');

    const canPublish = !isPending && !!watchedTopicId && watchedDifficulty !== 'UNKNOWN' && 
        (watchedType !== 'PASSAGE' || !watchedSubQuestions?.some(sub => sub.difficultyLevel === 'UNKNOWN'));

    useEffect(() => {
        if (question) {
            const hydratedData = hydrateQuestionForEdit(question, answerKeys);
            methods.reset(hydratedData);
        }
    }, [question, answerKeys, methods]);

    // --- XỬ LÝ SUBMIT VÀ BẮT LỖI NGẦM (SILENT FAILURE) ---
    const processSubmit = (submitMode: 'DRAFT' | 'PUBLISH') => {
        methods.setValue('isDraft', submitMode === 'DRAFT', { shouldValidate: true });
        
        methods.handleSubmit(onSubmit, (errors) => {
            console.error("Zod Validation Errors:", errors);
            toast.error("Vui lòng kiểm tra lại form! (Nội dung quá ngắn, thiếu chuyên đề/độ khó, hoặc thiếu đáp án)");
        })();
    };

    const onSubmit = (data: EditQuestionFormDTO) => {
        if (!question) return;
        
        const targetId = question.originalQuestionId || question._id;
        
        if (!targetId) {
            toast.error('Không tìm thấy ID câu hỏi để cập nhật!');
            return;
        }

        if (data.type === 'MULTIPLE_CHOICE') {
            const payload: UpdateSingleQuestionDTO = {
                content: data.content,
                topicId: data.topicId,
                difficultyLevel: data.difficultyLevel,
                answers: data.answers,
                attachedMedia: data.attachedMedia,
                isDraft: data.isDraft 
            };
            updateSingle({ questionId: targetId, payload }, { onSuccess: () => onClose() });
        } else {
            const payload: UpdatePassageDTO = {
                content: data.content,
                topicId: data.topicId,
                difficultyLevel: data.difficultyLevel,
                attachedMedia: data.attachedMedia,
                // MAP _id THÀNH id CHUẨN BACKEND CONTRACT
                subQuestions: (data.subQuestions || []).map(q => {
                    const { _id, ...rest } = q;
                    return {
                        ...rest,
                        id: _id
                    };
                }),
                isDraft: data.isDraft 
            };
            updatePassage({ passageId: targetId, payload }, { onSuccess: () => onClose() });
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent side="right" className="w-full sm:max-w-5xl overflow-y-auto bg-slate-50 sm:rounded-l-2xl">
                <SheetHeader className="mb-6 border-b pb-4">
                    <SheetTitle className="text-2xl font-black text-slate-800">
                        {question?.type === 'PASSAGE' ? 'Sửa Khối Bài Đọc' : 'Sửa Câu Hỏi'}
                    </SheetTitle>
                </SheetHeader>

                <FormProvider {...methods}>
                    <form className="space-y-6 pb-20">

                        <div className="bg-white p-5 rounded-2xl border shadow-sm">
                            <span className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider bg-blue-100 text-blue-800 mb-4 inline-block">
                                Nội Dung Gốc
                            </span>

                            {mode === 'BANK' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <FormField
                                        control={methods.control} name="topicId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-semibold text-slate-700">Chuyên đề môn học</FormLabel>
                                                <FormControl>
                                                    <TopicSelector value={field.value} onChange={field.onChange} topics={topics} isLoading={isTopicsLoading} disabled={isPending} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    
                                    <FormField
                                        control={methods.control} name="difficultyLevel"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-semibold text-slate-700">Độ khó câu gốc</FormLabel>
                                                <Select disabled={isPending} onValueChange={field.onChange} value={field.value}>
                                                    <FormControl><SelectTrigger className="bg-white"><SelectValue placeholder="Chọn độ khó" /></SelectTrigger></FormControl>
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
                                control={methods.control} name="content"
                                render={({ field }) => (
                                    <FormItem><FormControl><RichTextEditor value={field.value} onChange={field.onChange} disabled={isPending} /></FormControl><FormMessage /></FormItem>
                                )}
                            />

                            <FormField
                                control={methods.control} name="attachedMedia"
                                render={({ field }) => (
                                    <FormItem className="mt-4">
                                        <FormControl>
                                            <QuestionMediaUploader value={field.value} onChange={field.onChange} disabled={isPending} initialMedia={question?.attachedMedia} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {question?.type === 'MULTIPLE_CHOICE' && (
                                <div className="mt-4 pt-4 border-t">
                                    <EditAnswersBlock path="answers" disabled={isPending} />
                                </div>
                            )}
                        </div>

                        {question?.type === 'PASSAGE' && <EditSubQuestionsBlock disabled={isPending} question={question} />}

                        {/* --- FOOTER THÔNG MINH --- */}
                        <div className="sticky bottom-0 bg-white/90 backdrop-blur-md p-4 -mx-6 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)] border-t flex justify-end gap-3 z-50">
                            <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>Hủy</Button>
                            
                            {mode === 'BANK' ? (
                                <>
                                    <Button 
                                        type="button" variant="outline" disabled={isPending} 
                                        onClick={() => processSubmit('DRAFT')}
                                        className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200 font-bold"
                                    >
                                        {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                        Lưu Nháp
                                    </Button>

                                    <Button 
                                        type="button" 
                                        disabled={!canPublish} 
                                        onClick={() => processSubmit('PUBLISH')}
                                        className={cn("bg-slate-900 text-white font-bold min-w-[120px] transition-all", !canPublish && "opacity-40")}
                                        title={!canPublish ? "Vui lòng chọn Chuyên đề và Độ khó để xuất bản" : "Lưu và Xuất Bản"}
                                    >
                                        {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                                        Lưu & Xuất Bản
                                    </Button>
                                </>
                            ) : (
                                <Button 
                                    type="button" disabled={isPending} 
                                    onClick={() => methods.handleSubmit(onSubmit, () => toast.error("Vui lòng điền đủ thông tin!"))()}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold min-w-[120px]"
                                >
                                    {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Lưu Thay Đổi
                                </Button>
                            )}
                        </div>

                    </form>
                </FormProvider>
            </SheetContent>
        </Sheet>
    );
}