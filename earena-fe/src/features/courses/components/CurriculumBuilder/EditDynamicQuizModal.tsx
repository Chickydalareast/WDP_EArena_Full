'use client';

import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Settings, AlertTriangle, Settings2 } from 'lucide-react';
import { toast } from 'sonner';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';

import { UpdateQuizLessonDTO, UpdateQuizLessonSchema } from '../../types/curriculum.schema';
import { useUpdateQuizLesson } from '../../hooks/useCurriculumMutations';
import { useTeacherCurriculumView } from '../../hooks/useCurriculumBuilder';
import { useLessonQuizDetail, useQuizHealth } from '../../hooks/useQuizQueries';

import { useActiveFilters } from '@/features/exam-builder/hooks/useActiveFilters';
import { useRawFoldersTree } from '@/features/exam-builder/hooks/useFolders';
import { useTopicsTree } from '@/features/exam-builder/hooks/useTopics';

import { DynamicQuizBuilder } from './DynamicQuizBuilder';

interface EditDynamicQuizModalProps {
    courseId: string;
    lessonId: string;
    isOpen: boolean;
    onClose: () => void;
}

export function EditDynamicQuizModal({ courseId, lessonId, isOpen, onClose }: EditDynamicQuizModalProps) {
    const { mutate: updateQuiz, isPending: isUpdating } = useUpdateQuizLesson(courseId);

    const { data: courseData } = useTeacherCurriculumView(courseId);
    const subjectId = courseData?.subject?.id;

    const { data: rawFolders, isFetching: isLoadingFolders } = useRawFoldersTree();
    const { data: rawTopics, isFetching: isLoadingTopics } = useTopicsTree(subjectId);
    const { data: globalFilters, isFetching: isLoadingFilters } = useActiveFilters({ isDraft: false });

    const { data: lessonDetail, isLoading: isLoadingDetail } = useLessonQuizDetail(courseId, lessonId);
    const { data: quizHealth, isLoading: isLoadingHealth } = useQuizHealth(lessonId);

    const folders = (rawFolders as any)?.data || rawFolders || [];
    const topics = (rawTopics as any)?.data || rawTopics || [];
    const activeFilters = (globalFilters as any)?.data || globalFilters;

    const isLocked = quizHealth?.isLocked || false;

    const defaultValues = useMemo<UpdateQuizLessonDTO | undefined>(() => {
        if (!lessonDetail) return undefined;
        
        return {
            lessonId: lessonDetail._id,
            title: lessonDetail.title,
            content: lessonDetail.content,
            isFreePreview: lessonDetail.isFreePreview,
            totalScore: lessonDetail.examId?.totalScore || 10,
            examRules: lessonDetail.examRules || {
                timeLimit: 45, maxAttempts: 1, passPercentage: 50, showResultMode: 'IMMEDIATELY'
            },
            dynamicConfig: lessonDetail.examId?.dynamicConfig || {
                adHocSections: []
            }
        };
    }, [lessonDetail]);

    const form = useForm<UpdateQuizLessonDTO>({
        resolver: zodResolver(UpdateQuizLessonSchema),
        values: defaultValues, // Sử dụng 'values' thay vì 'defaultValues' để form tự reset khi data API trả về
    });

    const onSubmit = (data: UpdateQuizLessonDTO) => {
        updateQuiz(data, {
            onSuccess: () => {
                onClose();
            }
        });
    };

    const isDataLoading = isLoadingDetail || isLoadingHealth || isLoadingFolders || isLoadingTopics;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !isUpdating && onClose()}>
            <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto bg-slate-50/50">
                <DialogHeader>
                    <DialogTitle className="text-2xl text-purple-900 flex items-center gap-2">
                        <Settings className="w-6 h-6" /> Chỉnh sửa Bài Kiểm Tra Động
                    </DialogTitle>
                </DialogHeader>

                {isDataLoading ? (
                    // CHỐNG FOUC: Hiển thị Skeleton cho đến khi data sẵn sàng
                    <div className="space-y-6">
                        <Skeleton className="h-32 w-full rounded-xl" />
                        <Skeleton className="h-64 w-full rounded-xl" />
                    </div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            
                            {/* [CTO BUSINESS LOGIC]: BANNER CẢNH BÁO KHÓA FORM */}
                            {isLocked && (
                                <div className="bg-amber-50 border border-amber-300 text-amber-800 p-4 rounded-xl flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-4">
                                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                                    <div className="text-sm">
                                        <strong className="text-base text-amber-900">Bài kiểm tra đã bị khóa cấu trúc bốc đề!</strong>
                                        <p className="mt-1 font-medium">Bài thi này đã có học viên hoàn thành. Để đảm bảo tính công bằng và toàn vẹn dữ liệu kết quả, hệ thống đã khóa thuật toán bốc đề. Bạn chỉ có thể cập nhật thông tin Tiêu đề, Ghi chú và Luật làm bài.</p>
                                    </div>
                                </div>
                            )}

                            {/* THÔNG TIN CƠ BẢN (KHÔNG BỊ KHÓA BỞI isLocked) */}
                            <div className="bg-white p-5 rounded-xl border shadow-sm space-y-4">
                                <FormField control={form.control} name="title" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold">Tên bài kiểm tra <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input {...field} disabled={isUpdating} placeholder="VD: Bài test định kỳ..." className="h-11" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                            </div>

                            {/* [CTO UPDATE]: CẤU HÌNH LUẬT THI (VẪN ĐƯỢC PHÉP SỬA KHI isLocked) */}
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                                <h4 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                                    <Settings2 className="w-4 h-4"/> Cấu hình Luật làm bài
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <FormField control={form.control} name="examRules.timeLimit" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] uppercase text-muted-foreground font-bold">Thời gian (Phút)</FormLabel>
                                            <FormControl>
                                                <Input type="number" min={0} disabled={isUpdating} {...field} onChange={e => field.onChange(Number(e.target.value))} className="h-9" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                    <FormField control={form.control} name="examRules.maxAttempts" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] uppercase text-muted-foreground font-bold">Lượt làm tối đa</FormLabel>
                                            <FormControl>
                                                <Input type="number" min={1} disabled={isUpdating} {...field} onChange={e => field.onChange(Number(e.target.value))} className="h-9" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                    <FormField control={form.control} name="examRules.passPercentage" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] uppercase text-muted-foreground font-bold">Điểm đạt (%)</FormLabel>
                                            <FormControl>
                                                <Input type="number" min={0} max={100} disabled={isUpdating} {...field} onChange={e => field.onChange(Number(e.target.value))} className="h-9" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                    <FormField control={form.control} name="examRules.showResultMode" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] uppercase text-muted-foreground font-bold">Xem đáp án</FormLabel>
                                            <Select disabled={isUpdating} value={field.value} onValueChange={field.onChange}>
                                                <FormControl>
                                                    <SelectTrigger className="h-9 text-xs">
                                                        <SelectValue placeholder="Chọn mode" />
                                                    </SelectTrigger>
                                                </FormControl>
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

                            {/* ĐỘNG CƠ BỐC ĐỀ (BỊ KHÓA NẾU isLocked === true) */}
                            <div className="bg-white p-5 rounded-xl border border-purple-200 shadow-sm relative overflow-hidden">
                                {isLocked && (
                                    // Phủ 1 lớp layer mờ ảo lên trên để ngăn cản triệt để thao tác click
                                    <div className="absolute inset-0 z-10 bg-slate-100/50 backdrop-blur-[1px] cursor-not-allowed"></div>
                                )}
                                <div className="mb-4">
                                    <h3 className="text-lg font-bold text-purple-800 flex items-center justify-between">
                                        Cấu trúc bốc đề 
                                        {isLocked && <span className="text-xs bg-amber-200 text-amber-800 px-2 py-1 rounded font-bold uppercase tracking-wider">Locked</span>}
                                    </h3>
                                </div>
                                
                                {isLoadingFilters ? (
                                    <div className="flex justify-center p-10"><Loader2 className="w-6 h-6 animate-spin" /></div>
                                ) : (
                                    <DynamicQuizBuilder 
                                        folders={folders} 
                                        topics={topics} 
                                        activeFilters={activeFilters} 
                                        disabled={isUpdating || isLocked} 
                                    />
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-slate-50/90 py-4 backdrop-blur-sm z-20">
                                <Button type="button" variant="ghost" onClick={onClose} disabled={isUpdating}>Hủy bỏ</Button>
                                <Button type="submit" disabled={isUpdating} className="bg-purple-600 hover:bg-purple-700">
                                    {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Lưu Cập Nhật
                                </Button>
                            </div>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    );
}