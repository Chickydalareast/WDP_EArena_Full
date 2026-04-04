'use client';
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditQuestionSheet = EditQuestionSheet;
const react_1 = __importStar(require("react"));
const react_hook_form_1 = require("react-hook-form");
const rhf_zod_resolver_1 = require("@/shared/lib/rhf-zod-resolver");
const exam_schema_1 = require("../types/exam.schema");
const hydration_utils_1 = require("../lib/hydration-utils");
const useQuestionMutations_1 = require("../hooks/useQuestionMutations");
const sheet_1 = require("@/shared/components/ui/sheet");
const button_1 = require("@/shared/components/ui/button");
const form_1 = require("@/shared/components/ui/form");
const input_1 = require("@/shared/components/ui/input");
const rich_text_editor_1 = require("@/shared/components/ui/rich-text-editor");
const QuestionMediaUploader_1 = require("./QuestionMediaUploader");
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/shared/lib/utils");
const sonner_1 = require("sonner");
const useSession_1 = require("@/features/auth/hooks/useSession");
const useTopics_1 = require("../hooks/useTopics");
const TopicSelector_1 = require("./TopicSelector");
const select_1 = require("@/shared/components/ui/select");
const DIFFICULTY_OPTIONS = [
    { value: 'UNKNOWN', label: 'Chưa xác định (Chỉ lưu nháp)' },
    { value: 'NB', label: 'Nhận biết' },
    { value: 'TH', label: 'Thông hiểu' },
    { value: 'VD', label: 'Vận dụng' },
    { value: 'VDC', label: 'Vận dụng cao' },
];
const EditAnswersBlock = ({ path, disabled }) => {
    const { control, setValue, watch } = (0, react_hook_form_1.useFormContext)();
    const { fields } = (0, react_hook_form_1.useFieldArray)({ control, name: path });
    const currentAnswers = watch(path);
    const handleSetCorrect = (selectedIndex) => {
        fields.forEach((_, idx) => {
            setValue(`${path}.${idx}.isCorrect`, idx === selectedIndex, { shouldValidate: true, shouldDirty: true });
        });
    };
    return (<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {fields.map((field, idx) => {
            const letter = ['A', 'B', 'C', 'D'][idx] || 'X';
            const isCorrect = currentAnswers?.[idx]?.isCorrect || false;
            return (<div key={field.id} className="flex items-start gap-3">
                        <button type="button" disabled={disabled} onClick={() => handleSetCorrect(idx)} className={(0, utils_1.cn)("mt-1 shrink-0 transition-colors", isCorrect ? "text-primary" : "text-muted-foreground")}>
                            {isCorrect ? <lucide_react_1.CheckCircle2 className="w-7 h-7"/> : <lucide_react_1.Circle className="w-7 h-7"/>}
                        </button>
                        <form_1.FormField control={control} name={`${path}.${idx}.content`} render={({ field: inputField }) => (<form_1.FormItem className="flex-1">
                                    <form_1.FormControl>
                                        <input_1.Input placeholder={`Đáp án ${letter}...`} disabled={disabled} {...inputField} className={(0, utils_1.cn)(isCorrect && "border-primary bg-primary/5")}/>
                                    </form_1.FormControl>
                                    <form_1.FormMessage />
                                </form_1.FormItem>)}/>
                    </div>);
        })}
        </div>);
};
const EditSubQuestionsBlock = ({ disabled, question }) => {
    const { control } = (0, react_hook_form_1.useFormContext)();
    const path = `subQuestions`;
    const { fields, append, remove } = (0, react_hook_form_1.useFieldArray)({ control, name: path });
    return (<div className="mt-6 space-y-6">
            <h4 className="font-bold text-foreground flex items-center gap-2 border-b pb-2">
                <lucide_react_1.Layers className="w-5 h-5 text-primary"/> Quản lý Câu hỏi con
            </h4>

            {fields.map((subField, subIdx) => (<div key={subField.id} className="p-5 bg-card text-card-foreground border rounded-2xl relative shadow-sm">
                    <div className="absolute -left-3 top-5 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xs shadow-sm">
                        {subIdx + 1}
                    </div>

                    <button type="button" onClick={() => remove(subIdx)} className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors" title="Xóa câu hỏi phụ">
                        <lucide_react_1.Trash2 className="w-4 h-4"/>
                    </button>

                    <div className="mb-4 w-full md:w-1/2 pt-6">
                        <form_1.FormField control={control} name={`${path}.${subIdx}.difficultyLevel`} render={({ field }) => (<form_1.FormItem>
                                    <form_1.FormLabel className="text-xs text-muted-foreground font-semibold">Độ khó câu hỏi phụ</form_1.FormLabel>
                                    <select_1.Select disabled={disabled} onValueChange={field.onChange} value={field.value}>
                                        <form_1.FormControl><select_1.SelectTrigger className="bg-background"><select_1.SelectValue placeholder="Chọn độ khó"/></select_1.SelectTrigger></form_1.FormControl>
                                        <select_1.SelectContent>
                                            {DIFFICULTY_OPTIONS.map(opt => (<select_1.SelectItem key={opt.value} value={opt.value}>{opt.label}</select_1.SelectItem>))}
                                        </select_1.SelectContent>
                                    </select_1.Select>
                                    <form_1.FormMessage />
                                </form_1.FormItem>)}/>
                    </div>

                    <form_1.FormField control={control} name={`${path}.${subIdx}.content`} render={({ field }) => (<form_1.FormItem><form_1.FormControl><rich_text_editor_1.RichTextEditor value={field.value} onChange={field.onChange} disabled={disabled}/></form_1.FormControl><form_1.FormMessage /></form_1.FormItem>)}/>

                    <form_1.FormField control={control} name={`${path}.${subIdx}.attachedMedia`} render={({ field }) => (<form_1.FormItem className="mt-4">
                                <form_1.FormControl>
                                    <QuestionMediaUploader_1.QuestionMediaUploader value={field.value} onChange={field.onChange} disabled={disabled} initialMedia={question?.subQuestions?.[subIdx]?.attachedMedia}/>
                                </form_1.FormControl>
                                <form_1.FormMessage />
                            </form_1.FormItem>)}/>

                    <EditAnswersBlock path={`${path}.${subIdx}.answers`} disabled={disabled}/>
                </div>))}

            <button_1.Button type="button" variant="outline" size="sm" disabled={disabled} onClick={() => append({
            content: '', difficultyLevel: 'UNKNOWN', attachedMedia: [],
            answers: [{ id: 'A', content: '', isCorrect: true }, { id: 'B', content: '', isCorrect: false }, { id: 'C', content: '', isCorrect: false }, { id: 'D', content: '', isCorrect: false }]
        })} className="w-full border-dashed text-primary hover:text-primary hover:bg-primary/5">
                <lucide_react_1.Plus className="w-4 h-4 mr-2"/> Thêm câu hỏi phụ mới
            </button_1.Button>
        </div>);
};
function EditQuestionSheet({ question, answerKeys, paperId, mode = 'EXAM', onClose }) {
    const isOpen = !!question;
    const { user } = (0, useSession_1.useSession)();
    const subjectId = user?.subjects?.[0]?.id;
    const { data: topics = [], isLoading: isTopicsLoading } = (0, useTopics_1.useTopicsTree)(mode === 'BANK' ? subjectId : undefined);
    const { mutate: updateSingle, isPending: isUpdatingSingle } = (0, useQuestionMutations_1.useUpdateSingleQuestion)({ paperId, isBankMode: mode === 'BANK' });
    const { mutate: updatePassage, isPending: isUpdatingPassage } = (0, useQuestionMutations_1.useUpdatePassageQuestion)({ paperId, isBankMode: mode === 'BANK' });
    const isPending = isUpdatingSingle || isUpdatingPassage;
    const methods = (0, react_hook_form_1.useForm)({
        resolver: (0, rhf_zod_resolver_1.rhfZodResolver)(exam_schema_1.EditQuestionFormSchema),
        defaultValues: { type: 'MULTIPLE_CHOICE', content: '', isDraft: true },
    });
    const watchedTopicId = methods.watch('topicId');
    const watchedDifficulty = methods.watch('difficultyLevel');
    const watchedType = methods.watch('type');
    const watchedSubQuestions = methods.watch('subQuestions');
    const canPublish = !isPending && !!watchedTopicId && watchedDifficulty !== 'UNKNOWN' &&
        (watchedType !== 'PASSAGE' || !watchedSubQuestions?.some(sub => sub.difficultyLevel === 'UNKNOWN'));
    (0, react_1.useEffect)(() => {
        if (question) {
            const hydratedData = (0, hydration_utils_1.hydrateQuestionForEdit)(question, answerKeys);
            methods.reset(hydratedData);
        }
    }, [question, answerKeys, methods]);
    const processSubmit = (submitMode) => {
        methods.setValue('isDraft', submitMode === 'DRAFT', { shouldValidate: true });
        methods.handleSubmit(onSubmit, (errors) => {
            console.error("Zod Validation Errors:", errors);
            sonner_1.toast.error("Vui lòng kiểm tra lại form! (Nội dung quá ngắn, thiếu chuyên đề/độ khó, hoặc thiếu đáp án)");
        })();
    };
    const onSubmit = (data) => {
        if (!question)
            return;
        const targetId = question.originalQuestionId || question._id;
        if (!targetId) {
            sonner_1.toast.error('Không tìm thấy ID câu hỏi để cập nhật!');
            return;
        }
        if (data.type === 'MULTIPLE_CHOICE') {
            const payload = {
                content: data.content,
                topicId: data.topicId,
                difficultyLevel: data.difficultyLevel,
                answers: data.answers,
                attachedMedia: data.attachedMedia,
                isDraft: data.isDraft
            };
            updateSingle({ questionId: targetId, payload }, { onSuccess: () => onClose() });
        }
        else {
            const payload = {
                content: data.content,
                topicId: data.topicId,
                difficultyLevel: data.difficultyLevel,
                attachedMedia: data.attachedMedia,
                subQuestions: (data.subQuestions || []).map(q => {
                    const { _id, ...rest } = q;
                    return { ...rest, id: _id };
                }),
                isDraft: data.isDraft
            };
            updatePassage({ passageId: targetId, payload }, { onSuccess: () => onClose() });
        }
    };
    return (<sheet_1.Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <sheet_1.SheetContent side="right" className="w-full sm:max-w-5xl overflow-y-auto bg-background sm:rounded-l-2xl">
                <sheet_1.SheetHeader className="mb-6 border-b pb-4">
                    <sheet_1.SheetTitle className="text-2xl font-black text-foreground">
                        {question?.type === 'PASSAGE' ? 'Sửa Khối Bài Đọc' : 'Sửa Câu Hỏi'}
                    </sheet_1.SheetTitle>
                </sheet_1.SheetHeader>

                <react_hook_form_1.FormProvider {...methods}>
                    <form className="space-y-6 pb-20">

                        <div className="bg-card p-5 rounded-2xl border shadow-sm">
                            <span className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider bg-secondary text-secondary-foreground mb-4 inline-block">
                                Nội Dung Gốc
                            </span>

                            {mode === 'BANK' && (<div className="grid grid-cols-1 gap-4 mb-6 bg-accent/30 p-4 rounded-xl border border-border">
                                    <form_1.FormField control={methods.control} name="topicId" render={({ field }) => (<form_1.FormItem className="min-w-0">
                                                <form_1.FormLabel className="font-semibold text-foreground">Chuyên đề môn học</form_1.FormLabel>
                                                <form_1.FormControl>
                                                    <TopicSelector_1.TopicSelector value={field.value} onChange={field.onChange} topics={topics} isLoading={isTopicsLoading} disabled={isPending}/>
                                                </form_1.FormControl>
                                                <form_1.FormMessage />
                                            </form_1.FormItem>)}/>
                                    
                                    <form_1.FormField control={methods.control} name="difficultyLevel" render={({ field }) => (<form_1.FormItem className="min-w-0">
                                                <form_1.FormLabel className="font-semibold text-foreground">Độ khó câu gốc</form_1.FormLabel>
                                                <select_1.Select disabled={isPending} onValueChange={field.onChange} value={field.value}>
                                                    <form_1.FormControl><select_1.SelectTrigger className="bg-background"><select_1.SelectValue placeholder="Chọn độ khó"/></select_1.SelectTrigger></form_1.FormControl>
                                                    <select_1.SelectContent>
                                                        {DIFFICULTY_OPTIONS.map(opt => (<select_1.SelectItem key={opt.value} value={opt.value}>{opt.label}</select_1.SelectItem>))}
                                                    </select_1.SelectContent>
                                                </select_1.Select>
                                                <form_1.FormMessage />
                                            </form_1.FormItem>)}/>
                                </div>)}

                            <form_1.FormField control={methods.control} name="content" render={({ field }) => (<form_1.FormItem><form_1.FormControl><rich_text_editor_1.RichTextEditor value={field.value} onChange={field.onChange} disabled={isPending}/></form_1.FormControl><form_1.FormMessage /></form_1.FormItem>)}/>

                            <form_1.FormField control={methods.control} name="attachedMedia" render={({ field }) => (<form_1.FormItem className="mt-4">
                                        <form_1.FormControl>
                                            <QuestionMediaUploader_1.QuestionMediaUploader value={field.value} onChange={field.onChange} disabled={isPending} initialMedia={question?.attachedMedia}/>
                                        </form_1.FormControl>
                                        <form_1.FormMessage />
                                    </form_1.FormItem>)}/>

                            {question?.type === 'MULTIPLE_CHOICE' && (<div className="mt-4 pt-4 border-t">
                                    <EditAnswersBlock path="answers" disabled={isPending}/>
                                </div>)}
                        </div>

                        {question?.type === 'PASSAGE' && <EditSubQuestionsBlock disabled={isPending} question={question}/>}

                        <div className="sticky bottom-0 bg-background/90 backdrop-blur-md p-4 -mx-6 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)] border-t flex justify-end gap-3 z-50">
                            <button_1.Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>Hủy</button_1.Button>
                            
                            {mode === 'BANK' ? (<>
                                    <button_1.Button type="button" variant="secondary" disabled={isPending} onClick={() => processSubmit('DRAFT')} className="font-bold">
                                        {isPending ? <lucide_react_1.Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <lucide_react_1.Save className="w-4 h-4 mr-2"/>}
                                        Lưu Nháp
                                    </button_1.Button>

                                    <button_1.Button type="button" variant="default" disabled={!canPublish} onClick={() => processSubmit('PUBLISH')} className={(0, utils_1.cn)("font-bold min-w-[120px] transition-all", !canPublish && "opacity-40")} title={!canPublish ? "Vui lòng chọn Chuyên đề và Độ khó để xuất bản" : "Lưu và Xuất Bản"}>
                                        {isPending ? <lucide_react_1.Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <lucide_react_1.Send className="w-4 h-4 mr-2"/>}
                                        Lưu & Xuất Bản
                                    </button_1.Button>
                                </>) : (<button_1.Button type="button" variant="default" disabled={isPending} onClick={() => methods.handleSubmit(onSubmit, () => sonner_1.toast.error("Vui lòng điền đủ thông tin!"))()} className="font-bold min-w-[120px]">
                                    {isPending && <lucide_react_1.Loader2 className="w-4 h-4 mr-2 animate-spin"/>}
                                    Lưu Thay Đổi
                                </button_1.Button>)}
                        </div>

                    </form>
                </react_hook_form_1.FormProvider>
            </sheet_1.SheetContent>
        </sheet_1.Sheet>);
}
//# sourceMappingURL=EditQuestionSheet.js.map