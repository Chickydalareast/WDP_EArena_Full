'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { rhfZodResolver as zodResolver } from '@/shared/lib/rhf-zod-resolver';
import { Sparkles, FileText, Loader2, X, UploadCloud } from 'lucide-react';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { AiQuestionBuilderSchema, AiQuestionBuilderDTO } from '../types/question-bank.schema';
import { useGenerateAiQuestions } from '../hooks/useBankMutations';

interface AiQuestionBuilderModalProps {
    folderId: string;
    isOpen: boolean;
    onClose: () => void;
}

export function AiQuestionBuilderModal({ folderId, isOpen, onClose }: AiQuestionBuilderModalProps) {
    const { mutate: generateAiQuestions, isPending } = useGenerateAiQuestions();

    const { handleSubmit, setValue, watch, formState: { errors }, reset } = useForm<AiQuestionBuilderDTO>({
        resolver: zodResolver(AiQuestionBuilderSchema),
        defaultValues: {
            files: [],
            folderId: folderId, // Gắn sẵn context thư mục hiện tại
            additionalInstructions: '',
        },
    });

    const selectedFiles = watch('files');

    // Đảm bảo cập nhật folderId vào form nếu user đổi thư mục mà form chưa kịp reset
    useEffect(() => {
        if (folderId) {
            setValue('folderId', folderId);
        }
    }, [folderId, setValue]);

    const handleClose = () => {
        reset();
        onClose();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const fileArray = Array.from(e.target.files);
            const mergedFiles = [...selectedFiles, ...fileArray].slice(0, 5); // Cắt cứng 5 file cho UX
            setValue('files', mergedFiles, { shouldValidate: true, shouldDirty: true });
        }
        // Trả lại giá trị rỗng để OS File Picker cho phép chọn lại cùng 1 file (nếu lỡ xóa)
        e.target.value = '';
    };

    const removeFile = (indexToRemove: number) => {
        const newFiles = selectedFiles.filter((_, index) => index !== indexToRemove);
        setValue('files', newFiles, { shouldValidate: true, shouldDirty: true });
    };

    const onSubmit = (data: AiQuestionBuilderDTO) => {
        generateAiQuestions(data, {
            onSuccess: () => {
                handleClose(); // Tự động đóng modal khi nhận HTTP 201
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !isPending && handleClose()}>
            <DialogContent
                className="sm:max-w-[600px]"
                // Khóa an toàn: Chặn tương tác khi đang xử lý LLM
                onInteractOutside={(e) => { if (isPending) e.preventDefault(); }}
                onEscapeKeyDown={(e) => { if (isPending) e.preventDefault(); }}
            >
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Sparkles className="w-5 h-5 text-purple-600" /> AI Question Builder
                    </DialogTitle>
                    <DialogDescription>
                        Tải lên tài liệu (.pdf, .docx, .txt) để AI tự động phân tích và bóc tách thành ngân hàng câu hỏi. Tối đa 5 file, dung lượng tối đa 15MB/file.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-4">
                    {/* Khu vực Upload Files */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold">Đề thi / Tài liệu tham khảo <span className="text-red-500">*</span></label>
                            <span className="text-xs text-muted-foreground">{selectedFiles.length}/5 file</span>
                        </div>

                        {/* Input File Ẩn (Bảo vệ bằng strict accept mime-types) */}
                        <input
                            type="file"
                            id="ai-question-file-upload"
                            multiple
                            accept=".pdf,application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.txt,text/plain"
                            className="hidden"
                            onChange={handleFileChange}
                            disabled={isPending || selectedFiles.length >= 5}
                        />

                        <Button
                            type="button"
                            variant="outline"
                            className="w-full h-12 border-dashed border-2 hover:bg-slate-50"
                            onClick={() => document.getElementById('ai-question-file-upload')?.click()}
                            disabled={isPending || selectedFiles.length >= 5}
                        >
                            <UploadCloud className="w-4 h-4 mr-2" /> Chọn tài liệu tải lên
                        </Button>
                        {errors.files && <p className="text-[12px] font-medium text-red-500">{errors.files.message}</p>}

                        {/* Render Danh sách file đã chọn */}
                        {selectedFiles.length > 0 && (
                            <div className="space-y-2 mt-2 max-h-[150px] overflow-y-auto custom-scrollbar">
                                {selectedFiles.map((file, index) => (
                                    <div key={`${file.name}-${index}`} className="flex items-center justify-between p-2.5 bg-muted/30 border border-border rounded-lg text-sm">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <FileText className="w-4 h-4 text-primary shrink-0" />
                                            <span className="truncate font-medium">{file.name}</span>
                                            <span className="text-xs text-muted-foreground shrink-0">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="w-7 h-7 text-destructive hover:bg-destructive/10 shrink-0"
                                            onClick={() => removeFile(index)}
                                            disabled={isPending}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Dặn dò thêm cho AI (Tùy chọn)</label>
                        <Textarea
                            placeholder='VD: "Nếu câu hỏi tiếng Anh, hãy dịch nội dung sang tiếng Việt", hoặc "Tự động phân loại độ khó giúp tôi"'
                            rows={3}
                            // Custom onChange để nhét vào hook-form
                            onChange={(e) => setValue('additionalInstructions', e.target.value, { shouldValidate: true })}
                            disabled={isPending}
                        />
                        {errors.additionalInstructions && <p className="text-[12px] font-medium text-red-500">{errors.additionalInstructions.message}</p>}
                    </div>

                    {/* Dòng chữ cảnh báo thời gian */}
                    {isPending && (
                        <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200 animate-pulse">
                            Quá trình này có thể kéo dài lên đến 60 giây. Vui lòng không đóng trình duyệt...
                        </p>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <Button type="button" variant="ghost" onClick={handleClose} disabled={isPending}>Hủy</Button>
                        <Button type="submit" disabled={isPending} className={isPending ? "bg-purple-600 w-[240px]" : "bg-purple-600 hover:bg-purple-700"}>
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    AI đang phân tích...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4" /> Bóc tách Đề thi
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}