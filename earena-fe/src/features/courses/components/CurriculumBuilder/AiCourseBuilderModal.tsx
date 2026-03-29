'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sparkles, FileText, Loader2, X, UploadCloud } from 'lucide-react';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { useGenerateAiCurriculum } from '../../hooks/useCurriculumMutations';
import { AiBuilderFormDTO, aiBuilderFormSchema } from '../../types/curriculum.schema';

interface AiCourseBuilderModalProps {
    courseId: string;
    isOpen: boolean;
    onClose: () => void;
}

export function AiCourseBuilderModal({ courseId, isOpen, onClose }: AiCourseBuilderModalProps) {
    const { mutate: generateAiCurriculum, isPending } = useGenerateAiCurriculum(courseId);

    const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm<AiBuilderFormDTO>({
        resolver: zodResolver(aiBuilderFormSchema),
        defaultValues: {
            files: [],
            targetSectionCount: undefined,
            additionalInstructions: '',
        },
    });

    const selectedFiles = watch('files');

    const handleClose = () => {
        reset();
        onClose();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const fileArray = Array.from(e.target.files);
            // Kết hợp file cũ và mới, giới hạn preview ở UX (Zod sẽ validate lại sau)
            const mergedFiles = [...selectedFiles, ...fileArray].slice(0, 5);
            setValue('files', mergedFiles, { shouldValidate: true, shouldDirty: true });
        }
        // Reset giá trị input để có thể chọn lại cùng 1 file nếu lỡ xóa
        e.target.value = '';
    };

    const removeFile = (indexToRemove: number) => {
        const newFiles = selectedFiles.filter((_, index) => index !== indexToRemove);
        setValue('files', newFiles, { shouldValidate: true, shouldDirty: true });
    };

    const onSubmit = (data: AiBuilderFormDTO) => {
        generateAiCurriculum(data, {
            onSuccess: () => {
                handleClose(); // Tự động đóng form khi thành công, BuilderBoard sẽ tự fetch lại data
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !isPending && handleClose()}>
            <DialogContent
                className="sm:max-w-[600px]"
                // Khóa an toàn: Chặn click ra ngoài hoặc bấm Esc khi AI đang chạy
                onInteractOutside={(e) => { if (isPending) e.preventDefault(); }}
                onEscapeKeyDown={(e) => { if (isPending) e.preventDefault(); }}
            >
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Sparkles className="w-5 h-5 text-purple-600" /> AI Course Builder
                    </DialogTitle>
                    <DialogDescription>
                        Tải lên tài liệu (.pdf, .docx, .txt) để AI phân tích và tự động lên khung chương trình giảng dạy. Tối đa 5 file, 15MB/file.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-4">
                    {/* Khu vực Upload Files */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold">Tài liệu tham khảo <span className="text-red-500">*</span></label>
                            <span className="text-xs text-muted-foreground">{selectedFiles.length}/5 file</span>
                        </div>

                        {/* Hidden Input File */}
                        <input
                            type="file"
                            id="ai-file-upload"
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
                            onClick={() => document.getElementById('ai-file-upload')?.click()}
                            disabled={isPending || selectedFiles.length >= 5}
                        >
                            <UploadCloud className="w-4 h-4 mr-2" /> Thêm tài liệu
                        </Button>
                        {errors.files && <p className="text-[12px] font-medium text-red-500">{errors.files.message}</p>}

                        {/* Hiển thị danh sách file đã chọn */}
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

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 col-span-2 sm:col-span-1">
                            <label className="text-sm font-semibold">Số lượng chương (Tùy chọn)</label>
                            <Input
                                type="number"
                                placeholder="VD: 5"
                                {...register('targetSectionCount')}
                                disabled={isPending}
                            />
                            {errors.targetSectionCount && <p className="text-[12px] font-medium text-red-500">{errors.targetSectionCount.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Dặn dò thêm cho AI (Tùy chọn)</label>
                        <Textarea
                            placeholder='VD: "Tập trung vào phần bài tập thực hành, ngôn từ học thuật..."'
                            rows={3}
                            {...register('additionalInstructions')}
                            disabled={isPending}
                        />
                        {errors.additionalInstructions && <p className="text-[12px] font-medium text-red-500">{errors.additionalInstructions.message}</p>}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <Button type="button" variant="ghost" onClick={handleClose} disabled={isPending}>Hủy</Button>
                        <Button type="submit" disabled={isPending} className={isPending ? "bg-purple-600 w-[240px]" : "bg-purple-600 hover:bg-purple-700"}>
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    AI đang nghiền ngẫm...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4" /> Bắt đầu tạo tự động
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}