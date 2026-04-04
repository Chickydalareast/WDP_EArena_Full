'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { rhfZodResolver as zodResolver } from '@/shared/lib/rhf-zod-resolver';
import { Loader2, Settings, Eye, Settings2 } from 'lucide-react';
import { toast } from 'sonner';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';

import { useAuthStore } from '@/features/auth/stores/auth.store';
import { CreateQuizLessonDTO, CreateQuizLessonSchema } from '../../types/curriculum.schema';
import { useCreateQuizLesson } from '../../hooks/useCurriculumMutations';
import { usePreviewQuizConfig } from '../../hooks/usePreviewQuizConfig';
import { buildNestedQuestions, NestedQuestionPreview } from '../../lib/quiz-utils';

import { useActiveFilters } from '@/features/exam-builder/hooks/useActiveFilters';
import { useRawFoldersTree } from '@/features/exam-builder/hooks/useFolders';
import { useTopicsTree } from '@/features/exam-builder/hooks/useTopics';

import { DynamicQuizBuilder } from './DynamicQuizBuilder';
import { QuizLivePreviewModal } from './QuizLivePreviewModal';

interface CreateDynamicQuizModalProps {
    courseId: string;
    sectionId: string;
    isOpen: boolean;
    onClose: () => void;
}

export function CreateDynamicQuizModal({ courseId, sectionId, isOpen, onClose }: CreateDynamicQuizModalProps) {
    const { mutate: createQuiz, isPending: isCreating } = useCreateQuizLesson(courseId, sectionId);
    const { mutateAsync: fetchPreview, isPending: isPreviewing } = usePreviewQuizConfig();

    const user = useAuthStore((state) => state.user);
    const subjectId = user?.subjects?.[0]?.id;

    const { data: rawFolders } = useRawFoldersTree();
    const { data: rawTopics } = useTopicsTree(subjectId);
    const { data: globalFilters, isFetching: isLoadingFilters } = useActiveFilters({ isDraft: false });

    const folders = (rawFolders as any)?.data || rawFolders || [];
    const topics = (rawTopics as any)?.data || rawTopics || [];
    const activeFilters = (globalFilters as any)?.data || globalFilters;

    const form = useForm<CreateQuizLessonDTO>({
        resolver: zodResolver(CreateQuizLessonSchema),
        defaultValues: {
            courseId,
            sectionId,
            title: '',
            content: '',
            isFreePreview: false,
            totalScore: 10,
            examRules: {
                timeLimit: 45, maxAttempts: 1, passPercentage: 50, showResultMode: 'IMMEDIATELY',
            },
            dynamicConfig: {
                adHocSections: [
                    { name: 'Phần 1: Trắc nghiệm', orderIndex: 0, rules: [{ limit: 10, folderIds: [], topicIds: [], difficulties: [], tags: [] }] }
                ]
            }
        },
    });

    // [CTO FIX 1]: Reset lại form mỗi khi Modal mở ra để cập nhật sectionId chuẩn xác
    useEffect(() => {
        if (isOpen) {
            form.reset({
                courseId,
                sectionId, // Đã nhận ID chuẩn xác khi Click vào nút Thêm bài
                title: '',
                content: '',
                isFreePreview: false,
                totalScore: 10,
                examRules: { timeLimit: 45, maxAttempts: 1, passPercentage: 50, showResultMode: 'IMMEDIATELY' },
                dynamicConfig: {
                    adHocSections: [{ name: 'Phần 1: Trắc nghiệm', orderIndex: 0, rules: [{ limit: 10, folderIds: [], topicIds: [], difficulties: [], tags: [] }] }]
                }
            });
        }
    }, [isOpen, courseId, sectionId, form]);

    const [previewData, setPreviewData] = useState<{ questions: NestedQuestionPreview[], totalItems: number, actual: number } | null>(null);
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setInterval(() => setCooldown(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [cooldown]);

    const handlePreview = async () => {
        if (cooldown > 0) return;
        const isValid = await form.trigger('dynamicConfig');
        if (!isValid) {
            toast.warning('Vui lòng hoàn thiện cấu trúc bốc đề trước khi xem trước.');
            return;
        }
        const config = form.getValues('dynamicConfig');
        try {
            const response = await fetchPreview({ matrixId: config.matrixId, adHocSections: config.adHocSections });
            const actualData = (response as any)?.data || response;
            const nested = buildNestedQuestions(actualData.previewData.questions);
            setPreviewData({ questions: nested, totalItems: actualData.totalItems, actual: actualData.totalActualQuestions });
            setCooldown(10);
            toast.success('Sinh đề nháp thành công!');
        } catch (error) {}
    };

    const onSubmit = (data: CreateQuizLessonDTO) => {
        createQuiz(data, { onSuccess: () => { form.reset(); onClose(); } });
    };

    // [CTO FIX 2]: Hàm bắt Lỗi Câm (Báo động đỏ nếu Zod chặn mà không có UI hiển thị)
    const onValidationError = (errors: any) => {
        console.error("Lỗi Validation Form:", errors);
        toast.error("Thiếu thông tin bắt buộc!", { description: "Vui lòng kiểm tra lại Tên bài, Số lượng câu, Thư mục hoặc Luật thi."});
    };

    const isFormLocked = isCreating || isPreviewing;

    return (
        <>
            <Dialog open={isOpen} onOpenChange={(open) => !open && !isFormLocked && onClose()}>
                <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto bg-slate-50/50">
                    <DialogHeader>
                        <DialogTitle className="text-2xl text-purple-900 flex items-center gap-2">
                            <Settings className="w-6 h-6" /> Tạo Bài Kiểm Tra Động (Rules)
                        </DialogTitle>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit, onValidationError)} className="space-y-6">
                            
                            <div className="bg-white p-5 rounded-xl border shadow-sm space-y-4">
                                <FormField control={form.control} name="title" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold">Tên bài kiểm tra <span className="text-red-500">*</span></FormLabel>
                                        <FormControl><Input {...field} disabled={isFormLocked} placeholder="VD: Bài test định kỳ..." className="h-11" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                            </div>

                            {/* [CTO FIX 3]: BỔ SUNG UI CẤU HÌNH LUẬT THI */}
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                                <h4 className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><Settings2 className="w-4 h-4"/> Cấu hình Luật làm bài</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <FormField control={form.control} name="examRules.timeLimit" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] uppercase text-muted-foreground font-bold">Thời gian (Phút)</FormLabel>
                                            <FormControl><Input type="number" min={0} disabled={isFormLocked} {...field} onChange={e => field.onChange(Number(e.target.value))} className="h-9" /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                    <FormField control={form.control} name="examRules.maxAttempts" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] uppercase text-muted-foreground font-bold">Lượt làm tối đa</FormLabel>
                                            <FormControl><Input type="number" min={1} disabled={isFormLocked} {...field} onChange={e => field.onChange(Number(e.target.value))} className="h-9" /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                    <FormField control={form.control} name="examRules.passPercentage" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] uppercase text-muted-foreground font-bold">Điểm đạt (%)</FormLabel>
                                            <FormControl><Input type="number" min={0} max={100} disabled={isFormLocked} {...field} onChange={e => field.onChange(Number(e.target.value))} className="h-9" /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                    <FormField control={form.control} name="examRules.showResultMode" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] uppercase text-muted-foreground font-bold">Xem đáp án</FormLabel>
                                            <Select disabled={isFormLocked} value={field.value} onValueChange={field.onChange}>
                                                <FormControl><SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Chọn mode" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="IMMEDIATELY">Xem ngay</SelectItem>
                                                    <SelectItem value="AFTER_END_TIME">Sau khi hết giờ</SelectItem>
                                                    <SelectItem value="NEVER">Không bao giờ</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}/>
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-xl border border-purple-200 shadow-sm">
                                <div className="mb-4">
                                    <h3 className="text-lg font-bold text-purple-800">Cấu trúc bốc đề</h3>
                                    {!subjectId && <p className="text-xs text-red-600 font-bold mt-1">CẢNH BÁO: Tài khoản của bạn chưa được thiết lập Môn học chuyên môn.</p>}
                                </div>
                                {isLoadingFilters ? (
                                    <div className="flex justify-center p-10"><Loader2 className="w-6 h-6 animate-spin text-purple-500" /></div>
                                ) : (
                                    <DynamicQuizBuilder folders={folders} topics={topics} activeFilters={activeFilters} disabled={isFormLocked} />
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t sticky bottom-0 bg-slate-50/90 py-4 backdrop-blur-sm z-10">
                                <Button type="button" variant="ghost" onClick={onClose} disabled={isFormLocked}>Hủy bỏ</Button>
                                <div className="flex items-center gap-3">
                                    <Button type="button" variant="outline" className="border-purple-300 text-purple-700 bg-purple-50" onClick={handlePreview} disabled={isFormLocked || cooldown > 0}>
                                        {isPreviewing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Eye className="w-4 h-4 mr-2" />}
                                        {cooldown > 0 ? `Xem trước (${cooldown}s)` : 'Xem thử Đề'}
                                    </Button>
                                    <Button type="submit" disabled={isFormLocked} className="bg-purple-600 hover:bg-purple-700">
                                        {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Lưu Bài Kiểm Tra
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {previewData && (
                <QuizLivePreviewModal isOpen={!!previewData} onClose={() => setPreviewData(null)} questions={previewData.questions} totalItems={previewData.totalItems} totalActualQuestions={previewData.actual} />
            )}
        </>
    );
}