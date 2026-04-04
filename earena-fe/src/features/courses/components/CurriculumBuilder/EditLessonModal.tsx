'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { rhfZodResolver as zodResolver } from '@/shared/lib/rhf-zod-resolver';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Progress } from '@/shared/components/ui/progress';
import { RichTextEditor } from '@/shared/components/ui/rich-text-editor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';

import { updateLessonSchema, UpdateLessonDTO, DynamicConfigDTO, ExamRuleDTO } from '../../types/curriculum.schema';
import { LessonPreview } from '../../types/course.schema';
import { useUpdateLesson } from '../../hooks/useCurriculumMutations';
import { useCloudinaryUpload } from '@/shared/hooks/useCloudinaryUpload';
import { Loader2, UploadCloud, CheckCircle2, Video, FileText, X, Eye, Settings2, Zap, LayoutTemplate } from 'lucide-react';
import { toast } from 'sonner';

import { ExamSelectorSheet } from './ExamSelectorSheet';
import { useTeacherExams } from '@/features/exam-builder/hooks/useTeacherExams';
import { useFoldersList } from '@/features/exam-builder/hooks/useFolders';
import { useTopicsTree } from '@/features/exam-builder/hooks/useTopics';
import { useActiveFilters } from '@/features/exam-builder/hooks/useActiveFilters';
import { useAuthStore } from '@/features/auth/stores/auth.store';

import { usePreviewQuizConfig } from '../../hooks/usePreviewQuizConfig';
import { buildNestedQuestions, NestedQuestionPreview } from '../../lib/quiz-utils';
import { QuizLivePreviewModal } from './QuizLivePreviewModal';

import { DynamicQuizBuilder } from './DynamicQuizBuilder';

interface EditLessonModalProps {
  courseId: string;
  lessonData: { lesson: LessonPreview; sectionId: string } | null;
  onClose: () => void;
}

type LocalAttachment = { id: string; name: string; url: string };

export function EditLessonModal({ courseId, lessonData, onClose }: EditLessonModalProps) {
  const { mutate: updateLesson, isPending: isUpdatingDB } = useUpdateLesson(courseId, lessonData?.lesson?.id || '');
  const { mutateAsync: fetchPreview, isPending: isPreviewing } = usePreviewQuizConfig();
  
  const { uploadDirectly: uploadVideo, isUploading: isUploadingVideo, progress: videoProgress } = useCloudinaryUpload();
  const { uploadDirectly: uploadDoc, isUploading: isUploadingDoc, progress: docProgress } = useCloudinaryUpload();
  
  const isFormLocked = isUpdatingDB || isUploadingVideo || isUploadingDoc || isPreviewing;

  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [localAttachments, setLocalAttachments] = useState<LocalAttachment[]>([]);

  const [quizMode, setQuizMode] = useState<'STATIC' | 'DYNAMIC'>('STATIC');

  const user = useAuthStore((state) => state.user);
  const subjectId = user?.subjects?.[0]?.id;
  
  const { data: folders = [] } = useFoldersList();
  const { data: topics = [] } = useTopicsTree(subjectId);
  const { data: globalFilters, isFetching: isLoadingFilters } = useActiveFilters({ isDraft: false });
  const activeFilters = (globalFilters as any)?.data || globalFilters;

  const { data: examsData } = useTeacherExams(); 
  const [isExamSheetOpen, setIsExamSheetOpen] = useState(false);
  const [selectedExamTitle, setSelectedExamTitle] = useState<string | null>(null);

  const [previewData, setPreviewData] = useState<{ questions: NestedQuestionPreview[], totalItems: number, actual: number } | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const methods = useForm<UpdateLessonDTO>({
    resolver: zodResolver(updateLessonSchema),
  });

  const { register, handleSubmit, control, watch, setValue, clearErrors, getValues, trigger, formState: { errors, isDirty }, reset } = methods;

  useEffect(() => {
    return () => {
      if (videoPreviewUrl?.startsWith('blob:')) URL.revokeObjectURL(videoPreviewUrl);
      localAttachments.forEach(file => {
        if (file.url.startsWith('blob:')) URL.revokeObjectURL(file.url);
      });
    };
  }, [videoPreviewUrl, localAttachments]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    if (lessonData?.lesson) {
      const l = lessonData.lesson as LessonPreview & { dynamicConfig?: DynamicConfigDTO; examRules?: ExamRuleDTO }; 
      
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
        attachments: l.attachments?.map((a: any) => a.id) || [], 
        examRules: l.examRules || {
          timeLimit: 45, maxAttempts: 1, passPercentage: 50, showResultMode: 'IMMEDIATELY'
        },
        dynamicConfig: l.dynamicConfig || defaultDynamicConfig, 
      });

      if (!l.examId && l.dynamicConfig) {
        setQuizMode('DYNAMIC');
      } else {
        setQuizMode('STATIC');
      }
      
      setVideoPreviewUrl(l.primaryVideo?.url || null);
      setLocalAttachments(l.attachments?.map((a: any) => ({ id: a.id, name: a.originalName, url: a.url || '#' })) || []);

      if (l.examId) {
        const examsList = Array.isArray(examsData) ? examsData : (examsData as any)?.items || (examsData as any)?.data || [];
        const matchedExam = examsList.find((ex: any) => (ex._id || ex.id) === l.examId);
        setSelectedExamTitle(matchedExam ? matchedExam.title : `Đề thi (ID: ${l.examId.substring(0,6)}...)`);
      } else {
        setSelectedExamTitle(null);
      }
    }
  }, [lessonData, reset, examsData]);

  const handleModeChange = (mode: string) => {
    setQuizMode(mode as 'STATIC' | 'DYNAMIC');
    if (mode === 'STATIC') clearErrors('dynamicConfig');
    if (mode === 'DYNAMIC') clearErrors('examId');
  };

  const handleUploadVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setVideoPreviewUrl(objectUrl);
    try {
      const resultMedia = await uploadVideo(file, 'lesson_video' as any);
      if (resultMedia?.id) {
        setValue('primaryVideoId', resultMedia.id, { shouldDirty: true, shouldValidate: true });
        if (resultMedia.url) setVideoPreviewUrl(resultMedia.url);
        toast.success('Cập nhật video mới thành công!');
      }
    } catch (error) { setVideoPreviewUrl(null); } 
    finally { e.target.value = ''; }
  };

  const handleUploadAttachments = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    for (const file of files) {
      const objectUrl = URL.createObjectURL(file);
      try {
        const resultMedia = await uploadDoc(file, 'lesson_document' as any);
        if (resultMedia?.id) {
          setLocalAttachments((prev) => {
            const newArray = [...prev, { id: resultMedia.id!, name: file.name, url: resultMedia.url || objectUrl }];
            setValue('attachments', newArray.map(a => a.id), { shouldDirty: true, shouldValidate: true });
            return newArray;
          });
        }
      } catch (error) { URL.revokeObjectURL(objectUrl); }
    }
    e.target.value = '';
  };

  const removeAttachment = (idToRemove: string) => {
    setLocalAttachments((prev) => {
      const fileToRemove = prev.find(f => f.id === idToRemove);
      if (fileToRemove?.url.startsWith('blob:')) URL.revokeObjectURL(fileToRemove.url); 
      const newArray = prev.filter(a => a.id !== idToRemove);
      setValue('attachments', newArray.map(a => a.id), { shouldDirty: true, shouldValidate: true });
      return newArray;
    });
  };

  const handlePreview = async () => {
    if (cooldown > 0) return;
    const isValid = await trigger('dynamicConfig');
    if (!isValid) {
        toast.warning('Vui lòng hoàn thiện cấu trúc bốc đề trước khi xem trước.');
        return;
    }
    const config = getValues('dynamicConfig');
    try {
        const response = await fetchPreview({ matrixId: config?.matrixId, adHocSections: config?.adHocSections });
        const actualData = (response as any)?.data || response;
        const nested = buildNestedQuestions(actualData.previewData.questions);
        setPreviewData({ questions: nested, totalItems: actualData.totalItems, actual: actualData.totalActualQuestions });
        setCooldown(10);
        toast.success('Sinh đề nháp thành công!');
    } catch (error) {}
  };

  const onSubmit = (data: UpdateLessonDTO) => {
    const sanitizedPayload = { ...data, content: (!data.content || data.content.trim() === '') ? '<p></p>' : data.content };
    if (quizMode === 'STATIC') {
      delete sanitizedPayload.dynamicConfig;
      if (!sanitizedPayload.examId) delete sanitizedPayload.examRules;
    } else {
      delete sanitizedPayload.examId;
      if (!sanitizedPayload.dynamicConfig?.adHocSections?.length) delete sanitizedPayload.examRules;
    }
    updateLesson(sanitizedPayload, { onSuccess: onClose });
  };

  const onValidationError = (errs: Record<string, unknown>) => {
    console.error("Lỗi Validation Form:", errs);
    toast.error("Thiếu thông tin bắt buộc!", { description: "Vui lòng kiểm tra lại Tên bài, Thư mục hoặc Luật thi."});
  };

  return (
    <>
      <Dialog open={!!lessonData} onOpenChange={(open) => !open && !isFormLocked && onClose()}>
        <DialogContent className="sm:max-w-[1000px] max-h-[95vh] overflow-y-auto" onInteractOutside={(e) => { if (isFormLocked) e.preventDefault(); }}>
          <DialogHeader>
              <DialogTitle className="text-2xl">Sửa Bài Học</DialogTitle>
          </DialogHeader>

          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit, onValidationError)} className="space-y-6 py-2">
              
              <div className="space-y-4 bg-muted/10 p-5 rounded-xl border border-border">
                <div className="space-y-2">
                  <label className="text-sm font-bold">Tiêu đề bài học <span className="text-red-500">*</span></label>
                  <Input {...register('title')} disabled={isFormLocked} className="h-11 bg-background" />
                  {errors.title && <p className="text-xs text-red-500 font-medium">{errors.title.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold">Nội dung / Ghi chú</label>
                  <Controller
                    name="content"
                    control={control}
                    render={({ field }) => (
                      <RichTextEditor value={field.value || ''} onChange={(val) => field.onChange(val)} disabled={isFormLocked} />
                    )}
                  />
                </div>
              </div>

              <div className="p-1 rounded-xl border-2 border-purple-500/20 bg-purple-500/5">
                <div className="p-4 border-b border-purple-500/10 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-purple-600" />
                  <h3 className="font-bold text-purple-800">Cấu hình Bài kiểm tra (Quiz)</h3>
                </div>

                <div className="p-4 space-y-6">
                  <Tabs value={quizMode} onValueChange={handleModeChange} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6 h-12">
                      <TabsTrigger value="STATIC" className="font-bold gap-2 text-sm"><LayoutTemplate className="w-4 h-4"/> Chọn Đề Cố Định</TabsTrigger>
                      <TabsTrigger value="DYNAMIC" className="font-bold gap-2 text-sm"><Zap className="w-4 h-4 text-amber-500"/> Sinh Đề Tự Động (AI)</TabsTrigger>
                    </TabsList>

                    <TabsContent value="STATIC" className="space-y-4 mt-0 animate-in fade-in">
                      {watch('examId') && quizMode === 'STATIC' ? (
                        <div className="bg-white border border-purple-200 rounded-lg p-4 shadow-sm">
                          <div className="flex items-start gap-2 w-full">
                            <FileText className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                            <div>
                              <span className="text-sm font-bold text-slate-700 block">{selectedExamTitle || 'Đề thi đã chọn'}</span>
                              <span className="text-xs text-muted-foreground">Mã Đề Tĩnh: {watch('examId')}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 w-full mt-4">
                            <Button type="button" variant="outline" size="sm" className="flex-1 h-9 border-purple-200 text-purple-600" onClick={() => setIsExamSheetOpen(true)} disabled={isFormLocked}>Đổi đề khác</Button>
                            <Button type="button" variant="destructive" size="sm" className="h-9 px-3" onClick={() => { setValue('examId', undefined, { shouldDirty: true }); setSelectedExamTitle(null); }} disabled={isFormLocked}><X className="w-4 h-4 mr-1" /> Gỡ bỏ</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-purple-200 rounded-xl p-8 flex flex-col items-center justify-center bg-white/50">
                           <FileText className="w-12 h-12 text-purple-200 mb-3" />
                           <p className="text-sm text-slate-500 font-medium mb-4 text-center">Gắn một đề thi có sẵn từ Ngân hàng Đề của bạn.</p>
                           <Button type="button" className="bg-purple-600 hover:bg-purple-700 font-bold" onClick={() => setIsExamSheetOpen(true)} disabled={isFormLocked}>
                             + Chọn Đề Thi Tĩnh
                           </Button>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="DYNAMIC" className="mt-0 animate-in fade-in space-y-4">
                        <div className="mb-3">
                            <h4 className="text-sm font-bold text-slate-700">Quy tắc bốc đề ngẫu nhiên</h4>
                            {!subjectId && <p className="text-xs text-red-600 font-bold mt-1">CẢNH BÁO: Tài khoản của bạn chưa thiết lập Môn học.</p>}
                        </div>
                        {isLoadingFilters ? (
                            <div className="flex justify-center p-10"><Loader2 className="w-6 h-6 animate-spin text-purple-500" /></div>
                        ) : (
                            <DynamicQuizBuilder folders={folders} topics={topics} activeFilters={activeFilters} disabled={isFormLocked} />
                        )}
                    </TabsContent>
                  </Tabs>

                  {((quizMode === 'STATIC' && watch('examId')) || (quizMode === 'DYNAMIC')) && (
                    <div className="bg-card border border-border rounded-xl p-4 space-y-4 shadow-sm animate-in fade-in slide-in-from-bottom-4">
                      <h4 className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><Settings2 className="w-4 h-4 text-primary"/> Cấu hình Luật thi (Áp dụng chung)</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase">Thời gian (Phút) <span className="text-xs lowercase text-muted-foreground ml-1">(0 = Vô hạn)</span></label>
                            <Input type="number" min={0} className="h-10 text-sm font-bold" disabled={isFormLocked} {...register('examRules.timeLimit', { valueAsNumber: true })} />
                            {errors.examRules?.timeLimit && <p className="text-[10px] text-red-500">{errors.examRules.timeLimit.message}</p>}
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase">Số lượt làm bài</label>
                            <Input type="number" min={1} className="h-10 text-sm font-bold" disabled={isFormLocked} {...register('examRules.maxAttempts', { valueAsNumber: true })} />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase">Điểm qua môn (%)</label>
                            <Input type="number" min={0} max={100} className="h-10 text-sm font-bold" disabled={isFormLocked} {...register('examRules.passPercentage', { valueAsNumber: true })} />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase">Xem kết quả</label>
                            <Controller
                              name="examRules.showResultMode"
                              control={control}
                              render={({ field }) => (
                                <Select disabled={isFormLocked} value={field.value} onValueChange={(val) => { field.onChange(val); setValue('examRules.showResultMode', val as any, { shouldDirty: true }); }}>
                                  <SelectTrigger className="h-10 text-sm font-medium"><SelectValue placeholder="Chọn mode" /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="IMMEDIATELY">Xem ngay lập tức</SelectItem>
                                    <SelectItem value="AFTER_END_TIME">Sau khi hết thời gian</SelectItem>
                                    <SelectItem value="NEVER">Tuyệt đối không</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/20 space-y-4">
                  <label className="text-sm font-bold flex items-center gap-2 text-blue-600"><Video className="w-4 h-4" /> Video bài giảng</label>
                  <Input type="file" accept="video/mp4,video/webm" className="hidden" id="edit-video" onChange={handleUploadVideo} disabled={isFormLocked} />
                  <Button type="button" variant="outline" className="w-full h-10 border-blue-200" onClick={() => document.getElementById('edit-video')?.click()} disabled={isFormLocked}>
                    {isUploadingVideo ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4 text-blue-500" />}
                    Thay đổi Video (MP4)
                  </Button>
                  {isUploadingVideo && <Progress value={videoProgress} className="h-1.5" />}
                  {videoPreviewUrl && !isUploadingVideo && (
                    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border border-border flex items-center justify-center mt-3 shadow-inner">
                      <video src={videoPreviewUrl} controls controlsList="nodownload" className="w-full h-full object-contain" />
                    </div>
                  )}
                </div>

                <div className="p-4 bg-orange-500/5 rounded-xl border border-orange-500/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold flex items-center gap-2 text-orange-600"><FileText className="w-4 h-4" /> Tài liệu đính kèm</label>
                    <Input type="file" accept=".pdf,.doc,.docx,.zip" multiple className="hidden" id="edit-docs" onChange={handleUploadAttachments} disabled={isFormLocked} />
                    <Button type="button" variant="secondary" size="sm" onClick={() => document.getElementById('edit-docs')?.click()} disabled={isFormLocked}>
                      {isUploadingDoc ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : '+ Thêm tệp'}
                    </Button>
                  </div>
                  {isUploadingDoc && <Progress value={docProgress} className="h-1.5" />}
                  {localAttachments.length > 0 && (
                    <div className="space-y-2 mt-2">
                      {localAttachments.map((file) => (
                        <div key={file.id} className="flex items-center justify-between text-sm bg-background p-2 rounded-md border border-border group">
                          <span className="truncate flex-1 font-medium px-2">{file.name}</span>
                          <div className="flex items-center gap-1">
                            <a href={file.url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"><Eye className="w-4 h-4" /></a>
                            <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => removeAttachment(file.id)} disabled={isFormLocked}><X className="w-4 h-4" /></Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3 bg-muted/40 p-4 rounded-xl border border-border">
                <Checkbox id="isFreePreviewEdit" checked={watch('isFreePreview')} onCheckedChange={(c) => setValue('isFreePreview', c as boolean, { shouldDirty: true })} disabled={isFormLocked} className="w-5 h-5 rounded" />
                <label htmlFor="isFreePreviewEdit" className="text-sm font-semibold cursor-pointer select-none">Mở khóa học thử miễn phí</label>
              </div>
              
              <div className="flex items-center justify-between pt-6 mt-4 border-t border-border sticky bottom-0 bg-background/95 backdrop-blur py-4 -mx-6 px-6 z-10">
                <Button type="button" variant="ghost" onClick={onClose} disabled={isFormLocked} className="font-semibold px-6">Hủy bỏ</Button>
                
                <div className="flex items-center gap-3">
                    {quizMode === 'DYNAMIC' && (
                        <Button type="button" variant="outline" className="border-purple-300 text-purple-700 bg-purple-50 hover:bg-purple-100" onClick={handlePreview} disabled={isFormLocked || cooldown > 0}>
                            {isPreviewing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Eye className="w-4 h-4 mr-2" />}
                            {cooldown > 0 ? `Xem trước (${cooldown}s)` : 'Xem thử Đề'}
                        </Button>
                    )}
                    <Button type="submit" disabled={isFormLocked || !isDirty} className="font-bold px-8 shadow-md bg-blue-600 hover:bg-blue-700 text-white">
                      {isUpdatingDB && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Lưu thay đổi
                    </Button>
                </div>
              </div>

            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>

      {isExamSheetOpen && (
        <ExamSelectorSheet 
          isOpen={isExamSheetOpen}
          onClose={() => setIsExamSheetOpen(false)}
          currentExamId={watch('examId')}
          onSelectExam={(id, title) => { setValue('examId', id, { shouldValidate: true, shouldDirty: true }); setSelectedExamTitle(title); }}
        />
      )}

      {previewData && (
          <QuizLivePreviewModal isOpen={!!previewData} onClose={() => setPreviewData(null)} questions={previewData.questions} totalItems={previewData.totalItems} totalActualQuestions={previewData.actual} />
      )}
    </>
  );
}