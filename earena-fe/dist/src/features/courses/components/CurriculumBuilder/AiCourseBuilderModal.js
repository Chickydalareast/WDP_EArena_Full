'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiCourseBuilderModal = AiCourseBuilderModal;
const react_hook_form_1 = require("react-hook-form");
const rhf_zod_resolver_1 = require("@/shared/lib/rhf-zod-resolver");
const lucide_react_1 = require("lucide-react");
const dialog_1 = require("@/shared/components/ui/dialog");
const button_1 = require("@/shared/components/ui/button");
const input_1 = require("@/shared/components/ui/input");
const textarea_1 = require("@/shared/components/ui/textarea");
const useCurriculumMutations_1 = require("../../hooks/useCurriculumMutations");
const curriculum_schema_1 = require("../../types/curriculum.schema");
function AiCourseBuilderModal({ courseId, isOpen, onClose }) {
    const { mutate: generateAiCurriculum, isPending } = (0, useCurriculumMutations_1.useGenerateAiCurriculum)(courseId);
    const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = (0, react_hook_form_1.useForm)({
        resolver: (0, rhf_zod_resolver_1.rhfZodResolver)(curriculum_schema_1.aiBuilderFormSchema),
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
    const handleFileChange = (e) => {
        if (e.target.files) {
            const fileArray = Array.from(e.target.files);
            const mergedFiles = [...selectedFiles, ...fileArray].slice(0, 5);
            setValue('files', mergedFiles, { shouldValidate: true, shouldDirty: true });
        }
        e.target.value = '';
    };
    const removeFile = (indexToRemove) => {
        const newFiles = selectedFiles.filter((_, index) => index !== indexToRemove);
        setValue('files', newFiles, { shouldValidate: true, shouldDirty: true });
    };
    const onSubmit = (data) => {
        generateAiCurriculum(data, {
            onSuccess: () => {
                handleClose();
            },
        });
    };
    return (<dialog_1.Dialog open={isOpen} onOpenChange={(open) => !open && !isPending && handleClose()}>
            <dialog_1.DialogContent className="sm:max-w-[600px]" onInteractOutside={(e) => { if (isPending)
        e.preventDefault(); }} onEscapeKeyDown={(e) => { if (isPending)
        e.preventDefault(); }}>
                <dialog_1.DialogHeader>
                    <dialog_1.DialogTitle className="flex items-center gap-2 text-xl">
                        <lucide_react_1.Sparkles className="w-5 h-5 text-purple-600"/> AI Course Builder
                    </dialog_1.DialogTitle>
                    <dialog_1.DialogDescription>
                        Tải lên tài liệu (.pdf, .docx, .txt) để AI phân tích và tự động lên khung chương trình giảng dạy. Tối đa 5 file, 15MB/file.
                    </dialog_1.DialogDescription>
                </dialog_1.DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-4">
                    
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold">Tài liệu tham khảo <span className="text-red-500">*</span></label>
                            <span className="text-xs text-muted-foreground">{selectedFiles.length}/5 file</span>
                        </div>

                        
                        <input type="file" id="ai-file-upload" multiple accept=".pdf,application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.txt,text/plain" className="hidden" onChange={handleFileChange} disabled={isPending || selectedFiles.length >= 5}/>

                        <button_1.Button type="button" variant="outline" className="w-full h-12 border-dashed border-2 hover:bg-slate-50" onClick={() => document.getElementById('ai-file-upload')?.click()} disabled={isPending || selectedFiles.length >= 5}>
                            <lucide_react_1.UploadCloud className="w-4 h-4 mr-2"/> Thêm tài liệu
                        </button_1.Button>
                        {errors.files && <p className="text-[12px] font-medium text-red-500">{errors.files.message}</p>}

                        
                        {selectedFiles.length > 0 && (<div className="space-y-2 mt-2 max-h-[150px] overflow-y-auto custom-scrollbar">
                                {selectedFiles.map((file, index) => (<div key={`${file.name}-${index}`} className="flex items-center justify-between p-2.5 bg-muted/30 border border-border rounded-lg text-sm">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <lucide_react_1.FileText className="w-4 h-4 text-primary shrink-0"/>
                                            <span className="truncate font-medium">{file.name}</span>
                                            <span className="text-xs text-muted-foreground shrink-0">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                        </div>
                                        <button_1.Button type="button" variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:bg-destructive/10 shrink-0" onClick={() => removeFile(index)} disabled={isPending}>
                                            <lucide_react_1.X className="w-4 h-4"/>
                                        </button_1.Button>
                                    </div>))}
                            </div>)}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 col-span-2 sm:col-span-1">
                            <label className="text-sm font-semibold">Số lượng chương (Tùy chọn)</label>
                            <input_1.Input type="number" placeholder="VD: 5" {...register('targetSectionCount')} disabled={isPending}/>
                            {errors.targetSectionCount && <p className="text-[12px] font-medium text-red-500">{errors.targetSectionCount.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Dặn dò thêm cho AI (Tùy chọn)</label>
                        <textarea_1.Textarea placeholder='VD: "Tập trung vào phần bài tập thực hành, ngôn từ học thuật..."' rows={3} {...register('additionalInstructions')} disabled={isPending}/>
                        {errors.additionalInstructions && <p className="text-[12px] font-medium text-red-500">{errors.additionalInstructions.message}</p>}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <button_1.Button type="button" variant="ghost" onClick={handleClose} disabled={isPending}>Hủy</button_1.Button>
                        <button_1.Button type="submit" disabled={isPending} className={isPending ? "bg-purple-600 w-[240px]" : "bg-purple-600 hover:bg-purple-700"}>
                            {isPending ? (<>
                                    <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                    AI đang nghiền ngẫm...
                                </>) : (<>
                                    <lucide_react_1.Sparkles className="mr-2 h-4 w-4"/> Bắt đầu tạo tự động
                                </>)}
                        </button_1.Button>
                    </div>
                </form>
            </dialog_1.DialogContent>
        </dialog_1.Dialog>);
}
//# sourceMappingURL=AiCourseBuilderModal.js.map