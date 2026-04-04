'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateLessonModal = CreateLessonModal;
const react_1 = require("react");
const react_hook_form_1 = require("react-hook-form");
const rhf_zod_resolver_1 = require("@/shared/lib/rhf-zod-resolver");
const lucide_react_1 = require("lucide-react");
const sonner_1 = require("sonner");
const dialog_1 = require("@/shared/components/ui/dialog");
const button_1 = require("@/shared/components/ui/button");
const input_1 = require("@/shared/components/ui/input");
const checkbox_1 = require("@/shared/components/ui/checkbox");
const progress_1 = require("@/shared/components/ui/progress");
const rich_text_editor_1 = require("@/shared/components/ui/rich-text-editor");
const select_1 = require("@/shared/components/ui/select");
const curriculum_schema_1 = require("../../types/curriculum.schema");
const useCurriculumMutations_1 = require("../../hooks/useCurriculumMutations");
const useCloudinaryUpload_1 = require("@/shared/hooks/useCloudinaryUpload");
const ExamSelectorSheet_1 = require("./ExamSelectorSheet");
function CreateLessonModal({ courseId, sectionId, isOpen, onClose }) {
    const { mutate: createLesson, isPending: isUpdatingDB } = (0, useCurriculumMutations_1.useCreateLesson)(courseId, sectionId);
    const { uploadDirectly: uploadVideo, isUploading: isUploadingVideo, progress: videoProgress } = (0, useCloudinaryUpload_1.useCloudinaryUpload)();
    const { uploadDirectly: uploadDoc, isUploading: isUploadingDoc, progress: docProgress } = (0, useCloudinaryUpload_1.useCloudinaryUpload)();
    const isFormLocked = isUpdatingDB || isUploadingVideo || isUploadingDoc;
    const [videoPreviewUrl, setVideoPreviewUrl] = (0, react_1.useState)(null);
    const [localAttachments, setLocalAttachments] = (0, react_1.useState)([]);
    const [isExamSheetOpen, setIsExamSheetOpen] = (0, react_1.useState)(false);
    const [selectedExamTitle, setSelectedExamTitle] = (0, react_1.useState)(null);
    const { register, handleSubmit, control, watch, setValue, formState: { errors }, reset } = (0, react_hook_form_1.useForm)({
        resolver: (0, rhf_zod_resolver_1.rhfZodResolver)(curriculum_schema_1.createLessonSchema),
        defaultValues: {
            title: '',
            isFreePreview: false,
            content: '',
            attachments: [],
            examRules: {
                timeLimit: 45,
                maxAttempts: 1,
                passPercentage: 50,
                showResultMode: 'IMMEDIATELY',
            }
        },
    });
    (0, react_1.useEffect)(() => {
        return () => {
            if (videoPreviewUrl?.startsWith('blob:'))
                URL.revokeObjectURL(videoPreviewUrl);
            localAttachments.forEach(file => { if (file.url.startsWith('blob:'))
                URL.revokeObjectURL(file.url); });
        };
    }, [videoPreviewUrl, localAttachments]);
    const resetModalState = () => {
        reset();
        setVideoPreviewUrl(null);
        setLocalAttachments([]);
        setSelectedExamTitle(null);
    };
    const handleClose = () => { resetModalState(); onClose(); };
    const handleUploadVideo = async (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        const objectUrl = URL.createObjectURL(file);
        setVideoPreviewUrl(objectUrl);
        setValue('primaryVideoId', undefined, { shouldValidate: true });
        try {
            const resultMedia = await uploadVideo(file, 'lesson_video');
            if (resultMedia?.id) {
                setValue('primaryVideoId', resultMedia.id, { shouldValidate: true, shouldDirty: true });
                if (resultMedia.url)
                    setVideoPreviewUrl(resultMedia.url);
                sonner_1.toast.success('Xử lý video thành công!');
            }
        }
        catch (error) {
            setVideoPreviewUrl(null);
            setValue('primaryVideoId', undefined);
        }
        finally {
            e.target.value = '';
        }
    };
    const handleUploadAttachments = async (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length)
            return;
        for (const file of files) {
            const objectUrl = URL.createObjectURL(file);
            try {
                const resultMedia = await uploadDoc(file, 'lesson_document');
                if (resultMedia?.id) {
                    setLocalAttachments((prev) => {
                        const newArray = [...prev, { id: resultMedia.id, name: file.name, url: resultMedia.url || objectUrl }];
                        setValue('attachments', newArray.map(a => a.id), { shouldValidate: true, shouldDirty: true });
                        return newArray;
                    });
                }
            }
            catch (error) {
                URL.revokeObjectURL(objectUrl);
            }
        }
        e.target.value = '';
    };
    const removeAttachment = (idToRemove) => {
        setLocalAttachments((prev) => {
            const fileToRemove = prev.find(f => f.id === idToRemove);
            if (fileToRemove?.url.startsWith('blob:'))
                URL.revokeObjectURL(fileToRemove.url);
            const newArray = prev.filter(a => a.id !== idToRemove);
            setValue('attachments', newArray.map(a => a.id), { shouldValidate: true, shouldDirty: true });
            return newArray;
        });
    };
    const onSubmit = (data) => {
        const sanitizedPayload = {
            ...data,
            content: (!data.content || data.content.trim() === '') ? '<p></p>' : data.content,
        };
        if (!sanitizedPayload.examId) {
            delete sanitizedPayload.examRules;
        }
        createLesson(sanitizedPayload, {
            onSuccess: () => { resetModalState(); onClose(); },
        });
    };
    return (<>
      <dialog_1.Dialog open={isOpen} onOpenChange={(open) => !open && !isFormLocked && handleClose()}>
        <dialog_1.DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto" onInteractOutside={(e) => { if (isFormLocked)
        e.preventDefault(); }}>
          <dialog_1.DialogHeader>
              <dialog_1.DialogTitle className="text-2xl">Bài Học Mới (Composite)</dialog_1.DialogTitle>
              <dialog_1.DialogDescription>Kết hợp Video, Ghi chú và Bài thi Trắc nghiệm trong một bài học.</dialog_1.DialogDescription>
          </dialog_1.DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-2">
            
            <div className="space-y-4 bg-muted/10 p-5 rounded-xl border border-border">
              <div className="space-y-2">
                <label className="text-sm font-bold">Tiêu đề bài học <span className="text-red-500">*</span></label>
                <input_1.Input {...register('title')} disabled={isFormLocked} className="h-11 bg-background"/>
                {errors.title && <p className="text-xs text-red-500 font-medium">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold">Nội dung / Ghi chú (Rich Text)</label>
                <react_hook_form_1.Controller name="content" control={control} render={({ field }) => (<rich_text_editor_1.RichTextEditor value={field.value || ''} onChange={field.onChange} disabled={isFormLocked}/>)}/>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-500/5 rounded-xl border-2 border-dashed border-blue-500/20 space-y-4">
                <label className="text-sm font-bold flex items-center gap-2 text-blue-600">
                  <lucide_react_1.Video className="w-4 h-4"/> Video bài giảng
                </label>
                
                <input_1.Input type="file" accept="video/mp4,video/webm" className="hidden" id="upload-video" onChange={handleUploadVideo} disabled={isFormLocked}/>
                <button_1.Button type="button" variant="outline" className="w-full h-10 border-blue-200 hover:bg-blue-50" onClick={() => document.getElementById('upload-video')?.click()} disabled={isFormLocked}>
                  {isUploadingVideo ? <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <lucide_react_1.UploadCloud className="mr-2 h-4 w-4 text-blue-500"/>}
                  {isUploadingVideo ? 'Đang mã hóa HLS...' : (videoPreviewUrl ? 'Thay đổi Video' : 'Tải Video lên')}
                </button_1.Button>

                {isUploadingVideo && <progress_1.Progress value={videoProgress} className="h-1.5"/>}
                {videoPreviewUrl && !isUploadingVideo && (<div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border border-border flex items-center justify-center mt-3 shadow-inner">
                    <video src={videoPreviewUrl} controls controlsList="nodownload" className="w-full h-full object-contain"/>
                  </div>)}
              </div>

              
              <div className="p-4 bg-purple-500/5 rounded-xl border-2 border-dashed border-purple-500/20 space-y-4 flex flex-col">
                <label className="text-sm font-bold flex items-center gap-2 text-purple-600">
                  <lucide_react_1.CheckCircle2 className="w-4 h-4"/> Bài kiểm tra (Quiz)
                </label>
                
                {watch('examId') ? (<div className="flex-1 flex flex-col gap-3">
                    <div className="bg-white border border-purple-200 rounded-lg p-3 shadow-sm">
                      <div className="flex items-start gap-2 w-full">
                        <lucide_react_1.FileText className="w-4 h-4 text-purple-500 shrink-0 mt-0.5"/>
                        <span className="text-sm font-semibold text-slate-700 line-clamp-2">{selectedExamTitle || 'Đề thi đã chọn'}</span>
                      </div>
                      <div className="flex gap-2 w-full mt-2">
                         <button_1.Button type="button" variant="outline" size="sm" className="flex-1 h-8 text-xs border-purple-200 text-purple-600" onClick={() => setIsExamSheetOpen(true)} disabled={isFormLocked}>Đổi đề</button_1.Button>
                         <button_1.Button type="button" variant="destructive" size="sm" className="h-8 px-2" onClick={() => { setValue('examId', undefined, { shouldValidate: true, shouldDirty: true }); setSelectedExamTitle(null); }} disabled={isFormLocked}><lucide_react_1.X className="w-4 h-4"/></button_1.Button>
                      </div>
                    </div>

                    
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-3 shadow-inner">
                       <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5"><lucide_react_1.Settings2 className="w-3.5 h-3.5"/> Cấu hình Luật thi</h4>
                       <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Thời gian (Phút)</label>
                            <input_1.Input type="number" min={0} className="h-8 text-sm" disabled={isFormLocked} {...register('examRules.timeLimit', { valueAsNumber: true })}/>
                            {errors.examRules?.timeLimit && <p className="text-[10px] text-red-500">{errors.examRules.timeLimit.message}</p>}
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Lượt làm bài</label>
                            <input_1.Input type="number" min={1} className="h-8 text-sm" disabled={isFormLocked} {...register('examRules.maxAttempts', { valueAsNumber: true })}/>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Điểm qua môn (%)</label>
                            <input_1.Input type="number" min={0} max={100} className="h-8 text-sm" disabled={isFormLocked} {...register('examRules.passPercentage', { valueAsNumber: true })}/>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Xem đáp án</label>
                            <react_hook_form_1.Controller name="examRules.showResultMode" control={control} render={({ field }) => (<select_1.Select disabled={isFormLocked} value={field.value} onValueChange={field.onChange}>
                                  <select_1.SelectTrigger className="h-8 text-xs">
                                    <select_1.SelectValue placeholder="Chọn mode"/>
                                  </select_1.SelectTrigger>
                                  <select_1.SelectContent>
                                    <select_1.SelectItem value="IMMEDIATELY">Xem ngay</select_1.SelectItem>
                                    <select_1.SelectItem value="AFTER_END_TIME">Sau khi hết giờ</select_1.SelectItem>
                                    <select_1.SelectItem value="NEVER">Không bao giờ</select_1.SelectItem>
                                  </select_1.SelectContent>
                                </select_1.Select>)}/>
                          </div>
                       </div>
                    </div>
                  </div>) : (<button_1.Button type="button" variant="outline" className="w-full h-10 border-purple-200 hover:bg-purple-50 text-purple-600 mt-auto" onClick={() => setIsExamSheetOpen(true)} disabled={isFormLocked}>
                    + Chọn đề thi từ Ngân hàng
                  </button_1.Button>)}
                <input_1.Input type="hidden" {...register('examId')}/>
              </div>
            </div>

            <div className="p-4 bg-orange-500/5 rounded-xl border border-orange-500/20 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold flex items-center gap-2 text-orange-600">
                  <lucide_react_1.FileText className="w-4 h-4"/> Tài liệu đính kèm
                </label>
                <input_1.Input type="file" accept=".pdf,.doc,.docx,.zip" multiple className="hidden" id="upload-docs" onChange={handleUploadAttachments} disabled={isFormLocked}/>
                <button_1.Button type="button" variant="secondary" size="sm" onClick={() => document.getElementById('upload-docs')?.click()} disabled={isFormLocked}>
                  {isUploadingDoc ? <lucide_react_1.Loader2 className="w-4 h-4 mr-2 animate-spin"/> : '+ Thêm tệp'}
                </button_1.Button>
              </div>
              
              {isUploadingDoc && <progress_1.Progress value={docProgress} className="h-1.5"/>}
              
              {localAttachments.length > 0 && (<div className="space-y-2 mt-2">
                  {localAttachments.map((file) => (<div key={file.id} className="flex items-center justify-between text-sm bg-background p-2 rounded-md border border-border group">
                      <span className="truncate flex-1 font-medium px-2">{file.name}</span>
                      <div className="flex items-center gap-1">
                        <a href={file.url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors" title="Xem trước file">
                          <lucide_react_1.Eye className="w-4 h-4"/>
                        </a>
                        <button_1.Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => removeAttachment(file.id)} disabled={isFormLocked}>
                          <lucide_react_1.X className="w-4 h-4"/>
                        </button_1.Button>
                      </div>
                    </div>))}
                </div>)}
            </div>

            <div className="flex items-center space-x-3 bg-muted/40 p-3 rounded-lg border border-border">
              <checkbox_1.Checkbox id="isFreePreview" checked={watch('isFreePreview')} onCheckedChange={(c) => setValue('isFreePreview', c)} disabled={isFormLocked}/>
              <label htmlFor="isFreePreview" className="text-sm font-semibold cursor-pointer select-none">Mở khóa học thử miễn phí</label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <button_1.Button type="button" variant="ghost" onClick={handleClose} disabled={isFormLocked}>Hủy bỏ</button_1.Button>
              <button_1.Button type="submit" disabled={isFormLocked}>
                {isUpdatingDB && <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                Lưu Bài Học
              </button_1.Button>
            </div>
          </form>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>

      
      {isExamSheetOpen && (<ExamSelectorSheet_1.ExamSelectorSheet isOpen={isExamSheetOpen} onClose={() => setIsExamSheetOpen(false)} currentExamId={watch('examId')} onSelectExam={(id, title) => {
                setValue('examId', id, { shouldValidate: true, shouldDirty: true });
                setSelectedExamTitle(title);
            }}/>)}
    </>);
}
//# sourceMappingURL=CreateLessonModal.js.map