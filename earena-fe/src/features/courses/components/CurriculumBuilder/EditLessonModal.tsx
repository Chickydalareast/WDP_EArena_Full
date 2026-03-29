'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Progress } from '@/shared/components/ui/progress';
import { RichTextEditor } from '@/shared/components/ui/rich-text-editor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';

import { updateLessonSchema, UpdateLessonDTO } from '../../types/curriculum.schema';
import { LessonPreview } from '../../types/course.schema';
import { useUpdateLesson } from '../../hooks/useCurriculumMutations';
import { useCloudinaryUpload } from '@/shared/hooks/useCloudinaryUpload';
import { Loader2, UploadCloud, CheckCircle2, Video, FileText, X, Eye, Settings2 } from 'lucide-react';
import { toast } from 'sonner';

// Thêm import cho Sheet và Hook lấy danh sách Exam
import { ExamSelectorSheet } from './ExamSelectorSheet';
import { useTeacherExams } from '@/features/exam-builder/hooks/useTeacherExams';

interface EditLessonModalProps {
  courseId: string;
  lessonData: { lesson: LessonPreview; sectionId: string } | null;
  onClose: () => void;
}

type LocalAttachment = { id: string; name: string; url: string };

export function EditLessonModal({ courseId, lessonData, onClose }: EditLessonModalProps) {
  const { mutate: updateLesson, isPending: isUpdatingDB } = useUpdateLesson(courseId, lessonData?.lesson?.id || '');
  
  const { uploadDirectly: uploadVideo, isUploading: isUploadingVideo, progress: videoProgress } = useCloudinaryUpload();
  const { uploadDirectly: uploadDoc, isUploading: isUploadingDoc, progress: docProgress } = useCloudinaryUpload();
  
  const isFormLocked = isUpdatingDB || isUploadingVideo || isUploadingDoc;

  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [localAttachments, setLocalAttachments] = useState<LocalAttachment[]>([]);

  // State và lookup data cho ExamSelectorSheet
  const { data: examsData } = useTeacherExams(); // Cache lookup
  const [isExamSheetOpen, setIsExamSheetOpen] = useState(false);
  const [selectedExamTitle, setSelectedExamTitle] = useState<string | null>(null);

  const { register, handleSubmit, control, watch, setValue, formState: { errors, isDirty }, reset } = useForm<UpdateLessonDTO>({
    resolver: zodResolver(updateLessonSchema),
  });

  useEffect(() => {
    return () => {
      if (videoPreviewUrl?.startsWith('blob:')) URL.revokeObjectURL(videoPreviewUrl);
      localAttachments.forEach(file => {
        if (file.url.startsWith('blob:')) URL.revokeObjectURL(file.url);
      });
    };
  }, [videoPreviewUrl, localAttachments]);

  useEffect(() => {
    if (lessonData?.lesson) {
      const l = lessonData.lesson as any; // Typecast an toàn do Schema LessonPreview chưa update
      reset({
        title: l.title,
        isFreePreview: l.isFreePreview,
        content: l.content || '',
        primaryVideoId: undefined, // Không điền ID trừ khi có file mới
        examId: l.examId || '',
        attachments: l.attachments?.map((a: any) => a.id) || [], // Map theo schema mới
        // [CTO FIX]: Khôi phục luật thi từ DB hoặc set default
        examRules: l.examRules || {
          timeLimit: 45, maxAttempts: 1, passPercentage: 50, showResultMode: 'IMMEDIATELY'
        }
      });
      
      setVideoPreviewUrl(l.primaryVideo?.url || null);
      setLocalAttachments(l.attachments?.map((a: any) => ({ id: a.id, name: a.originalName, url: a.url || '#' })) || []);

      // Logic: Lookup tên đề thi từ cache
      if (l.examId) {
        // [CTO FIX]: Handle các response format khác nhau từ React Query
        const examsList = Array.isArray(examsData) 
            ? examsData 
            : (examsData as any)?.items || (examsData as any)?.data || [];
            
        const matchedExam = examsList.find((ex: any) => (ex._id || ex.id) === l.examId);
        setSelectedExamTitle(matchedExam ? matchedExam.title : `Đề thi (ID: ${l.examId.substring(0,6)}...)`);
      } else {
        setSelectedExamTitle(null);
      }
    }
  }, [lessonData, reset, examsData]);

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
    } catch (error) {
      setVideoPreviewUrl(null);
    } finally {
      e.target.value = '';
    }
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
      } catch (error) {
        URL.revokeObjectURL(objectUrl);
      }
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

  const onSubmit = (data: UpdateLessonDTO) => {
    const sanitizedPayload = {
      ...data,
      content: (!data.content || data.content.trim() === '') ? '<p></p>' : data.content,
    };

    // Chặn gửi luật thi ảo nếu bài học không gắn Exam
    if (!sanitizedPayload.examId) {
      delete sanitizedPayload.examRules;
    }

    updateLesson(sanitizedPayload, { onSuccess: onClose });
  };

  return (
    <>
      <Dialog open={!!lessonData} onOpenChange={(open) => !open && !isFormLocked && onClose()}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto" onInteractOutside={(e) => { if (isFormLocked) e.preventDefault(); }}>
          <DialogHeader>
              <DialogTitle className="text-2xl">Sửa Bài Học</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-2">
            
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/20 space-y-4">
                <label className="text-sm font-bold flex items-center gap-2 text-blue-600">
                  <Video className="w-4 h-4" /> Video bài giảng
                </label>
                
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

              {/* VÙNG CHỌN ĐỀ THI & CẤU HÌNH LUẬT (REFACTORED) */}
              <div className="p-4 bg-purple-500/5 rounded-xl border border-purple-500/20 space-y-4 flex flex-col">
                <label className="text-sm font-bold flex items-center gap-2 text-purple-600"><CheckCircle2 className="w-4 h-4" /> Bài kiểm tra (Quiz)</label>
                
                {watch('examId') ? (
                  <div className="flex-1 flex flex-col gap-3">
                    <div className="bg-white border border-purple-200 rounded-lg p-3 shadow-sm">
                      <div className="flex items-start gap-2 w-full">
                        <FileText className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                        <span className="text-sm font-semibold text-slate-700 line-clamp-2">{selectedExamTitle || 'Đề thi đã chọn'}</span>
                      </div>
                      <div className="flex gap-2 w-full mt-2">
                         <Button type="button" variant="outline" size="sm" className="flex-1 h-8 text-xs border-purple-200 text-purple-600" onClick={() => setIsExamSheetOpen(true)} disabled={isFormLocked}>Đổi đề</Button>
                         <Button type="button" variant="destructive" size="sm" className="h-8 px-2" onClick={() => { setValue('examId', undefined, { shouldDirty: true }); setSelectedExamTitle(null); }} disabled={isFormLocked}><X className="w-4 h-4" /></Button>
                      </div>
                    </div>

                    {/* [NEW] UI Cấu hình luật thi */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-3 shadow-inner">
                       <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5"><Settings2 className="w-3.5 h-3.5"/> Cấu hình Luật thi</h4>
                       <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Thời gian (Phút)</label>
                            <Input type="number" min={0} className="h-8 text-sm" disabled={isFormLocked} {...register('examRules.timeLimit', { valueAsNumber: true })} />
                            {errors.examRules?.timeLimit && <p className="text-[10px] text-red-500">{errors.examRules.timeLimit.message}</p>}
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Lượt làm bài</label>
                            <Input type="number" min={1} className="h-8 text-sm" disabled={isFormLocked} {...register('examRules.maxAttempts', { valueAsNumber: true })} />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Điểm qua môn (%)</label>
                            <Input type="number" min={0} max={100} className="h-8 text-sm" disabled={isFormLocked} {...register('examRules.passPercentage', { valueAsNumber: true })} />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Xem đáp án</label>
                            <Controller
                              name="examRules.showResultMode"
                              control={control}
                              render={({ field }) => (
                                <Select disabled={isFormLocked} value={field.value} onValueChange={(val) => { field.onChange(val); setValue('examRules.showResultMode', val as any, { shouldDirty: true }); }}>
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="Chọn mode" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="IMMEDIATELY">Xem ngay</SelectItem>
                                    <SelectItem value="AFTER_END_TIME">Sau khi hết giờ</SelectItem>
                                    <SelectItem value="NEVER">Không bao giờ</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          </div>
                       </div>
                    </div>
                  </div>
                ) : (
                  <Button type="button" variant="outline" className="w-full h-10 border-purple-200 hover:bg-purple-50 text-purple-600 mt-auto" onClick={() => setIsExamSheetOpen(true)} disabled={isFormLocked}>
                    + Chọn đề thi từ Ngân hàng
                  </Button>
                )}
                <Input type="hidden" {...register('examId')} />
              </div>
            </div>

            <div className="p-4 bg-orange-500/5 rounded-xl border border-orange-500/20 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold flex items-center gap-2 text-orange-600">
                  <FileText className="w-4 h-4" /> Tài liệu đính kèm
                </label>
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
                        <a href={file.url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors" title="Xem trước file">
                          <Eye className="w-4 h-4" />
                        </a>
                        <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => removeAttachment(file.id)} disabled={isFormLocked}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3 bg-muted/40 p-3 rounded-lg border border-border">
              <Checkbox id="isFreePreviewEdit" checked={watch('isFreePreview')} onCheckedChange={(c) => setValue('isFreePreview', c as boolean, { shouldDirty: true })} disabled={isFormLocked} />
              <label htmlFor="isFreePreviewEdit" className="text-sm font-semibold cursor-pointer select-none">Mở khóa học thử miễn phí</label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="ghost" onClick={onClose} disabled={isFormLocked}>Hủy bỏ</Button>
              <Button type="submit" disabled={isFormLocked || !isDirty}>
                {isUpdatingDB && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Lưu thay đổi
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* RENDER SHEET CHỌN ĐỀ THI BÊN NGOÀI DIALOG */}
      {isExamSheetOpen && (
        <ExamSelectorSheet 
          isOpen={isExamSheetOpen}
          onClose={() => setIsExamSheetOpen(false)}
          currentExamId={watch('examId')}
          onSelectExam={(id, title) => {
            setValue('examId', id, { shouldValidate: true, shouldDirty: true });
            setSelectedExamTitle(title);
          }}
        />
      )}
    </>
  );
}