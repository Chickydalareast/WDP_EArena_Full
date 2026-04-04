'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateDynamicQuizModal = CreateDynamicQuizModal;
const react_1 = require("react");
const react_hook_form_1 = require("react-hook-form");
const rhf_zod_resolver_1 = require("@/shared/lib/rhf-zod-resolver");
const lucide_react_1 = require("lucide-react");
const sonner_1 = require("sonner");
const dialog_1 = require("@/shared/components/ui/dialog");
const button_1 = require("@/shared/components/ui/button");
const input_1 = require("@/shared/components/ui/input");
const form_1 = require("@/shared/components/ui/form");
const select_1 = require("@/shared/components/ui/select");
const auth_store_1 = require("@/features/auth/stores/auth.store");
const curriculum_schema_1 = require("../../types/curriculum.schema");
const useCurriculumMutations_1 = require("../../hooks/useCurriculumMutations");
const usePreviewQuizConfig_1 = require("../../hooks/usePreviewQuizConfig");
const quiz_utils_1 = require("../../lib/quiz-utils");
const useActiveFilters_1 = require("@/features/exam-builder/hooks/useActiveFilters");
const useFolders_1 = require("@/features/exam-builder/hooks/useFolders");
const useTopics_1 = require("@/features/exam-builder/hooks/useTopics");
const DynamicQuizBuilder_1 = require("./DynamicQuizBuilder");
const QuizLivePreviewModal_1 = require("./QuizLivePreviewModal");
function CreateDynamicQuizModal({ courseId, sectionId, isOpen, onClose }) {
    const { mutate: createQuiz, isPending: isCreating } = (0, useCurriculumMutations_1.useCreateQuizLesson)(courseId, sectionId);
    const { mutateAsync: fetchPreview, isPending: isPreviewing } = (0, usePreviewQuizConfig_1.usePreviewQuizConfig)();
    const user = (0, auth_store_1.useAuthStore)((state) => state.user);
    const subjectId = user?.subjects?.[0]?.id;
    const { data: rawFolders } = (0, useFolders_1.useRawFoldersTree)();
    const { data: rawTopics } = (0, useTopics_1.useTopicsTree)(subjectId);
    const { data: globalFilters, isFetching: isLoadingFilters } = (0, useActiveFilters_1.useActiveFilters)({ isDraft: false });
    const folders = rawFolders?.data || rawFolders || [];
    const topics = rawTopics?.data || rawTopics || [];
    const activeFilters = globalFilters?.data || globalFilters;
    const form = (0, react_hook_form_1.useForm)({
        resolver: (0, rhf_zod_resolver_1.rhfZodResolver)(curriculum_schema_1.CreateQuizLessonSchema),
        defaultValues: {
            courseId,
            sectionId,
            title: '',
            content: '',
            isFreePreview: false,
            totalScore: 10,
            examRules: {
                timeLimit: 45, maxAttempts: 1, passPercentage: 50, showResultMode: 'IMMEDIATELY',
            },
            dynamicConfig: {
                adHocSections: [
                    { name: 'Phần 1: Trắc nghiệm', orderIndex: 0, rules: [{ limit: 10, folderIds: [], topicIds: [], difficulties: [], tags: [] }] }
                ]
            }
        },
    });
    (0, react_1.useEffect)(() => {
        if (isOpen) {
            form.reset({
                courseId,
                sectionId,
                title: '',
                content: '',
                isFreePreview: false,
                totalScore: 10,
                examRules: { timeLimit: 45, maxAttempts: 1, passPercentage: 50, showResultMode: 'IMMEDIATELY' },
                dynamicConfig: {
                    adHocSections: [{ name: 'Phần 1: Trắc nghiệm', orderIndex: 0, rules: [{ limit: 10, folderIds: [], topicIds: [], difficulties: [], tags: [] }] }]
                }
            });
        }
    }, [isOpen, courseId, sectionId, form]);
    const [previewData, setPreviewData] = (0, react_1.useState)(null);
    const [cooldown, setCooldown] = (0, react_1.useState)(0);
    (0, react_1.useEffect)(() => {
        if (cooldown <= 0)
            return;
        const timer = setInterval(() => setCooldown(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [cooldown]);
    const handlePreview = async () => {
        if (cooldown > 0)
            return;
        const isValid = await form.trigger('dynamicConfig');
        if (!isValid) {
            sonner_1.toast.warning('Vui lòng hoàn thiện cấu trúc bốc đề trước khi xem trước.');
            return;
        }
        const config = form.getValues('dynamicConfig');
        try {
            const response = await fetchPreview({ matrixId: config.matrixId, adHocSections: config.adHocSections });
            const actualData = response?.data || response;
            const nested = (0, quiz_utils_1.buildNestedQuestions)(actualData.previewData.questions);
            setPreviewData({ questions: nested, totalItems: actualData.totalItems, actual: actualData.totalActualQuestions });
            setCooldown(10);
            sonner_1.toast.success('Sinh đề nháp thành công!');
        }
        catch (error) { }
    };
    const onSubmit = (data) => {
        createQuiz(data, { onSuccess: () => { form.reset(); onClose(); } });
    };
    const onValidationError = (errors) => {
        console.error("Lỗi Validation Form:", errors);
        sonner_1.toast.error("Thiếu thông tin bắt buộc!", { description: "Vui lòng kiểm tra lại Tên bài, Số lượng câu, Thư mục hoặc Luật thi." });
    };
    const isFormLocked = isCreating || isPreviewing;
    return (<>
            <dialog_1.Dialog open={isOpen} onOpenChange={(open) => !open && !isFormLocked && onClose()}>
                <dialog_1.DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto bg-slate-50/50">
                    <dialog_1.DialogHeader>
                        <dialog_1.DialogTitle className="text-2xl text-purple-900 flex items-center gap-2">
                            <lucide_react_1.Settings className="w-6 h-6"/> Tạo Bài Kiểm Tra Động (Rules)
                        </dialog_1.DialogTitle>
                    </dialog_1.DialogHeader>

                    <form_1.Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit, onValidationError)} className="space-y-6">
                            
                            <div className="bg-white p-5 rounded-xl border shadow-sm space-y-4">
                                <form_1.FormField control={form.control} name="title" render={({ field }) => (<form_1.FormItem>
                                        <form_1.FormLabel className="font-bold">Tên bài kiểm tra <span className="text-red-500">*</span></form_1.FormLabel>
                                        <form_1.FormControl><input_1.Input {...field} disabled={isFormLocked} placeholder="VD: Bài test định kỳ..." className="h-11"/></form_1.FormControl>
                                        <form_1.FormMessage />
                                    </form_1.FormItem>)}/>
                            </div>

                            
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                                <h4 className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><lucide_react_1.Settings2 className="w-4 h-4"/> Cấu hình Luật làm bài</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <form_1.FormField control={form.control} name="examRules.timeLimit" render={({ field }) => (<form_1.FormItem>
                                            <form_1.FormLabel className="text-[10px] uppercase text-muted-foreground font-bold">Thời gian (Phút)</form_1.FormLabel>
                                            <form_1.FormControl><input_1.Input type="number" min={0} disabled={isFormLocked} {...field} onChange={e => field.onChange(Number(e.target.value))} className="h-9"/></form_1.FormControl>
                                            <form_1.FormMessage />
                                        </form_1.FormItem>)}/>
                                    <form_1.FormField control={form.control} name="examRules.maxAttempts" render={({ field }) => (<form_1.FormItem>
                                            <form_1.FormLabel className="text-[10px] uppercase text-muted-foreground font-bold">Lượt làm tối đa</form_1.FormLabel>
                                            <form_1.FormControl><input_1.Input type="number" min={1} disabled={isFormLocked} {...field} onChange={e => field.onChange(Number(e.target.value))} className="h-9"/></form_1.FormControl>
                                            <form_1.FormMessage />
                                        </form_1.FormItem>)}/>
                                    <form_1.FormField control={form.control} name="examRules.passPercentage" render={({ field }) => (<form_1.FormItem>
                                            <form_1.FormLabel className="text-[10px] uppercase text-muted-foreground font-bold">Điểm đạt (%)</form_1.FormLabel>
                                            <form_1.FormControl><input_1.Input type="number" min={0} max={100} disabled={isFormLocked} {...field} onChange={e => field.onChange(Number(e.target.value))} className="h-9"/></form_1.FormControl>
                                            <form_1.FormMessage />
                                        </form_1.FormItem>)}/>
                                    <form_1.FormField control={form.control} name="examRules.showResultMode" render={({ field }) => (<form_1.FormItem>
                                            <form_1.FormLabel className="text-[10px] uppercase text-muted-foreground font-bold">Xem đáp án</form_1.FormLabel>
                                            <select_1.Select disabled={isFormLocked} value={field.value} onValueChange={field.onChange}>
                                                <form_1.FormControl><select_1.SelectTrigger className="h-9 text-xs"><select_1.SelectValue placeholder="Chọn mode"/></select_1.SelectTrigger></form_1.FormControl>
                                                <select_1.SelectContent>
                                                    <select_1.SelectItem value="IMMEDIATELY">Xem ngay</select_1.SelectItem>
                                                    <select_1.SelectItem value="AFTER_END_TIME">Sau khi hết giờ</select_1.SelectItem>
                                                    <select_1.SelectItem value="NEVER">Không bao giờ</select_1.SelectItem>
                                                </select_1.SelectContent>
                                            </select_1.Select>
                                        </form_1.FormItem>)}/>
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-xl border border-purple-200 shadow-sm">
                                <div className="mb-4">
                                    <h3 className="text-lg font-bold text-purple-800">Cấu trúc bốc đề</h3>
                                    {!subjectId && <p className="text-xs text-red-600 font-bold mt-1">CẢNH BÁO: Tài khoản của bạn chưa được thiết lập Môn học chuyên môn.</p>}
                                </div>
                                {isLoadingFilters ? (<div className="flex justify-center p-10"><lucide_react_1.Loader2 className="w-6 h-6 animate-spin text-purple-500"/></div>) : (<DynamicQuizBuilder_1.DynamicQuizBuilder folders={folders} topics={topics} activeFilters={activeFilters} disabled={isFormLocked}/>)}
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t sticky bottom-0 bg-slate-50/90 py-4 backdrop-blur-sm z-10">
                                <button_1.Button type="button" variant="ghost" onClick={onClose} disabled={isFormLocked}>Hủy bỏ</button_1.Button>
                                <div className="flex items-center gap-3">
                                    <button_1.Button type="button" variant="outline" className="border-purple-300 text-purple-700 bg-purple-50" onClick={handlePreview} disabled={isFormLocked || cooldown > 0}>
                                        {isPreviewing ? <lucide_react_1.Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <lucide_react_1.Eye className="w-4 h-4 mr-2"/>}
                                        {cooldown > 0 ? `Xem trước (${cooldown}s)` : 'Xem thử Đề'}
                                    </button_1.Button>
                                    <button_1.Button type="submit" disabled={isFormLocked} className="bg-purple-600 hover:bg-purple-700">
                                        {isCreating && <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>} Lưu Bài Kiểm Tra
                                    </button_1.Button>
                                </div>
                            </div>
                        </form>
                    </form_1.Form>
                </dialog_1.DialogContent>
            </dialog_1.Dialog>

            {previewData && (<QuizLivePreviewModal_1.QuizLivePreviewModal isOpen={!!previewData} onClose={() => setPreviewData(null)} questions={previewData.questions} totalItems={previewData.totalItems} totalActualQuestions={previewData.actual}/>)}
        </>);
}
//# sourceMappingURL=CreateDynamicQuizModal.js.map