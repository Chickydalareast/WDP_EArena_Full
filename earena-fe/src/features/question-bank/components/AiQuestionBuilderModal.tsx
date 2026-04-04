'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { rhfZodResolver as zodResolver } from '@/shared/lib/rhf-zod-resolver';
import { Sparkles, FileText, Loader2, X, UploadCloud, BookOpen, BrainCircuit } from 'lucide-react';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { Input } from '@/shared/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form';
import { cn } from '@/shared/lib/utils';

import {
    AiQuestionBuilderSchema,
    AiQuestionBuilderDTO,
    AiLectureBuilderSchema,
    AiLectureBuilderDTO
} from '../types/question-bank.schema';
import { useGenerateAiQuestions, useGenerateAiFromLecture } from '../hooks/useBankMutations';
import { usePreventNavigation } from '@/shared/hooks/usePreventNavigation';

// --- SUB COMPONENT 1: LOADING TEXT ANIMATION ---
const LOADING_MESSAGES = [
    "AI đang đọc tài liệu...",
    "Đang phân tích cấu trúc kiến thức...",
    "Đang biên soạn phương án nhiễu...",
    "Đang phân bổ độ khó (NB, TH, VD, VDC)...",
    "Đang hoàn thiện bộ câu hỏi..."
];

function CyclingLoadingText() {
    const [msgIndex, setMsgIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
        }, 4000); // Đổi text mỗi 4 giây
        return () => clearInterval(interval);
    }, []);

    return (
        <span className="animate-pulse">{LOADING_MESSAGES[msgIndex]}</span>
    );
}


// --- SUB COMPONENT 2: FORM TRÍCH XUẤT ĐỀ THI (MODE 1 - CŨ) ---
function AiExtractForm({ folderId, onSuccess, onCancel }: { folderId: string, onSuccess: () => void, onCancel: () => void }) {
    const { mutate: generateAiQuestions, isPending } = useGenerateAiQuestions();
    usePreventNavigation(isPending);

    const form = useForm<AiQuestionBuilderDTO>({
        resolver: zodResolver(AiQuestionBuilderSchema),
        defaultValues: { files: [], folderId, additionalInstructions: '' },
    });

    const selectedFiles = form.watch('files');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const fileArray = Array.from(e.target.files);
            const mergedFiles = [...selectedFiles, ...fileArray].slice(0, 5);
            form.setValue('files', mergedFiles, { shouldValidate: true, shouldDirty: true });
        }
        e.target.value = '';
    };

    const onSubmit = (data: AiQuestionBuilderDTO) => {
        generateAiQuestions(data, { onSuccess });
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            {/* Bento Block 1: Upload Area */}
            <div className="bg-muted/40 p-5 rounded-2xl border border-border/60 shadow-inner-sm">
                <div className="flex items-center justify-between mb-4 gap-2">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                            <UploadCloud className="w-5 h-5 text-primary" />
                        </div>
                        <label className="text-base font-semibold text-foreground">Đề thi mẫu <span className="text-destructive">*</span></label>
                    </div>
                    <span className="text-xs font-mono bg-background px-2.5 py-1 rounded-full border border-border">{selectedFiles.length}/5 file</span>
                </div>

                <input
                    type="file"
                    id="ai-extract-upload"
                    multiple
                    accept=".pdf,application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.txt,text/plain"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isPending || selectedFiles.length >= 5}
                />

                <Button
                    type="button"
                    variant="outline"
                    className="w-full h-24 border-dashed border-2 bg-background hover:bg-accent hover:text-accent-foreground hover:border-primary/40 flex flex-col gap-2 rounded-xl transition-all"
                    onClick={() => document.getElementById('ai-extract-upload')?.click()}
                    disabled={isPending || selectedFiles.length >= 5}
                >
                    <UploadCloud className="w-7 h-7 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Nhấn để tải lên hoặc kéo thả</span>
                    <span className="text-xs text-muted-foreground/80">Hỗ trợ: PDF, DOCX, TXT (Tối đa 15MB/file)</span>
                </Button>

                {form.formState.errors.files && <p className="text-[12px] font-medium text-destructive mt-2 ml-1">{form.formState.errors.files.message}</p>}

                {selectedFiles.length > 0 && (
                    <div className="space-y-2 mt-4 max-h-[160px] overflow-y-auto custom-scrollbar pr-1">
                        {selectedFiles.map((file, index) => (
                            <div key={`${file.name}-${index}`} className="flex items-center justify-between p-3 bg-card border border-border rounded-xl text-sm shadow-sm animate-in fade-in-50 slide-in-from-bottom-1 duration-200">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="p-1.5 bg-primary/5 rounded-md border border-primary/10 shrink-0">
                                        <FileText className="w-4 h-4 text-primary" />
                                    </div>
                                    <span className="truncate font-medium text-foreground">{file.name}</span>
                                    <span className="text-xs text-muted-foreground shrink-0 font-mono">({(file.size / (1024 * 1024)).toFixed(1)} MB)</span>
                                </div>
                                <Button
                                    type="button" variant="ghost" size="icon" className="w-8 h-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                                    onClick={() => form.setValue('files', selectedFiles.filter((_, i) => i !== index))}
                                    disabled={isPending}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Bento Block 2: Instructions */}
            <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
                <div className="flex items-center gap-2.5 mb-4">
                    <div className="p-2 bg-secondary rounded-lg border border-border">
                        <Sparkles className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <label className="text-base font-semibold text-foreground">Dặn dò thêm cho AI (Tùy chọn)</label>
                </div>
                <Textarea
                    placeholder='VD: "Nếu câu hỏi tiếng Anh, hãy dịch nội dung sang tiếng Việt..." hoặc "Tập trung trích xuất các câu hỏi về phần Ancol..."'
                    rows={3}
                    className="resize-none rounded-xl focus-visible:ring-primary/20"
                    onChange={(e) => form.setValue('additionalInstructions', e.target.value)}
                    disabled={isPending}
                />
            </div>

            {isPending && (
                <div className="text-sm text-amber-800 bg-amber-50 p-4 rounded-xl border border-amber-200 animate-pulse flex items-start gap-3 shadow-inner-sm">
                    <Loader2 className="w-5 h-5 animate-spin text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1">
                        <span className="font-semibold">AI đang tiến hành bóc tách dữ liệu</span>
                        <span className="text-xs text-amber-700/90">Quá trình này có thể kéo dài lên đến 60 giây do độ phức tạp của tài liệu. Vui lòng không đóng trình duyệt hoặc reload trang...</span>
                    </div>
                </div>
            )}

            <div className="flex justify-end gap-3 pt-5 border-t border-border mt-2">
                <Button type="button" variant="ghost" className="rounded-full px-5" onClick={onCancel} disabled={isPending}>Hủy</Button>
                <Button type="submit" disabled={isPending} className="rounded-full min-w-[180px] font-semibold shadow-md transition-all active:scale-95">
                    {isPending ? <><Loader2 className="mr-2.5 h-4 w-4 animate-spin" /> Đang bóc tách...</> : <><Sparkles className="mr-2.5 h-4 w-4" /> Bóc tách Đề thi</>}
                </Button>
            </div>
        </form>
    );
}

// --- SUB COMPONENT 3: FORM SINH TỪ BÀI GIẢNG (MODE 2 - MỚI) ---
function AiLectureForm({ folderId, onSuccess, onCancel }: { folderId: string, onSuccess: () => void, onCancel: () => void }) {
    const { mutate: generateAiFromLecture, isPending } = useGenerateAiFromLecture();
    usePreventNavigation(isPending);

    const form = useForm<AiLectureBuilderDTO>({
        resolver: zodResolver(AiLectureBuilderSchema),
        defaultValues: { files: [], folderId, questionCount: 10, additionalInstructions: '' },
    });

    const selectedFiles = form.watch('files');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const fileArray = Array.from(e.target.files);
            const mergedFiles = [...selectedFiles, ...fileArray].slice(0, 5);
            form.setValue('files', mergedFiles, { shouldValidate: true, shouldDirty: true });
        }
        e.target.value = '';
    };

    const onSubmit = (data: AiLectureBuilderDTO) => {
        generateAiFromLecture(data, { onSuccess });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                {/* Bento Block 1: Upload Area */}
                <div className="bg-muted/40 p-5 rounded-2xl border border-border/60 shadow-inner-sm">
                    <div className="flex items-center justify-between mb-4 gap-2">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                                <BookOpen className="w-5 h-5 text-primary" />
                            </div>
                            <label className="text-base font-semibold text-foreground">Tài liệu / Bài giảng <span className="text-destructive">*</span></label>
                        </div>
                        <span className="text-xs font-mono bg-background px-2.5 py-1 rounded-full border border-border">{selectedFiles.length}/5 file</span>
                    </div>

                    <input
                        type="file"
                        id="ai-lecture-upload"
                        multiple
                        accept=".pdf,application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.txt,text/plain"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={isPending || selectedFiles.length >= 5}
                    />

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full h-24 border-dashed border-2 bg-background hover:bg-accent hover:text-accent-foreground hover:border-primary/40 flex flex-col gap-2 rounded-xl transition-all"
                        onClick={() => document.getElementById('ai-lecture-upload')?.click()}
                        disabled={isPending || selectedFiles.length >= 5}
                    >
                        <UploadCloud className="w-7 h-7 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">Nhấn để tải lên hoặc kéo thả</span>
                        <span className="text-xs text-muted-foreground/80">Hỗ trợ: PDF, DOCX, TXT (Tối đa 15MB/file)</span>
                    </Button>

                    {form.formState.errors.files && <p className="text-[12px] font-medium text-destructive mt-2 ml-1">{form.formState.errors.files.message}</p>}

                    {selectedFiles.length > 0 && (
                        <div className="space-y-2 mt-4 max-h-[160px] overflow-y-auto custom-scrollbar pr-1">
                            {selectedFiles.map((file, index) => (
                                <div key={`${file.name}-${index}`} className="flex items-center justify-between p-3 bg-card border border-border rounded-xl text-sm shadow-sm animate-in fade-in-50 slide-in-from-bottom-1 duration-200">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="p-1.5 bg-primary/5 rounded-md border border-primary/10 shrink-0">
                                            <FileText className="w-4 h-4 text-primary" />
                                        </div>
                                        <span className="truncate font-medium text-foreground">{file.name}</span>
                                        <span className="text-xs text-muted-foreground shrink-0 font-mono">({(file.size / (1024 * 1024)).toFixed(1)} MB)</span>
                                    </div>
                                    <Button
                                        type="button" variant="ghost" size="icon" className="w-8 h-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                                        onClick={() => form.setValue('files', selectedFiles.filter((_, i) => i !== index))}
                                        disabled={isPending}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Bento Block 2: Configs & Instructions */}
                <div className="bg-card p-5 rounded-2xl border border-border shadow-sm space-y-5">
                    <div className="flex items-center gap-2.5 mb-1">
                        <div className="p-2 bg-secondary rounded-lg border border-border">
                            <BrainCircuit className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <label className="text-base font-semibold text-foreground">Cấu hình Sinh câu hỏi</label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FormField
                            control={form.control}
                            name="questionCount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-medium text-sm text-foreground/90">Số lượng câu hỏi mong muốn <span className="text-destructive">*</span></FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={1}
                                            max={50}
                                            className="rounded-xl focus-visible:ring-primary/20 font-mono"
                                            disabled={isPending}
                                            {...field}
                                            onChange={(e) => field.onChange(parseInt(e.target.value, 10) || '')}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="additionalInstructions"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-medium text-sm text-foreground/90">Yêu cầu cụ thể cho AI (Tùy chọn)</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder='VD: "Trọng tâm vào phần khái niệm và công thức tính nhanh", "Tạo câu hỏi trắc nghiệm 4 đáp án", "Phân bổ 30% Nhận biết, 40% Thông hiểu, 30% Vận dụng"'
                                        rows={3}
                                        className="resize-none rounded-xl focus-visible:ring-primary/20"
                                        disabled={isPending}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage className="text-xs" />
                            </FormItem>
                        )}
                    />
                </div>

                {isPending && (
                    <div className="text-sm text-primary bg-primary/5 p-4 rounded-xl border border-primary/20 animate-pulse flex items-start gap-3 shadow-inner-sm">
                        <Loader2 className="w-5 h-5 animate-spin text-primary shrink-0 mt-0.5" />
                        <div className="flex flex-col gap-1">
                            <span className="font-semibold text-primary">AI đang "chiêm nghiệm" bài giảng và biên soạn câu hỏi</span>
                            <div className="text-xs text-primary/90 font-medium">
                                <CyclingLoadingText />
                            </div>
                            <span className="text-xs text-primary/80 mt-1">Tiến trình này có thể mất 1-2 phút tùy thuộc vào độ dài tài liệu. Vui lòng kiên nhẫn...</span>
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-5 border-t border-border mt-2">
                    <Button type="button" variant="ghost" className="rounded-full px-5" onClick={onCancel} disabled={isPending}>Hủy</Button>
                    <Button type="submit" disabled={isPending} className="rounded-full min-w-[180px] font-semibold shadow-md transition-all active:scale-95">
                        {isPending ? <><Loader2 className="mr-2.5 h-4 w-4 animate-spin" /> Đang xử lý...</> : <><Sparkles className="mr-2.5 h-4 w-4" /> Sinh câu hỏi ngay</>}
                    </Button>
                </div>
            </form>
        </Form>
    );
}

// --- MAIN HUB COMPONENT ---
interface AiQuestionBuilderModalProps {
    folderId: string;
    isOpen: boolean;
    onClose: () => void;
}

export function AiQuestionBuilderModal({ folderId, isOpen, onClose }: AiQuestionBuilderModalProps) {
    const [activeTab, setActiveTab] = useState<string>("extract");

    // Reset tab về default mỗi khi mở modal
    useEffect(() => {
        if (isOpen) setActiveTab("extract");
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            // Ngăn tắt Modal nếu click ra ngoài khi đang pending (Tránh race condition)
            if (!open) onClose();
        }}>
            <DialogContent
                className="sm:max-w-[680px] p-0 overflow-hidden rounded-3xl border-border shadow-xl"
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                {/* Header Bento style */}
                <div className="px-7 py-5 border-b bg-muted/30 flex items-center gap-4">
                    <div className="p-3 bg-background rounded-2xl border border-border shadow-inner-sm shrink-0">
                        <BrainCircuit className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                        <DialogTitle className="text-2xl font-bold text-foreground">AI Question Studio</DialogTitle>
                        <DialogDescription className="text-sm m-0 mt-1 text-muted-foreground/90">
                            Trợ lý AI giúp bạn xây dựng ngân hàng câu hỏi chất lượng cao chỉ trong vài phút.
                        </DialogDescription>
                    </div>
                </div>

                <div className="p-7 pt-3">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="flex w-full h-12 mb-6 bg-muted/80 p-1.5 rounded-full border border-border/50 shadow-inner-sm">
                            <TabsTrigger
                                value="extract"
                                className="flex-1 h-full rounded-full text-sm font-semibold text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-2"
                            >
                                <UploadCloud className="w-4.5 h-4.5" />
                                Bóc tách Format Đề
                            </TabsTrigger>

                            <TabsTrigger
                                value="lecture"
                                className="flex-1 h-full rounded-full text-sm font-semibold text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-2"
                            >
                                <BookOpen className="w-4.5 h-4.5" />
                                Chiêm nghiệm Bài giảng
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="extract" className="mt-0 outline-none focus-visible:ring-0">
                            <AiExtractForm folderId={folderId} onSuccess={onClose} onCancel={onClose} />
                        </TabsContent>

                        <TabsContent value="lecture" className="mt-0 outline-none focus-visible:ring-0">
                            <AiLectureForm folderId={folderId} onSuccess={onClose} onCancel={onClose} />
                        </TabsContent>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
}