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
exports.ManualQuestionForm = ManualQuestionForm;
const react_hook_form_1 = require("react-hook-form");
const rhf_zod_resolver_1 = require("@/shared/lib/rhf-zod-resolver");
const z = __importStar(require("zod"));
const button_1 = require("@/shared/components/ui/button");
const textarea_1 = require("@/shared/components/ui/textarea");
const input_1 = require("@/shared/components/ui/input");
const form_1 = require("@/shared/components/ui/form");
const lucide_react_1 = require("lucide-react");
const ManualQuestionSchema = z.object({
    content: z.string().min(5, 'Nội dung câu hỏi quá ngắn'),
    answers: z.array(z.object({
        id: z.string(),
        content: z.string().min(1, 'Đáp án không được trống'),
    })).length(4),
    correctAnswerId: z.string().min(1, 'Bắt buộc chọn 1 đáp án đúng'),
});
function ManualQuestionForm({ onSave, isPending, onCancel }) {
    const form = (0, react_hook_form_1.useForm)({
        resolver: (0, rhf_zod_resolver_1.rhfZodResolver)(ManualQuestionSchema),
        defaultValues: {
            content: '',
            answers: [
                { id: 'A', content: '' }, { id: 'B', content: '' },
                { id: 'C', content: '' }, { id: 'D', content: '' },
            ],
            correctAnswerId: '',
        },
    });
    const { fields } = (0, react_hook_form_1.useFieldArray)({ control: form.control, name: 'answers' });
    return (<div className="bg-white border-2 border-blue-200 shadow-md rounded-2xl p-6 relative">
      <div className="mb-4 pb-4 border-b">
        <h3 className="text-lg font-bold text-slate-800">Tạo câu hỏi thủ công</h3>
      </div>

      <form_1.Form {...form}>
        <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
          <form_1.FormField control={form.control} name="content" render={({ field }) => (<form_1.FormItem>
                <form_1.FormControl>
                  <textarea_1.Textarea placeholder="Nội dung câu hỏi..." className="min-h-[100px]" disabled={isPending} {...field}/>
                </form_1.FormControl>
                <form_1.FormMessage />
              </form_1.FormItem>)}/>

          <div className="space-y-3">
            {fields.map((field, index) => {
            const letter = ['A', 'B', 'C', 'D'][index];
            const isCorrect = form.watch('correctAnswerId') === letter;
            return (<div key={field.id} className="flex items-start gap-3">
                  <button type="button" disabled={isPending} onClick={() => form.setValue('correctAnswerId', letter, { shouldValidate: true })} className={`mt-1 flex-shrink-0 ${isCorrect ? 'text-green-500' : 'text-slate-300'}`}>
                    {isCorrect ? <lucide_react_1.CheckCircle2 className="w-8 h-8"/> : <lucide_react_1.Circle className="w-8 h-8"/>}
                  </button>
                  <div className="flex-1">
                    <form_1.FormField control={form.control} name={`answers.${index}.content`} render={({ field: inputField }) => (<form_1.FormItem>
                          <form_1.FormControl>
                            
                            <input_1.Input placeholder={`Phương án ${letter}...`} disabled={isPending} {...inputField}/>
                          </form_1.FormControl>
                          <form_1.FormMessage />
                        </form_1.FormItem>)}/>
                  </div>
                </div>);
        })}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button_1.Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>Hủy</button_1.Button>
            <button_1.Button type="submit" className="bg-blue-600 font-bold hover:bg-blue-700" disabled={isPending}>
              {isPending && <lucide_react_1.Loader2 className="w-4 h-4 mr-2 animate-spin"/>}
              Lưu & Thêm vào đề
            </button_1.Button>
          </div>
        </form>
      </form_1.Form>
    </div>);
}
//# sourceMappingURL=ManualQuestionForm.js.map