'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditDynamicQuizModal = EditDynamicQuizModal;
const react_1 = require("react");
const react_hook_form_1 = require("react-hook-form");
const rhf_zod_resolver_1 = require("@/shared/lib/rhf-zod-resolver");
const lucide_react_1 = require("lucide-react");
const dialog_1 = require("@/shared/components/ui/dialog");
const button_1 = require("@/shared/components/ui/button");
const input_1 = require("@/shared/components/ui/input");
const skeleton_1 = require("@/shared/components/ui/skeleton");
const form_1 = require("@/shared/components/ui/form");
const select_1 = require("@/shared/components/ui/select");
const curriculum_schema_1 = require("../../types/curriculum.schema");
const useCurriculumMutations_1 = require("../../hooks/useCurriculumMutations");
const useCurriculumBuilder_1 = require("../../hooks/useCurriculumBuilder");
const useQuizQueries_1 = require("../../hooks/useQuizQueries");
const useActiveFilters_1 = require("@/features/exam-builder/hooks/useActiveFilters");
const useFolders_1 = require("@/features/exam-builder/hooks/useFolders");
const useTopics_1 = require("@/features/exam-builder/hooks/useTopics");
const DynamicQuizBuilder_1 = require("./DynamicQuizBuilder");
function EditDynamicQuizModal({ courseId, lessonId, isOpen, onClose }) {
    const { mutate: updateQuiz, isPending: isUpdating } = (0, useCurriculumMutations_1.useUpdateQuizLesson)(courseId);
    const { data: courseData } = (0, useCurriculumBuilder_1.useTeacherCurriculumView)(courseId);
    const subjectId = courseData?.subject?.id;
    const { data: rawFolders, isFetching: isLoadingFolders } = (0, useFolders_1.useRawFoldersTree)();
    const { data: rawTopics, isFetching: isLoadingTopics } = (0, useTopics_1.useTopicsTree)(subjectId);
    const { data: globalFilters, isFetching: isLoadingFilters } = (0, useActiveFilters_1.useActiveFilters)({ isDraft: false });
    const { data: lessonDetail, isLoading: isLoadingDetail } = (0, useQuizQueries_1.useLessonQuizDetail)(courseId, lessonId);
    const { data: quizHealth, isLoading: isLoadingHealth } = (0, useQuizQueries_1.useQuizHealth)(lessonId);
    const folders = rawFolders?.data || rawFolders || [];
    const topics = rawTopics?.data || rawTopics || [];
    const activeFilters = globalFilters?.data || globalFilters;
    const isLocked = quizHealth?.isLocked || false;
    const defaultValues = (0, react_1.useMemo)(() => {
        if (!lessonDetail)
            return undefined;
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
            },
        };
    }, [lessonDetail]);
    const form = (0, react_hook_form_1.useForm)({
        resolver: (0, rhf_zod_resolver_1.rhfZodResolver)(curriculum_schema_1.UpdateQuizLessonSchema),
        values: defaultValues,
    });
    const onSubmit = (data) => {
        updateQuiz(data, {
            onSuccess: () => {
                onClose();
            }
        });
    };
    const isDataLoading = isLoadingDetail || isLoadingHealth || isLoadingFolders || isLoadingTopics;
    return (<dialog_1.Dialog open={isOpen} onOpenChange={(open) => !open && !isUpdating && onClose()}>
            <dialog_1.DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto bg-slate-50/50">
                <dialog_1.DialogHeader>
                    <dialog_1.DialogTitle className="text-2xl text-purple-900 flex items-center gap-2">
                        <lucide_react_1.Settings className="w-6 h-6"/> Chỉnh sửa Bài Kiểm Tra Động
                    </dialog_1.DialogTitle>
                </dialog_1.DialogHeader>

                {isDataLoading ? (<div className="space-y-6">
                        <skeleton_1.Skeleton className="h-32 w-full rounded-xl"/>
                        <skeleton_1.Skeleton className="h-64 w-full rounded-xl"/>
                    </div>) : (<form_1.Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            
                            
                            {isLocked && (<div className="bg-amber-50 border border-amber-300 text-amber-800 p-4 rounded-xl flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-4">
                                    <lucide_react_1.AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0"/>
                                    <div className="text-sm">
                                        <strong className="text-base text-amber-900">Bài kiểm tra đã bị khóa cấu trúc bốc đề!</strong>
                                        <p className="mt-1 font-medium">Bài thi này đã có học viên hoàn thành. Để đảm bảo tính công bằng và toàn vẹn dữ liệu kết quả, hệ thống đã khóa thuật toán bốc đề. Bạn chỉ có thể cập nhật thông tin Tiêu đề, Ghi chú và Luật làm bài.</p>
                                    </div>
                                </div>)}

                            
                            <div className="bg-white p-5 rounded-xl border shadow-sm space-y-4">
                                <form_1.FormField control={form.control} name="title" render={({ field }) => (<form_1.FormItem>
                                        <form_1.FormLabel className="font-bold">Tên bài kiểm tra <span className="text-red-500">*</span></form_1.FormLabel>
                                        <form_1.FormControl>
                                            <input_1.Input {...field} disabled={isUpdating} placeholder="VD: Bài test định kỳ..." className="h-11"/>
                                        </form_1.FormControl>
                                        <form_1.FormMessage />
                                    </form_1.FormItem>)}/>
                            </div>

                            
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                                <h4 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                                    <lucide_react_1.Settings2 className="w-4 h-4"/> Cấu hình Luật làm bài
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <form_1.FormField control={form.control} name="examRules.timeLimit" render={({ field }) => (<form_1.FormItem>
                                            <form_1.FormLabel className="text-[10px] uppercase text-muted-foreground font-bold">Thời gian (Phút)</form_1.FormLabel>
                                            <form_1.FormControl>
                                                <input_1.Input type="number" min={0} disabled={isUpdating} {...field} onChange={e => field.onChange(Number(e.target.value))} className="h-9"/>
                                            </form_1.FormControl>
                                            <form_1.FormMessage />
                                        </form_1.FormItem>)}/>
                                    <form_1.FormField control={form.control} name="examRules.maxAttempts" render={({ field }) => (<form_1.FormItem>
                                            <form_1.FormLabel className="text-[10px] uppercase text-muted-foreground font-bold">Lượt làm tối đa</form_1.FormLabel>
                                            <form_1.FormControl>
                                                <input_1.Input type="number" min={1} disabled={isUpdating} {...field} onChange={e => field.onChange(Number(e.target.value))} className="h-9"/>
                                            </form_1.FormControl>
                                            <form_1.FormMessage />
                                        </form_1.FormItem>)}/>
                                    <form_1.FormField control={form.control} name="examRules.passPercentage" render={({ field }) => (<form_1.FormItem>
                                            <form_1.FormLabel className="text-[10px] uppercase text-muted-foreground font-bold">Điểm đạt (%)</form_1.FormLabel>
                                            <form_1.FormControl>
                                                <input_1.Input type="number" min={0} max={100} disabled={isUpdating} {...field} onChange={e => field.onChange(Number(e.target.value))} className="h-9"/>
                                            </form_1.FormControl>
                                            <form_1.FormMessage />
                                        </form_1.FormItem>)}/>
                                    <form_1.FormField control={form.control} name="examRules.showResultMode" render={({ field }) => (<form_1.FormItem>
                                            <form_1.FormLabel className="text-[10px] uppercase text-muted-foreground font-bold">Xem đáp án</form_1.FormLabel>
                                            <select_1.Select disabled={isUpdating} value={field.value} onValueChange={field.onChange}>
                                                <form_1.FormControl>
                                                    <select_1.SelectTrigger className="h-9 text-xs">
                                                        <select_1.SelectValue placeholder="Chọn mode"/>
                                                    </select_1.SelectTrigger>
                                                </form_1.FormControl>
                                                <select_1.SelectContent>
                                                    <select_1.SelectItem value="IMMEDIATELY">Xem ngay</select_1.SelectItem>
                                                    <select_1.SelectItem value="AFTER_END_TIME">Sau khi hết giờ</select_1.SelectItem>
                                                    <select_1.SelectItem value="NEVER">Không bao giờ</select_1.SelectItem>
                                                </select_1.SelectContent>
                                            </select_1.Select>
                                        </form_1.FormItem>)}/>
                                </div>
                            </div>

                            
                            <div className="bg-white p-5 rounded-xl border border-purple-200 shadow-sm relative overflow-hidden">
                                {isLocked && (<div className="absolute inset-0 z-10 bg-slate-100/50 backdrop-blur-[1px] cursor-not-allowed"></div>)}
                                <div className="mb-4">
                                    <h3 className="text-lg font-bold text-purple-800 flex items-center justify-between">
                                        Cấu trúc bốc đề 
                                        {isLocked && <span className="text-xs bg-amber-200 text-amber-800 px-2 py-1 rounded font-bold uppercase tracking-wider">Locked</span>}
                                    </h3>
                                </div>
                                
                                {isLoadingFilters ? (<div className="flex justify-center p-10"><lucide_react_1.Loader2 className="w-6 h-6 animate-spin"/></div>) : (<DynamicQuizBuilder_1.DynamicQuizBuilder folders={folders} topics={topics} activeFilters={activeFilters} disabled={isUpdating || isLocked}/>)}
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-slate-50/90 py-4 backdrop-blur-sm z-20">
                                <button_1.Button type="button" variant="ghost" onClick={onClose} disabled={isUpdating}>Hủy bỏ</button_1.Button>
                                <button_1.Button type="submit" disabled={isUpdating} className="bg-purple-600 hover:bg-purple-700">
                                    {isUpdating && <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                    Lưu Cập Nhật
                                </button_1.Button>
                            </div>
                        </form>
                    </form_1.Form>)}
            </dialog_1.DialogContent>
        </dialog_1.Dialog>);
}
//# sourceMappingURL=EditDynamicQuizModal.js.map