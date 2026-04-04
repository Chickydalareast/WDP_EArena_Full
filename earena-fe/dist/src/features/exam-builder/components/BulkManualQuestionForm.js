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
exports.BulkManualQuestionForm = BulkManualQuestionForm;
const react_1 = __importStar(require("react"));
const react_hook_form_1 = require("react-hook-form");
const rhf_zod_resolver_1 = require("@/shared/lib/rhf-zod-resolver");
const z = __importStar(require("zod"));
const exam_schema_1 = require("../types/exam.schema");
const useSession_1 = require("@/features/auth/hooks/useSession");
const useTopics_1 = require("../hooks/useTopics");
const rich_text_editor_1 = require("@/shared/components/ui/rich-text-editor");
const button_1 = require("@/shared/components/ui/button");
const input_1 = require("@/shared/components/ui/input");
const form_1 = require("@/shared/components/ui/form");
const select_1 = require("@/shared/components/ui/select");
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/shared/lib/utils");
const QuestionMediaUploader_1 = require("./QuestionMediaUploader");
const TopicSelector_1 = require("./TopicSelector");
const FormSchema = z.object({
    questions: z.array(exam_schema_1.QuestionItemSchema).min(1, 'Phải có ít nhất 1 câu hỏi'),
});
const createDefaultAnswers = () => [
    { id: 'A', content: '', isCorrect: true },
    { id: 'B', content: '', isCorrect: false },
    { id: 'C', content: '', isCorrect: false },
    { id: 'D', content: '', isCorrect: false },
];
const createQuestionItem = (type) => {
    const baseData = {
        type,
        content: '',
        difficultyLevel: 'UNKNOWN',
        topicId: '',
        isDraft: true,
        attachedMedia: [],
    };
    if (type === 'PASSAGE') {
        return {
            ...baseData,
            subQuestions: [
                {
                    content: '',
                    difficultyLevel: 'UNKNOWN',
                    answers: createDefaultAnswers(),
                    attachedMedia: []
                }
            ]
        };
    }
    return {
        ...baseData,
        answers: createDefaultAnswers()
    };
};
const DIFFICULTY_OPTIONS = [
    { value: 'UNKNOWN', label: 'Chưa xác định (Chỉ lưu nháp)' },
    { value: 'NB', label: 'Nhận biết' },
    { value: 'TH', label: 'Thông hiểu' },
    { value: 'VD', label: 'Vận dụng' },
    { value: 'VDC', label: 'Vận dụng cao' },
];
const AnswerOptionsBlock = react_1.default.memo(({ path, disabled }) => {
    const { control, setValue } = (0, react_hook_form_1.useFormContext)();
    const { fields } = (0, react_hook_form_1.useFieldArray)({ control, name: path });
    const currentAnswers = (0, react_hook_form_1.useWatch)({ control, name: path });
    const handleSetCorrect = (0, react_1.useCallback)((selectedIndex) => {
        fields.forEach((_, idx) => {
            setValue(`${path}.${idx}.isCorrect`, idx === selectedIndex, {
                shouldValidate: true,
                shouldDirty: true
            });
        });
    }, [fields, path, setValue]);
    return (<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      {fields.map((field, idx) => {
            const letter = ['A', 'B', 'C', 'D'][idx] || 'X';
            const isCorrect = currentAnswers?.[idx]?.isCorrect || false;
            return (<div key={field.id} className="flex items-start gap-3">
            <button type="button" disabled={disabled} onClick={() => handleSetCorrect(idx)} className={(0, utils_1.cn)("mt-1 flex-shrink-0 transition-colors", isCorrect ? "text-green-500" : "text-slate-300 hover:text-slate-400")}>
              {isCorrect ? <lucide_react_1.CheckCircle2 className="w-7 h-7"/> : <lucide_react_1.Circle className="w-7 h-7"/>}
            </button>
            <form_1.FormField control={control} name={`${path}.${idx}.content`} render={({ field: inputField }) => (<form_1.FormItem className="flex-1">
                  <form_1.FormControl>
                    <input_1.Input placeholder={`Nội dung đáp án ${letter}...`} disabled={disabled} {...inputField} className={(0, utils_1.cn)(isCorrect && "border-green-300 bg-green-50/30 font-medium")}/>
                  </form_1.FormControl>
                  <form_1.FormMessage />
                </form_1.FormItem>)}/>
          </div>);
        })}
    </div>);
});
AnswerOptionsBlock.displayName = 'AnswerOptionsBlock';
const SubQuestionsBlock = react_1.default.memo(({ parentIndex, disabled, mode }) => {
    const { control } = (0, react_hook_form_1.useFormContext)();
    const path = `questions.${parentIndex}.subQuestions`;
    const { fields, append, remove } = (0, react_hook_form_1.useFieldArray)({ control, name: path });
    return (<div className="mt-6 pl-4 md:pl-8 border-l-2 border-slate-200 space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-slate-700 flex items-center gap-2">
          <lucide_react_1.Layers className="w-5 h-5 text-purple-500"/>
          Danh sách câu hỏi phụ
        </h4>
      </div>

      {fields.map((subField, subIdx) => (<div key={subField.id} className="p-5 bg-white border border-slate-200 shadow-sm rounded-xl relative">
          <div className="absolute -left-3 top-5 w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-xs shadow-sm">
            {subIdx + 1}
          </div>
          
          {fields.length > 1 && (<button type="button" onClick={() => remove(subIdx)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors">
              <lucide_react_1.Trash2 className="w-4 h-4"/>
            </button>)}

          
          {mode === 'QUESTION_BANK' && (<div className="mb-4 w-full md:w-1/2">
               <form_1.FormField control={control} name={`${path}.${subIdx}.difficultyLevel`} render={({ field }) => (<form_1.FormItem>
                      <form_1.FormLabel className="text-xs text-slate-500 font-semibold">Độ khó câu hỏi phụ</form_1.FormLabel>
                      <select_1.Select disabled={disabled} onValueChange={field.onChange} defaultValue={field.value}>
                        <form_1.FormControl><select_1.SelectTrigger><select_1.SelectValue placeholder="Chọn độ khó"/></select_1.SelectTrigger></form_1.FormControl>
                        <select_1.SelectContent>
                          {DIFFICULTY_OPTIONS.map(opt => (<select_1.SelectItem key={opt.value} value={opt.value}>{opt.label}</select_1.SelectItem>))}
                        </select_1.SelectContent>
                      </select_1.Select>
                      <form_1.FormMessage />
                    </form_1.FormItem>)}/>
            </div>)}

          <form_1.FormField control={control} name={`${path}.${subIdx}.content`} render={({ field }) => (<form_1.FormItem>
                <form_1.FormControl><rich_text_editor_1.RichTextEditor value={field.value} onChange={field.onChange} disabled={disabled}/></form_1.FormControl>
                <form_1.FormMessage />
              </form_1.FormItem>)}/>

          <form_1.FormField control={control} name={`${path}.${subIdx}.attachedMedia`} render={({ field }) => (<form_1.FormItem className="mt-2">
                <form_1.FormControl><QuestionMediaUploader_1.QuestionMediaUploader value={field.value} onChange={field.onChange} disabled={disabled}/></form_1.FormControl>
                <form_1.FormMessage />
              </form_1.FormItem>)}/>

          <AnswerOptionsBlock path={`${path}.${subIdx}.answers`} disabled={disabled}/>
        </div>))}

      <button_1.Button type="button" variant="outline" size="sm" disabled={disabled} onClick={() => append({ content: '', difficultyLevel: 'UNKNOWN', answers: createDefaultAnswers(), attachedMedia: [] })} className="text-purple-600 border-purple-200 hover:bg-purple-50 border-dashed w-full">
        <lucide_react_1.Plus className="w-4 h-4 mr-2"/> Thêm câu hỏi phụ
      </button_1.Button>
    </div>);
});
SubQuestionsBlock.displayName = 'SubQuestionsBlock';
const QuestionBlock = react_1.default.memo(({ qIndex, qType, isBusy, mode, topics, isTopicsLoading, remove, canRemove }) => {
    const { control } = (0, react_hook_form_1.useFormContext)();
    const isPassage = qType === 'PASSAGE';
    return (<div className={(0, utils_1.cn)("relative p-6 rounded-2xl border-2 transition-colors", isPassage ? "bg-purple-50/30 border-purple-100" : "bg-blue-50/30 border-blue-100")}>
      <div className={(0, utils_1.cn)("absolute -top-4 -left-4 w-10 h-10 text-white rounded-xl flex items-center justify-center font-black shadow-lg", isPassage ? "bg-purple-600" : "bg-blue-600")}>
        {qIndex + 1}
      </div>
      
      {canRemove && (<button type="button" onClick={() => remove(qIndex)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors bg-white p-2 rounded-lg shadow-sm" title="Xóa toàn bộ khối này">
          <lucide_react_1.Trash2 className="w-5 h-5"/>
        </button>)}

      <div className="mb-4">
        <span className={(0, utils_1.cn)("text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider", isPassage ? "bg-purple-200 text-purple-800" : "bg-blue-200 text-blue-800")}>
          {isPassage ? 'Đoạn Văn Mẹ (Passage)' : 'Câu Hỏi Trắc Nghiệm'}
        </span>
      </div>

      
      {mode === 'QUESTION_BANK' && (<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
           <form_1.FormField control={control} name={`questions.${qIndex}.topicId`} render={({ field }) => (<form_1.FormItem>
                  <form_1.FormLabel className="font-semibold text-slate-700">Chuyên đề môn học</form_1.FormLabel>
                  <form_1.FormControl>
                    <TopicSelector_1.TopicSelector value={field.value} onChange={field.onChange} topics={topics} isLoading={isTopicsLoading} disabled={isBusy}/>
                  </form_1.FormControl>
                  <form_1.FormMessage />
                </form_1.FormItem>)}/>
           
           <form_1.FormField control={control} name={`questions.${qIndex}.difficultyLevel`} render={({ field }) => (<form_1.FormItem>
                  <form_1.FormLabel className="font-semibold text-slate-700">Độ khó câu gốc</form_1.FormLabel>
                  <select_1.Select disabled={isBusy} onValueChange={field.onChange} defaultValue={field.value}>
                    <form_1.FormControl><select_1.SelectTrigger><select_1.SelectValue placeholder="Chọn độ khó"/></select_1.SelectTrigger></form_1.FormControl>
                    <select_1.SelectContent>
                       {DIFFICULTY_OPTIONS.map(opt => (<select_1.SelectItem key={opt.value} value={opt.value}>{opt.label}</select_1.SelectItem>))}
                    </select_1.SelectContent>
                  </select_1.Select>
                  <form_1.FormMessage />
                </form_1.FormItem>)}/>
        </div>)}

      
      <form_1.FormField control={control} name={`questions.${qIndex}.content`} render={({ field }) => (<form_1.FormItem>
            <form_1.FormControl><rich_text_editor_1.RichTextEditor value={field.value} onChange={field.onChange} disabled={isBusy}/></form_1.FormControl>
            <form_1.FormMessage />
          </form_1.FormItem>)}/>

      <form_1.FormField control={control} name={`questions.${qIndex}.attachedMedia`} render={({ field }) => (<form_1.FormItem className="mt-2">
            <form_1.FormControl><QuestionMediaUploader_1.QuestionMediaUploader value={field.value} onChange={field.onChange} disabled={isBusy}/></form_1.FormControl>
            <form_1.FormMessage />
          </form_1.FormItem>)}/>

      {isPassage ? (<SubQuestionsBlock parentIndex={qIndex} disabled={isBusy} mode={mode}/>) : (<div className="mt-4 border-t pt-4">
           <AnswerOptionsBlock path={`questions.${qIndex}.answers`} disabled={isBusy}/>
        </div>)}
    </div>);
});
QuestionBlock.displayName = 'QuestionBlock';
function BulkManualQuestionForm({ mode = 'QUESTION_BANK', onSave, isPending, onCancel }) {
    const { user } = (0, useSession_1.useSession)();
    const subjectId = user?.subjects?.[0]?.id;
    const { data: topics = [], isLoading: isTopicsLoading } = (0, useTopics_1.useTopicsTree)(mode === 'QUESTION_BANK' ? subjectId : undefined);
    const methods = (0, react_hook_form_1.useForm)({
        resolver: (0, rhf_zod_resolver_1.rhfZodResolver)(FormSchema),
        defaultValues: {
            questions: [createQuestionItem('MULTIPLE_CHOICE')],
        },
    });
    const { control, handleSubmit, setValue, getValues, formState: { isSubmitting } } = methods;
    const { fields, append, remove } = (0, react_hook_form_1.useFieldArray)({ control, name: 'questions' });
    const isBusy = isPending || isSubmitting;
    const processSubmit = (0, react_1.useCallback)((submitMode) => {
        const currentValues = getValues('questions');
        currentValues.forEach((_, idx) => {
            setValue(`questions.${idx}.isDraft`, submitMode === 'DRAFT', { shouldValidate: false });
        });
        handleSubmit((data) => {
            onSave(data.questions);
        })();
    }, [getValues, setValue, handleSubmit, onSave]);
    return (<div className={(0, utils_1.cn)("bg-white border-2 shadow-xl rounded-2xl overflow-hidden", mode === 'QUICK_EXAM' ? 'border-indigo-200' : 'border-blue-200')}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-slate-50 border-b gap-4">
        <div>
          <h3 className="text-lg font-black text-slate-800">
            {mode === 'QUICK_EXAM' ? 'Soạn Nhanh Câu Hỏi' : 'Soạn Đề Đa Hình (Polymorphic)'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {mode === 'QUICK_EXAM' ? 'Thêm câu hỏi trực tiếp vào vỏ đề. (Có thể phân loại sau)' : 'Hỗ trợ soạn câu hỏi đơn hoặc khối bài đọc lồng nhau.'}
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button_1.Button type="button" variant="outline" disabled={isBusy} onClick={() => append(createQuestionItem('MULTIPLE_CHOICE'))} className="flex-1 md:flex-none font-bold text-blue-600 border-blue-200 hover:bg-blue-50">
            <lucide_react_1.Plus className="w-4 h-4 mr-2"/> Câu Đơn
          </button_1.Button>
          <button_1.Button type="button" variant="outline" disabled={isBusy} onClick={() => append(createQuestionItem('PASSAGE'))} className="flex-1 md:flex-none font-bold text-purple-600 border-purple-200 hover:bg-purple-50">
            <lucide_react_1.FileText className="w-4 h-4 mr-2"/> Khối Bài Đọc
          </button_1.Button>
        </div>
      </div>

      <react_hook_form_1.FormProvider {...methods}>
        <form className="space-y-8 p-6">
          
          {fields.map((qField, qIndex) => (<QuestionBlock key={qField.id} qIndex={qIndex} qType={qField.type} isBusy={isBusy} mode={mode} topics={topics} isTopicsLoading={isTopicsLoading} remove={remove} canRemove={fields.length > 1}/>))}

          <div className="flex justify-end gap-3 pt-6 border-t sticky bottom-0 bg-white/90 backdrop-blur-sm p-4 -mx-6 -mb-6 shadow-[0_-15px_30px_-15px_rgba(0,0,0,0.1)] z-20">
            <button_1.Button type="button" variant="ghost" onClick={onCancel} disabled={isBusy} className="font-semibold">
              Hủy bỏ
            </button_1.Button>
            
            
            {mode === 'QUICK_EXAM' ? (<button_1.Button type="button" disabled={isBusy} onClick={() => processSubmit('DRAFT')} className="bg-indigo-600 text-white hover:bg-indigo-700 font-bold px-8 shadow-xl">
                {isBusy ? <lucide_react_1.Loader2 className="w-5 h-5 mr-2 animate-spin"/> : <lucide_react_1.Check className="w-5 h-5 mr-2"/>}
                Lưu vào Đề Thi
              </button_1.Button>) : (<>
                <button_1.Button type="button" variant="outline" disabled={isBusy} onClick={() => processSubmit('DRAFT')} className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200 font-bold shadow-sm">
                  {isBusy ? <lucide_react_1.Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <lucide_react_1.Save className="w-4 h-4 mr-2"/>}
                  Lưu Thành Nháp
                </button_1.Button>

                <button_1.Button type="button" disabled={isBusy} onClick={() => processSubmit('PUBLISH')} className="bg-slate-900 text-white hover:bg-slate-800 font-bold px-8 shadow-xl">
                  {isBusy ? <lucide_react_1.Loader2 className="w-5 h-5 mr-2 animate-spin"/> : <lucide_react_1.Send className="w-5 h-5 mr-2"/>}
                  Lưu & Xuất Bản ({fields.length} Khối)
                </button_1.Button>
              </>)}
          </div>
        </form>
      </react_hook_form_1.FormProvider>
    </div>);
}
//# sourceMappingURL=BulkManualQuestionForm.js.map