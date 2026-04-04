'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Settings, AlertTriangle, Settings2, Lock, Eye, Library, Save, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { cn } from '@/shared/lib/utils';

import { UpdateQuizLessonDTO, UpdateQuizLessonSchema } from '../../types/curriculum.schema';
import { useUpdateQuizLesson } from '../../hooks/useCurriculumMutations';
import { useLessonQuizDetail, useQuizHealth } from '../../hooks/useQuizQueries';
import { usePreviewQuizConfig } from '../../hooks/usePreviewQuizConfig';
import { buildNestedQuestions, NestedQuestionPreview } from '../../lib/quiz-utils';

import { useActiveFilters } from '@/features/exam-builder/hooks/useActiveFilters';
import { useRawFoldersTree } from '@/features/exam-builder/hooks/useFolders';
import { useTopicsTree } from '@/features/exam-builder/hooks/useTopics';
import { useAuthStore } from '@/features/auth/stores/auth.store';

import { DynamicQuizBuilder } from './DynamicQuizBuilder';
import { QuizLivePreviewModal } from './QuizLivePreviewModal';
import { MatrixLibraryDialog } from './MatrixLibraryDialog';
import { SaveMatrixDialog } from './SaveMatrixDialog';

interface EditDynamicQuizModalProps {
    courseId: string;
    lessonId: string;
    isOpen: boolean;
    onClose: () => void;
}

export function EditDynamicQuizModal({ courseId, lessonId, isOpen, onClose }: EditDynamicQuizModalProps) {
    const { mutate: updateQuiz, isPending: isUpdating } = useUpdateQuizLesson(courseId);
    const { mutateAsync: fetchPreview, isPending: isPreviewing } = usePreviewQuizConfig();
    
    const user = useAuthStore((state) => state.user);
    const subjectId = user?.subjects?.[0]?.id;

    // Fetch Data
    const { data: rawDetail, isLoading: isLoadingDetail } = useLessonQuizDetail(courseId, lessonId);
    // [CTO FIX]: Truyền courseId vào hook Health Check
    const { data: rawHealth, isLoading: isLoadingHealth } = useQuizHealth(courseId, lessonId);

    const { data: rawFolders, isLoading: isLoadingFolders } = useRawFoldersTree();
    const { data: rawTopics, isLoading: isLoadingTopics } = useTopicsTree(subjectId);
    const { data: rawActiveFilters } = useActiveFilters({ isDraft: false });

    // Bóc tách phòng thủ dữ liệu (Defensive Extraction)
    const quizDetail = (rawDetail as any)?.data?.data || (rawDetail as any)?.data || rawDetail;
    const healthData = (rawHealth as any)?.data || rawHealth;
    const folders = (rawFolders as any)?.data || rawFolders || [];
    const topics = (rawTopics as any)?.data || rawTopics || [];
    const activeFilters = (rawActiveFilters as any)?.data || rawActiveFilters;

    const isLoading = isLoadingDetail || isLoadingHealth;
    const isLoadingFilters = isLoadingFolders || isLoadingTopics;
    const isLocked = healthData?.isLocked || false;

    // [CTO FIX]: Map data từ API Smart Merge & Dọn sạch "bom mìn" null từ BE
    const defaultValues = useMemo<Partial<UpdateQuizLessonDTO>>(() => {
        if (!quizDetail) return {};

        let safeAdHocSections = undefined;
        if (quizDetail.dynamicConfig?.adHocSections && Array.isArray(quizDetail.dynamicConfig.adHocSections)) {
            safeAdHocSections = quizDetail.dynamicConfig.adHocSections.map((s: any, sIndex: number) => ({
                name: s.name || `Phần ${sIndex + 1}`,
                orderIndex: s.orderIndex || sIndex,
                rules: Array.isArray(s.rules) ? s.rules.map((r: any) => {
                    const qType = r.questionType || 'FLAT';
                    const cleanRule: any = {
                        questionType: qType,
                        limit: typeof r.limit === 'number' ? r.limit : 1,
                        folderIds: Array.isArray(r.folderIds) ? r.folderIds : [],
                        topicIds: Array.isArray(r.topicIds) ? r.topicIds : [],
                        difficulties: Array.isArray(r.difficulties) ? r.difficulties : [],
                        tags: Array.isArray(r.tags) ? r.tags : [],
                    };
                    
                    // [BẢO VỆ UX]: Nếu là PASSAGE mà BE trả null hoặc thiếu, ép về 1 để form hiển thị bình thường
                    if (qType === 'PASSAGE') {
                        cleanRule.subQuestionLimit = typeof r.subQuestionLimit === 'number' && r.subQuestionLimit > 0 
                            ? r.subQuestionLimit 
                            : 1; 
                    }
                    return cleanRule;
                }) : []
            }));
        }

        return {
            lessonId,
            courseId,
            title: quizDetail.title || '',
            content: quizDetail.content || '',
            totalScore: quizDetail.examRules?.totalScore || 10,
            examRules: {
                timeLimit: quizDetail.examRules?.timeLimit || 45,
                maxAttempts: quizDetail.examRules?.maxAttempts || 1,
                passPercentage: quizDetail.examRules?.passPercentage || 50,
                showResultMode: quizDetail.examRules?.showResultMode || 'IMMEDIATELY',
            },
            dynamicConfig: {
                // [NÚT THẮT LỖI]: Bắt buộc ép null thành undefined để Zod không đánh sập Form
                matrixId: quizDetail.dynamicConfig?.matrixId || undefined,
                adHocSections: safeAdHocSections || [
                    { name: 'Phần 1: Trắc nghiệm', orderIndex: 0, rules: [{ limit: 10, folderIds: [], topicIds: [], difficulties: [], tags: [], questionType: 'FLAT' }] }
                ],
            }
        };
    }, [quizDetail, lessonId, courseId]);

    const form = useForm<UpdateQuizLessonDTO>({
        resolver: zodResolver(UpdateQuizLessonSchema),
        values: defaultValues as UpdateQuizLessonDTO,
        mode: 'onChange'
    });

    const { isDirty } = form.formState;

    // States cho tính năng
    const [previewData, setPreviewData] = useState<{ questions: NestedQuestionPreview[], totalItems: number, actual: number } | null>(null);
    const [cooldown, setCooldown] = useState(0);
    const [isLibOpen, setIsLibOpen] = useState(false);
    const [isSaveOpen, setIsSaveOpen] = useState(false);

    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setInterval(() => setCooldown(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [cooldown]);

    const preparePayload = (data: UpdateQuizLessonDTO) => {
        const payload = JSON.parse(JSON.stringify(data)) as UpdateQuizLessonDTO;
        if (payload.dynamicConfig) {
            if (payload.dynamicConfig.matrixId) {
                delete payload.dynamicConfig.adHocSections;
            } else if (payload.dynamicConfig.adHocSections) {
                delete payload.dynamicConfig.matrixId;
                payload.dynamicConfig.adHocSections.forEach(section => {
                    section.rules.forEach(rule => {
                        if (!rule.questionType) rule.questionType = 'FLAT';
                        if (rule.questionType !== 'PASSAGE') delete rule.subQuestionLimit;
                    });
                });
            }
        }
        return payload;
    };

    const handlePreview = async () => {
        if (cooldown > 0) return;
        
        const isValid = await form.trigger('dynamicConfig');
        if (!isValid) {
            // [CTO ADD]: In thẳng lỗi ra F12 Console để không bị mù thông tin
            console.error('Chi tiết lỗi Validation Zod (Form.dynamicConfig):', form.formState.errors.dynamicConfig);
            toast.warning('Vui lòng hoàn thiện cấu trúc bốc đề trước khi xem trước.');
            return;
        }
        
        const rawConfig = form.getValues('dynamicConfig');
        const cleanPayload = preparePayload({ ...form.getValues(), dynamicConfig: rawConfig });

        try {
            const response = await fetchPreview({ 
                matrixId: cleanPayload.dynamicConfig?.matrixId, 
                adHocSections: cleanPayload.dynamicConfig?.adHocSections 
            });
            const actualData = (response as any)?.data || response;
            const nested = buildNestedQuestions(actualData.previewData.questions);
            setPreviewData({ questions: nested, totalItems: actualData.totalItems, actual: actualData.totalActualQuestions });
            setCooldown(10);
            toast.success('Sinh đề nháp thành công!');
        } catch (error) {}
    };

    const handleApplyTemplate = (clonedSections: any[]) => {
        const apply = () => {
            form.setValue('dynamicConfig.matrixId', undefined); 
            form.setValue('dynamicConfig.adHocSections', clonedSections, { shouldValidate: true, shouldDirty: true });
            setIsLibOpen(false);
            toast.success('Đã áp dụng Khuôn mẫu thành công!');
        };
        if (isDirty) {
            if (window.confirm("Hành động này sẽ thay thế cấu trúc bạn đang soạn thảo bằng nội dung từ Khuôn mẫu. Tiếp tục?")) {
                apply();
            }
        } else {
            apply();
        }
    };

    const onSubmit = (data: UpdateQuizLessonDTO) => {
        if (isLocked) {
            toast.error("Không thể lưu. Bài thi đã có học sinh làm.");
            return;
        }
        const cleanPayload = preparePayload(data);
        updateQuiz(cleanPayload, { onSuccess: () => onClose() });
    };

    const onValidationError = (errors: any) => {
        console.error("Lỗi Validation Form:", errors);
        toast.error("Thiếu thông tin bắt buộc!", { description: "Vui lòng kiểm tra lại Tên bài, Số lượng câu, Thư mục hoặc Luật thi."});
    };

    const isFormLocked = isUpdating || isPreviewing || isLocked;

    return (
        <>
            <Dialog open={isOpen} onOpenChange={(open) => !open && !isUpdating && !isPreviewing && onClose()}>
                <DialogContent 
                    className={cn(
                        "w-[95vw] lg:w-[90vw] max-w-7xl min-w-[1024px] h-[90vh]", 
                        "flex flex-col p-0 overflow-hidden bg-slate-50 border-none shadow-2xl duration-300"
                    )}
                >
                    {/* Header (Cố định) */}
                    <DialogHeader className="px-6 py-4 border-b bg-white flex flex-row items-center justify-between shrink-0 z-10 shadow-sm">
                        <DialogTitle className="text-xl flex items-center gap-2.5 text-slate-900 font-extrabold tracking-tight">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <Settings2 className="w-5 h-5" />
                            </div>
                            Quản lý Bài Kiểm Tra Dynamic
                        </DialogTitle>
                        
                        {!isLocked && (
                            <Button 
                                type="button" 
                                variant="outline" 
                                size="sm" 
                                className="mr-10 border-primary/20 text-primary bg-primary/5 hover:bg-primary/10 hover:border-primary/30 active:scale-95 transition-all"
                                onClick={() => setIsLibOpen(true)}
                                disabled={isFormLocked}
                            >
                                <Library className="w-4 h-4 mr-2" /> Sử dụng Khuôn mẫu (Template)
                            </Button>
                        )}
                    </DialogHeader>

                    {isLoading ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-4 bg-slate-50">
                            <Loader2 className="w-10 h-10 animate-spin text-primary" />
                            <p className="text-sm font-medium text-slate-500">Đang tải cấu trúc bài thi...</p>
                        </div>
                    ) : (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit, onValidationError)} className="flex flex-col flex-1 overflow-hidden">
                                {/* Body (Có thể cuộn bên trong) - Tách biệt vùng cuộn */}
                                <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50">
                                    
                                    {isLocked && (
                                        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-5 rounded-2xl flex gap-3.5 shadow-sm items-start">
                                            <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                            <div>
                                                <h4 className="font-bold text-base">Đề thi đã bị khóa chỉnh sửa phần Bốc đề</h4>
                                                <p className="text-sm mt-1 opacity-90 leading-relaxed">Hệ thống ghi nhận đã có học sinh nộp bài hoặc đang làm bài. Để đảm bảo công bằng và toàn vẹn dữ liệu lịch sử, bạn không thể thay đổi thuật toán bốc đề lúc này.</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Phần 1: Tên bài và Tổng điểm */}
                                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm grid grid-cols-12 gap-6 items-center">
                                        <div className="col-span-12 md:col-span-9">
                                            <FormField control={form.control} name="title" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="font-bold text-slate-800 text-base">Tên bài kiểm tra <span className="text-red-500">*</span></FormLabel>
                                                    <FormControl>
                                                        <Input {...field} disabled={isUpdating} placeholder="VD: Bài kiểm tra định kỳ lần 1 - Lớp 10A1" className="h-12 border-slate-200 focus-visible:ring-primary/50 text-base rounded-xl" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}/>
                                        </div>
                                        <div className="col-span-12 md:col-span-3">
                                            <FormField control={form.control} name="totalScore" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="font-bold text-slate-800 text-base">Tổng điểm</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" min={1} disabled={isUpdating} {...field} onChange={e => field.onChange(Number(e.target.value))} className="h-12 text-center font-black text-2xl text-primary border-slate-200 focus-visible:ring-primary/50 rounded-xl" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}/>
                                        </div>
                                    </div>

                                    {/* Phần 2: Cấu hình Luật (Rule) */}
                                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
                                        <h4 className="text-base font-bold text-slate-800 flex items-center gap-2.5">
                                            <div className="p-1.5 rounded-md bg-primary/10 text-primary"><Settings2 className="w-4 h-4" /></div>
                                            Cấu hình Luật làm bài & Hiển thị kết quả
                                        </h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                                            <FormField control={form.control} name="examRules.timeLimit" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[11px] uppercase text-slate-500 font-bold tracking-wider">Thời gian (Phút)</FormLabel>
                                                    <FormControl><Input type="number" min={0} disabled={isUpdating} {...field} onChange={e => field.onChange(Number(e.target.value))} className="h-11 rounded-lg focus-visible:ring-primary/50" /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}/>
                                            
                                            <FormField control={form.control} name="examRules.maxAttempts" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[11px] uppercase text-slate-500 font-bold tracking-wider flex items-center justify-between">
                                                        Lượt làm tối đa 
                                                        <span className="normal-case font-medium text-[10px] text-primary bg-primary/5 px-1.5 py-0.5 rounded">(0 = Vô cực)</span>
                                                    </FormLabel>
                                                    <FormControl><Input type="number" min={0} disabled={isUpdating} {...field} onChange={e => field.onChange(Number(e.target.value))} className="h-11 rounded-lg focus-visible:ring-primary/50" /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}/>

                                            <FormField control={form.control} name="examRules.passPercentage" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[11px] uppercase text-slate-500 font-bold tracking-wider">Điểm đạt (%)</FormLabel>
                                                    <FormControl><Input type="number" min={0} max={100} disabled={isUpdating} {...field} onChange={e => field.onChange(Number(e.target.value))} className="h-11 rounded-lg focus-visible:ring-primary/50" /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}/>
                                            
                                            <FormField control={form.control} name="examRules.showResultMode" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[11px] uppercase text-slate-500 font-bold tracking-wider">Chế độ xem đáp án</FormLabel>
                                                    <Select disabled={isUpdating} value={field.value} onValueChange={field.onChange}>
                                                        <FormControl><SelectTrigger className="h-11 rounded-lg text-sm focus:ring-primary/50 border-slate-200"><SelectValue placeholder="Chọn mode" /></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="IMMEDIATELY">Xem ngay sau khi nộp</SelectItem>
                                                            <SelectItem value="AFTER_END_TIME">Sau khi hết thời gian làm bài</SelectItem>
                                                            <SelectItem value="NEVER">Không bao giờ hiển thị</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )}/>
                                        </div>
                                    </div>

                                    {/* Phần 3: Builder Matrix */}
                                    <div className="space-y-5">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3 tracking-tight">
                                                <div className="p-2 rounded-lg bg-primary text-white shadow-md"><Settings className="w-5 h-5" /></div>
                                                Cấu hình Ma trận bốc đề Dynamic
                                            </h3>
                                            {!subjectId && <div className="text-xs text-red-600 font-bold mt-1 bg-red-100 px-3 py-1 rounded-full flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5"/> CẢNH BÁO: Bạn chưa thiết lập Môn học trong cấu hình chung khóa học.</div>}
                                        </div>

                                        <div className="bg-white p-7 rounded-2xl border border-primary/20 shadow-lg relative">
                                            {/* Lớp phủ chặn thao tác khi bị khóa */}
                                            {isLocked && <div className="absolute inset-0 z-10 bg-slate-50/50 backdrop-blur-[2px] rounded-2xl cursor-not-allowed"></div>}

                                            {isLoadingFilters ? (
                                                <div className="flex justify-center items-center p-20 flex-col gap-3 text-primary">
                                                    <Loader2 className="w-8 h-8 animate-spin" />
                                                    <span className="text-sm font-medium">Đang tải cấu hình kho câu hỏi...</span>
                                                </div>
                                            ) : (
                                                <div className="space-y-5">
                                                    <DynamicQuizBuilder 
                                                        folders={folders} topics={topics} activeFilters={activeFilters} disabled={isFormLocked} 
                                                    />
                                                    
                                                    <div className="flex justify-end pt-3 border-t border-slate-100">
                                                        <Button 
                                                            type="button" 
                                                            variant="ghost" 
                                                            size="sm"
                                                            className="text-primary hover:bg-primary/5 font-bold rounded-lg"
                                                            onClick={async () => {
                                                                const ok = await form.trigger('dynamicConfig.adHocSections');
                                                                if (ok) setIsSaveOpen(true);
                                                                else toast.error('Cấu trúc chưa hoàn thiện', { description: 'Vui lòng điền đầy đủ thông tin bắt buộc và xử lý các lỗi đỏ trước khi lưu Khuôn mẫu.' });
                                                            }}
                                                            disabled={isFormLocked}
                                                        >
                                                            <Save className="w-4 h-4 mr-2" /> Lưu cấu hình này thành Khuôn mẫu mới
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Footer (Cố định) */}
                                <DialogFooter className="px-6 py-4 border-t bg-white shrink-0 z-10 shadow-up flex items-center justify-between">
                                    <Button type="button" variant="ghost" onClick={onClose} disabled={isUpdating} className="font-medium text-slate-600 rounded-lg">Hủy bỏ</Button>
                                    <div className="flex items-center gap-3">
                                        {!isLocked && (
                                            <Button type="button" variant="outline" className="border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 rounded-lg h-10 px-5 active:scale-95 transition-all" onClick={handlePreview} disabled={isFormLocked || cooldown > 0}>
                                                {isPreviewing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Eye className="w-4 h-4 mr-2" />}
                                                {cooldown > 0 ? `Xem trước (${cooldown}s)` : 'Xem thử Đề sinh ngẫu nhiên'}
                                            </Button>
                                        )}
                                        <Button type="submit" disabled={isUpdating || isLocked} className="bg-primary hover:bg-primary/90 text-white rounded-lg h-10 px-8 font-bold active:scale-95 transition-all shadow-md shadow-primary/20">
                                            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
                                            Lưu Bài Kiểm Tra
                                        </Button>
                                    </div>
                                </DialogFooter>
                            </form>
                        </Form>
                    )}
                </DialogContent>
            </Dialog>

            <MatrixLibraryDialog isOpen={isLibOpen} onClose={() => setIsLibOpen(false)} courseId={courseId} onApply={handleApplyTemplate} />
            <SaveMatrixDialog isOpen={isSaveOpen} onClose={() => setIsSaveOpen(false)} currentSections={form.getValues('dynamicConfig.adHocSections') || []} onSuccess={() => setIsSaveOpen(false)} />
            {previewData && <QuizLivePreviewModal isOpen={!!previewData} onClose={() => setPreviewData(null)} questions={previewData.questions} totalItems={previewData.totalItems} totalActualQuestions={previewData.actual} />}
        </>
    );
}