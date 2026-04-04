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
exports.InitExamForm = InitExamForm;
const react_1 = __importStar(require("react"));
const react_hook_form_1 = require("react-hook-form");
const rhf_zod_resolver_1 = require("@/shared/lib/rhf-zod-resolver");
const exam_schema_1 = require("../types/exam.schema");
const useInitExam_1 = require("../hooks/useInitExam");
const useSession_1 = require("@/features/auth/hooks/useSession");
const form_1 = require("@/shared/components/ui/form");
const input_1 = require("@/shared/components/ui/input");
const textarea_1 = require("@/shared/components/ui/textarea");
const button_1 = require("@/shared/components/ui/button");
const lucide_react_1 = require("lucide-react");
function InitExamForm() {
    const { user } = (0, useSession_1.useSession)();
    const { mutate: initExam, isPending } = (0, useInitExam_1.useInitExam)();
    const form = (0, react_hook_form_1.useForm)({
        resolver: (0, rhf_zod_resolver_1.rhfZodResolver)(exam_schema_1.InitExamSchema),
        defaultValues: {
            title: '',
            description: '',
            totalScore: 10,
            subjectId: '',
        },
        mode: 'onTouched',
    });
    (0, react_1.useEffect)(() => {
        if (user?.subjects && user.subjects.length > 0) {
            form.setValue('subjectId', user.subjects[0].id, { shouldValidate: true });
        }
    }, [user?.subjects, form]);
    const onSubmit = (data) => {
        initExam(data);
    };
    if (user && (!user.subjects || user.subjects.length === 0)) {
        return (<div className="max-w-xl mx-auto p-8 text-center text-amber-800 bg-amber-50 border border-amber-200 rounded-xl shadow-sm">
        <lucide_react_1.AlertTriangle className="w-12 h-12 mx-auto mb-4 text-amber-500"/>
        <h3 className="font-bold text-lg mb-2">Tài khoản chưa được gán bộ môn</h3>
        <p className="text-sm">Bạn cần được Admin cấp quyền giảng dạy một môn học cụ thể (Toán, Lý, Hóa...) trước khi có thể khởi tạo đề thi. Vui lòng liên hệ Quản trị viên.</p>
      </div>);
    }
    return (<div className="max-w-xl mx-auto p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
      <h2 className="text-2xl font-black text-slate-800 mb-6 border-b pb-4">
        Khởi tạo Vỏ Đề Thi
      </h2>

      <form_1.Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <form_1.FormField control={form.control} name="title" render={({ field }) => (<form_1.FormItem>
                <form_1.FormLabel>Tiêu đề đề thi (*)</form_1.FormLabel>
                <form_1.FormControl>
                  <input_1.Input disabled={isPending} placeholder="VD: Kiểm tra 15p Toán 12..." {...field}/>
                </form_1.FormControl>
                <form_1.FormMessage />
              </form_1.FormItem>)}/>

          <div className="grid grid-cols-2 gap-4">
            <form_1.FormField control={form.control} name="subjectId" render={({ field }) => {
            const selectedSubjectName = user?.subjects?.find(s => s.id === field.value)?.name || 'Đang tải môn học...';
            return (<form_1.FormItem>
                    <form_1.FormLabel>Môn học (Cố định)</form_1.FormLabel>
                    <form_1.FormControl>
                      <input_1.Input value={selectedSubjectName} disabled className="bg-slate-100 opacity-100 font-bold text-blue-700 border-slate-200 cursor-not-allowed"/>
                    </form_1.FormControl>
                    <form_1.FormMessage />
                  </form_1.FormItem>);
        }}/>

            <form_1.FormField control={form.control} name="totalScore" render={({ field }) => (<form_1.FormItem>
                  <form_1.FormLabel>Tổng điểm</form_1.FormLabel>
                  <form_1.FormControl>
                    <input_1.Input type="number" disabled={isPending} {...field} onChange={e => field.onChange(Number(e.target.value))}/>
                  </form_1.FormControl>
                  <form_1.FormMessage />
                </form_1.FormItem>)}/>
          </div>

          <form_1.FormField control={form.control} name="description" render={({ field }) => (<form_1.FormItem>
                <form_1.FormLabel>Mô tả thêm (Tùy chọn)</form_1.FormLabel>
                <form_1.FormControl>
                  <textarea_1.Textarea disabled={isPending} placeholder="Ghi chú nội bộ..." {...field}/>
                </form_1.FormControl>
                <form_1.FormMessage />
              </form_1.FormItem>)}/>

          <button_1.Button type="submit" className="w-full font-bold bg-blue-600 hover:bg-blue-700 text-white" disabled={isPending || !form.formState.isValid}>
            {isPending && <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
            {isPending ? 'Đang khởi tạo...' : 'Tạo Vỏ Đề Thi'}
          </button_1.Button>
        </form>
      </form_1.Form>
    </div>);
}
//# sourceMappingURL=InitExamForm.js.map