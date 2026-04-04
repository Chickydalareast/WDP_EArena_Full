'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditLessonModal = EditLessonModal;
const react_1 = require("react");
const react_hook_form_1 = require("react-hook-form");
const rhf_zod_resolver_1 = require("@/shared/lib/rhf-zod-resolver");
const dialog_1 = require("@/shared/components/ui/dialog");
const button_1 = require("@/shared/components/ui/button");
const input_1 = require("@/shared/components/ui/input");
const checkbox_1 = require("@/shared/components/ui/checkbox");
const progress_1 = require("@/shared/components/ui/progress");
const rich_text_editor_1 = require("@/shared/components/ui/rich-text-editor");
const select_1 = require("@/shared/components/ui/select");
const tabs_1 = require("@/shared/components/ui/tabs");
const curriculum_schema_1 = require("../../types/curriculum.schema");
const useCurriculumMutations_1 = require("../../hooks/useCurriculumMutations");
const useCloudinaryUpload_1 = require("@/shared/hooks/useCloudinaryUpload");
const lucide_react_1 = require("lucide-react");
const sonner_1 = require("sonner");
const ExamSelectorSheet_1 = require("./ExamSelectorSheet");
const useTeacherExams_1 = require("@/features/exam-builder/hooks/useTeacherExams");
const useFolders_1 = require("@/features/exam-builder/hooks/useFolders");
const useTopics_1 = require("@/features/exam-builder/hooks/useTopics");
const useActiveFilters_1 = require("@/features/exam-builder/hooks/useActiveFilters");
const auth_store_1 = require("@/features/auth/stores/auth.store");
const usePreviewQuizConfig_1 = require("../../hooks/usePreviewQuizConfig");
const quiz_utils_1 = require("../../lib/quiz-utils");
const QuizLivePreviewModal_1 = require("./QuizLivePreviewModal");
const DynamicQuizBuilder_1 = require("./DynamicQuizBuilder");
function EditLessonModal({ courseId, lessonData, onClose }) {
    const { mutate: updateLesson, isPending: isUpdatingDB } = (0, useCurriculumMutations_1.useUpdateLesson)(courseId, lessonData?.lesson?.id || '');
    const { mutateAsync: fetchPreview, isPending: isPreviewing } = (0, usePreviewQuizConfig_1.usePreviewQuizConfig)();
    const { uploadDirectly: uploadVideo, isUploading: isUploadingVideo, progress: videoProgress } = (0, useCloudinaryUpload_1.useCloudinaryUpload)();
    const { uploadDirectly: uploadDoc, isUploading: isUploadingDoc, progress: docProgress } = (0, useCloudinaryUpload_1.useCloudinaryUpload)();
    const isFormLocked = isUpdatingDB || isUploadingVideo || isUploadingDoc || isPreviewing;
    const [videoPreviewUrl, setVideoPreviewUrl] = (0, react_1.useState)(null);
    const [localAttachments, setLocalAttachments] = (0, react_1.useState)([]);
    const [quizMode, setQuizMode] = (0, react_1.useState)('STATIC');
    const user = (0, auth_store_1.useAuthStore)((state) => state.user);
    const subjectId = user?.subjects?.[0]?.id;
    const { data: folders = [] } = (0, useFolders_1.useFoldersList)();
    const { data: topics = [] } = (0, useTopics_1.useTopicsTree)(subjectId);
    const { data: globalFilters, isFetching: isLoadingFilters } = (0, useActiveFilters_1.useActiveFilters)({ isDraft: false });
    const activeFilters = globalFilters?.data || globalFilters;
    const { data: examsData } = (0, useTeacherExams_1.useTeacherExams)();
    const [isExamSheetOpen, setIsExamSheetOpen] = (0, react_1.useState)(false);
    const [selectedExamTitle, setSelectedExamTitle] = (0, react_1.useState)(null);
    const [previewData, setPreviewData] = (0, react_1.useState)(null);
    const [cooldown, setCooldown] = (0, react_1.useState)(0);
    const methods = (0, react_hook_form_1.useForm)({
        resolver: (0, rhf_zod_resolver_1.rhfZodResolver)(curriculum_schema_1.updateLessonSchema),
    });
    const { register, handleSubmit, control, watch, setValue, clearErrors, getValues, trigger, formState: { errors, isDirty }, reset } = methods;
    (0, react_1.useEffect)(() => {
        return () => {
            if (videoPreviewUrl?.startsWith('blob:'))
                URL.revokeObjectURL(videoPreviewUrl);
            localAttachments.forEach(file => {
                if (file.url.startsWith('blob:'))
                    URL.revokeObjectURL(file.url);
            });
        };
    }, [videoPreviewUrl, localAttachments]);
    (0, react_1.useEffect)(() => {
        if (cooldown <= 0)
            return;
        const timer = setInterval(() => setCooldown(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [cooldown]);
    (0, react_1.useEffect)(() => {
        if (lessonData?.lesson) {
            const l = lessonData.lesson;
            const defaultDynamicConfig = {
                adHocSections: [{
                        name: 'Phần 1: Trắc nghiệm',
                        orderIndex: 0,
                        rules: [{ limit: 10, folderIds: [], topicIds: [], difficulties: [], tags: [] }]
                    }]
            };
            reset({
                title: l.title,
                isFreePreview: l.isFreePreview,
                content: l.content || '',
                primaryVideoId: undefined,
                examId: l.examId || '',
                attachments: l.attachments?.map((a) => a.id) || [],
                examRules: l.examRules || {
                    timeLimit: 45, maxAttempts: 1, passPercentage: 50, showResultMode: 'IMMEDIATELY'
                },
                dynamicConfig: l.dynamicConfig || defaultDynamicConfig,
            });
            if (!l.examId && l.dynamicConfig) {
                setQuizMode('DYNAMIC');
            }
            else {
                setQuizMode('STATIC');
            }
            setVideoPreviewUrl(l.primaryVideo?.url || null);
            setLocalAttachments(l.attachments?.map((a) => ({ id: a.id, name: a.originalName, url: a.url || '#' })) || []);
            if (l.examId) {
                const examsList = Array.isArray(examsData) ? examsData : examsData?.items || examsData?.data || [];
                const matchedExam = examsList.find((ex) => (ex._id || ex.id) === l.examId);
                setSelectedExamTitle(matchedExam ? matchedExam.title : `Đề thi (ID: ${l.examId.substring(0, 6)}...)`);
            }
            else {
                setSelectedExamTitle(null);
            }
        }
    }, [lessonData, reset, examsData]);
    const handleModeChange = (mode) => {
        setQuizMode(mode);
        if (mode === 'STATIC')
            clearErrors('dynamicConfig');
        if (mode === 'DYNAMIC')
            clearErrors('examId');
    };
    const handleUploadVideo = async (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        const objectUrl = URL.createObjectURL(file);
        setVideoPreviewUrl(objectUrl);
        try {
            const resultMedia = await uploadVideo(file, 'lesson_video');
            if (resultMedia?.id) {
                setValue('primaryVideoId', resultMedia.id, { shouldDirty: true, shouldValidate: true });
                if (resultMedia.url)
                    setVideoPreviewUrl(resultMedia.url);
                sonner_1.toast.success('Cập nhật video mới thành công!');
            }
        }
        catch (error) {
            setVideoPreviewUrl(null);
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
                        setValue('attachments', newArray.map(a => a.id), { shouldDirty: true, shouldValidate: true });
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
            setValue('attachments', newArray.map(a => a.id), { shouldDirty: true, shouldValidate: true });
            return newArray;
        });
    };
    const handlePreview = async () => {
        if (cooldown > 0)
            return;
        const isValid = await trigger('dynamicConfig');
        if (!isValid) {
            sonner_1.toast.warning('Vui lòng hoàn thiện cấu trúc bốc đề trước khi xem trước.');
            return;
        }
        const config = getValues('dynamicConfig');
        try {
            const response = await fetchPreview({ matrixId: config?.matrixId, adHocSections: config?.adHocSections });
            const actualData = response?.data || response;
            const nested = (0, quiz_utils_1.buildNestedQuestions)(actualData.previewData.questions);
            setPreviewData({ questions: nested, totalItems: actualData.totalItems, actual: actualData.totalActualQuestions });
            setCooldown(10);
            sonner_1.toast.success('Sinh đề nháp thành công!');
        }
        catch (error) { }
    };
    const onSubmit = (data) => {
        const sanitizedPayload = { ...data, content: (!data.content || data.content.trim() === '') ? '<p></p>' : data.content };
        if (quizMode === 'STATIC') {
            delete sanitizedPayload.dynamicConfig;
            if (!sanitizedPayload.examId)
                delete sanitizedPayload.examRules;
        }
        else {
            delete sanitizedPayload.examId;
            if (!sanitizedPayload.dynamicConfig?.adHocSections?.length)
                delete sanitizedPayload.examRules;
        }
        updateLesson(sanitizedPayload, { onSuccess: onClose });
    };
    const onValidationError = (errs) => {
        console.error("Lỗi Validation Form:", errs);
        sonner_1.toast.error("Thiếu thông tin bắt buộc!", { description: "Vui lòng kiểm tra lại Tên bài, Thư mục hoặc Luật thi." });
    };
    return (<>
      <dialog_1.Dialog open={!!lessonData} onOpenChange={(open) => !open && !isFormLocked && onClose()}>
        <dialog_1.DialogContent className="sm:max-w-[1000px] max-h-[95vh] overflow-y-auto" onInteractOutside={(e) => { if (isFormLocked)
        e.preventDefault(); }}>
          <dialog_1.DialogHeader>
              <dialog_1.DialogTitle className="text-2xl">Sửa Bài Học</dialog_1.DialogTitle>
          </dialog_1.DialogHeader>

          <react_hook_form_1.FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit, onValidationError)} className="space-y-6 py-2">
              
              <div className="space-y-4 bg-muted/10 p-5 rounded-xl border border-border">
                <div className="space-y-2">
                  <label className="text-sm font-bold">Tiêu đề bài học <span className="text-red-500">*</span></label>
                  <input_1.Input {...register('title')} disabled={isFormLocked} className="h-11 bg-background"/>
                  {errors.title && <p className="text-xs text-red-500 font-medium">{errors.title.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold">Nội dung / Ghi chú</label>
                  <react_hook_form_1.Controller name="content" control={control} render={({ field }) => (<rich_text_editor_1.RichTextEditor value={field.value || ''} onChange={(val) => field.onChange(val)} disabled={isFormLocked}/>)}/>
                </div>
              </div>

              <div className="p-1 rounded-xl border-2 border-purple-500/20 bg-purple-500/5">
                <div className="p-4 border-b border-purple-500/10 flex items-center gap-2">
                  <lucide_react_1.CheckCircle2 className="w-5 h-5 text-purple-600"/>
                  <h3 className="font-bold text-purple-800">Cấu hình Bài kiểm tra (Quiz)</h3>
                </div>

                <div className="p-4 space-y-6">
                  <tabs_1.Tabs value={quizMode} onValueChange={handleModeChange} className="w-full">
                    <tabs_1.TabsList className="grid w-full grid-cols-2 mb-6 h-12">
                      <tabs_1.TabsTrigger value="STATIC" className="font-bold gap-2 text-sm"><lucide_react_1.LayoutTemplate className="w-4 h-4"/> Chọn Đề Cố Định</tabs_1.TabsTrigger>
                      <tabs_1.TabsTrigger value="DYNAMIC" className="font-bold gap-2 text-sm"><lucide_react_1.Zap className="w-4 h-4 text-amber-500"/> Sinh Đề Tự Động (AI)</tabs_1.TabsTrigger>
                    </tabs_1.TabsList>

                    <tabs_1.TabsContent value="STATIC" className="space-y-4 mt-0 animate-in fade-in">
                      {watch('examId') && quizMode === 'STATIC' ? (<div className="bg-white border border-purple-200 rounded-lg p-4 shadow-sm">
                          <div className="flex items-start gap-2 w-full">
                            <lucide_react_1.FileText className="w-5 h-5 text-purple-500 shrink-0 mt-0.5"/>
                            <div>
                              <span className="text-sm font-bold text-slate-700 block">{selectedExamTitle || 'Đề thi đã chọn'}</span>
                              <span className="text-xs text-muted-foreground">Mã Đề Tĩnh: {watch('examId')}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 w-full mt-4">
                            <button_1.Button type="button" variant="outline" size="sm" className="flex-1 h-9 border-purple-200 text-purple-600" onClick={() => setIsExamSheetOpen(true)} disabled={isFormLocked}>Đổi đề khác</button_1.Button>
                            <button_1.Button type="button" variant="destructive" size="sm" className="h-9 px-3" onClick={() => { setValue('examId', undefined, { shouldDirty: true }); setSelectedExamTitle(null); }} disabled={isFormLocked}><lucide_react_1.X className="w-4 h-4 mr-1"/> Gỡ bỏ</button_1.Button>
                          </div>
                        </div>) : (<div className="border-2 border-dashed border-purple-200 rounded-xl p-8 flex flex-col items-center justify-center bg-white/50">
                           <lucide_react_1.FileText className="w-12 h-12 text-purple-200 mb-3"/>
                           <p className="text-sm text-slate-500 font-medium mb-4 text-center">Gắn một đề thi có sẵn từ Ngân hàng Đề của bạn.</p>
                           <button_1.Button type="button" className="bg-purple-600 hover:bg-purple-700 font-bold" onClick={() => setIsExamSheetOpen(true)} disabled={isFormLocked}>
                             + Chọn Đề Thi Tĩnh
                           </button_1.Button>
                        </div>)}
                    </tabs_1.TabsContent>

                    <tabs_1.TabsContent value="DYNAMIC" className="mt-0 animate-in fade-in space-y-4">
                        <div className="mb-3">
                            <h4 className="text-sm font-bold text-slate-700">Quy tắc bốc đề ngẫu nhiên</h4>
                            {!subjectId && <p className="text-xs text-red-600 font-bold mt-1">CẢNH BÁO: Tài khoản của bạn chưa thiết lập Môn học.</p>}
                        </div>
                        {isLoadingFilters ? (<div className="flex justify-center p-10"><lucide_react_1.Loader2 className="w-6 h-6 animate-spin text-purple-500"/></div>) : (<DynamicQuizBuilder_1.DynamicQuizBuilder folders={folders} topics={topics} activeFilters={activeFilters} disabled={isFormLocked}/>)}
                    </tabs_1.TabsContent>
                  </tabs_1.Tabs>

                  {((quizMode === 'STATIC' && watch('examId')) || (quizMode === 'DYNAMIC')) && (<div className="bg-card border border-border rounded-xl p-4 space-y-4 shadow-sm animate-in fade-in slide-in-from-bottom-4">
                      <h4 className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><lucide_react_1.Settings2 className="w-4 h-4 text-primary"/> Cấu hình Luật thi (Áp dụng chung)</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase">Thời gian (Phút) <span className="text-xs lowercase text-muted-foreground ml-1">(0 = Vô hạn)</span></label>
                            <input_1.Input type="number" min={0} className="h-10 text-sm font-bold" disabled={isFormLocked} {...register('examRules.timeLimit', { valueAsNumber: true })}/>
                            {errors.examRules?.timeLimit && <p className="text-[10px] text-red-500">{errors.examRules.timeLimit.message}</p>}
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase">Số lượt làm bài</label>
                            <input_1.Input type="number" min={1} className="h-10 text-sm font-bold" disabled={isFormLocked} {...register('examRules.maxAttempts', { valueAsNumber: true })}/>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase">Điểm qua môn (%)</label>
                            <input_1.Input type="number" min={0} max={100} className="h-10 text-sm font-bold" disabled={isFormLocked} {...register('examRules.passPercentage', { valueAsNumber: true })}/>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase">Xem kết quả</label>
                            <react_hook_form_1.Controller name="examRules.showResultMode" control={control} render={({ field }) => (<select_1.Select disabled={isFormLocked} value={field.value} onValueChange={(val) => { field.onChange(val); setValue('examRules.showResultMode', val, { shouldDirty: true }); }}>
                                  <select_1.SelectTrigger className="h-10 text-sm font-medium"><select_1.SelectValue placeholder="Chọn mode"/></select_1.SelectTrigger>
                                  <select_1.SelectContent>
                                    <select_1.SelectItem value="IMMEDIATELY">Xem ngay lập tức</select_1.SelectItem>
                                    <select_1.SelectItem value="AFTER_END_TIME">Sau khi hết thời gian</select_1.SelectItem>
                                    <select_1.SelectItem value="NEVER">Tuyệt đối không</select_1.SelectItem>
                                  </select_1.SelectContent>
                                </select_1.Select>)}/>
                          </div>
                      </div>
                    </div>)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/20 space-y-4">
                  <label className="text-sm font-bold flex items-center gap-2 text-blue-600"><lucide_react_1.Video className="w-4 h-4"/> Video bài giảng</label>
                  <input_1.Input type="file" accept="video/mp4,video/webm" className="hidden" id="edit-video" onChange={handleUploadVideo} disabled={isFormLocked}/>
                  <button_1.Button type="button" variant="outline" className="w-full h-10 border-blue-200" onClick={() => document.getElementById('edit-video')?.click()} disabled={isFormLocked}>
                    {isUploadingVideo ? <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <lucide_react_1.UploadCloud className="mr-2 h-4 w-4 text-blue-500"/>}
                    Thay đổi Video (MP4)
                  </button_1.Button>
                  {isUploadingVideo && <progress_1.Progress value={videoProgress} className="h-1.5"/>}
                  {videoPreviewUrl && !isUploadingVideo && (<div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border border-border flex items-center justify-center mt-3 shadow-inner">
                      <video src={videoPreviewUrl} controls controlsList="nodownload" className="w-full h-full object-contain"/>
                    </div>)}
                </div>

                <div className="p-4 bg-orange-500/5 rounded-xl border border-orange-500/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold flex items-center gap-2 text-orange-600"><lucide_react_1.FileText className="w-4 h-4"/> Tài liệu đính kèm</label>
                    <input_1.Input type="file" accept=".pdf,.doc,.docx,.zip" multiple className="hidden" id="edit-docs" onChange={handleUploadAttachments} disabled={isFormLocked}/>
                    <button_1.Button type="button" variant="secondary" size="sm" onClick={() => document.getElementById('edit-docs')?.click()} disabled={isFormLocked}>
                      {isUploadingDoc ? <lucide_react_1.Loader2 className="w-4 h-4 mr-2 animate-spin"/> : '+ Thêm tệp'}
                    </button_1.Button>
                  </div>
                  {isUploadingDoc && <progress_1.Progress value={docProgress} className="h-1.5"/>}
                  {localAttachments.length > 0 && (<div className="space-y-2 mt-2">
                      {localAttachments.map((file) => (<div key={file.id} className="flex items-center justify-between text-sm bg-background p-2 rounded-md border border-border group">
                          <span className="truncate flex-1 font-medium px-2">{file.name}</span>
                          <div className="flex items-center gap-1">
                            <a href={file.url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"><lucide_react_1.Eye className="w-4 h-4"/></a>
                            <button_1.Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => removeAttachment(file.id)} disabled={isFormLocked}><lucide_react_1.X className="w-4 h-4"/></button_1.Button>
                          </div>
                        </div>))}
                    </div>)}
                </div>
              </div>

              <div className="flex items-center space-x-3 bg-muted/40 p-4 rounded-xl border border-border">
                <checkbox_1.Checkbox id="isFreePreviewEdit" checked={watch('isFreePreview')} onCheckedChange={(c) => setValue('isFreePreview', c, { shouldDirty: true })} disabled={isFormLocked} className="w-5 h-5 rounded"/>
                <label htmlFor="isFreePreviewEdit" className="text-sm font-semibold cursor-pointer select-none">Mở khóa học thử miễn phí</label>
              </div>
              
              <div className="flex items-center justify-between pt-6 mt-4 border-t border-border sticky bottom-0 bg-background/95 backdrop-blur py-4 -mx-6 px-6 z-10">
                <button_1.Button type="button" variant="ghost" onClick={onClose} disabled={isFormLocked} className="font-semibold px-6">Hủy bỏ</button_1.Button>
                
                <div className="flex items-center gap-3">
                    {quizMode === 'DYNAMIC' && (<button_1.Button type="button" variant="outline" className="border-purple-300 text-purple-700 bg-purple-50 hover:bg-purple-100" onClick={handlePreview} disabled={isFormLocked || cooldown > 0}>
                            {isPreviewing ? <lucide_react_1.Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <lucide_react_1.Eye className="w-4 h-4 mr-2"/>}
                            {cooldown > 0 ? `Xem trước (${cooldown}s)` : 'Xem thử Đề'}
                        </button_1.Button>)}
                    <button_1.Button type="submit" disabled={isFormLocked || !isDirty} className="font-bold px-8 shadow-md bg-blue-600 hover:bg-blue-700 text-white">
                      {isUpdatingDB && <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>} Lưu thay đổi
                    </button_1.Button>
                </div>
              </div>

            </form>
          </react_hook_form_1.FormProvider>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>

      {isExamSheetOpen && (<ExamSelectorSheet_1.ExamSelectorSheet isOpen={isExamSheetOpen} onClose={() => setIsExamSheetOpen(false)} currentExamId={watch('examId')} onSelectExam={(id, title) => { setValue('examId', id, { shouldValidate: true, shouldDirty: true }); setSelectedExamTitle(title); }}/>)}

      {previewData && (<QuizLivePreviewModal_1.QuizLivePreviewModal isOpen={!!previewData} onClose={() => setPreviewData(null)} questions={previewData.questions} totalItems={previewData.totalItems} totalActualQuestions={previewData.actual}/>)}
    </>);
}
//# sourceMappingURL=EditLessonModal.js.map