'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateExamForm = GenerateExamForm;
const react_1 = __importDefault(require("react"));
const react_hook_form_1 = require("react-hook-form");
const rhf_zod_resolver_1 = require("@/shared/lib/rhf-zod-resolver");
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/shared/components/ui/button");
const form_1 = require("@/shared/components/ui/form");
const input_1 = require("@/shared/components/ui/input");
const select_1 = require("@/shared/components/ui/select");
const checkbox_1 = require("@/shared/components/ui/checkbox");
const exam_schema_1 = require("../types/exam.schema");
const useSession_1 = require("@/features/auth/hooks/useSession");
const useFolders_1 = require("../hooks/useFolders");
const useTopics_1 = require("../hooks/useTopics");
const useGenerateExam_1 = require("../hooks/useGenerateExam");
function GenerateExamForm() {
    const { user } = (0, useSession_1.useSession)();
    const { data: folders = [] } = (0, useFolders_1.useFoldersList)();
    const { mutate: generateExam, isPending } = (0, useGenerateExam_1.useGenerateExam)();
    const form = (0, react_hook_form_1.useForm)({
        resolver: (0, rhf_zod_resolver_1.rhfZodResolver)(exam_schema_1.GenerateExamFormSchema),
        defaultValues: {
            title: '',
            duration: 90,
            totalScore: 10,
            subjectId: user?.subjects?.[0]?.id || '',
            criteria: [
                { folderIds: [], topicId: '', difficulty: 'NB', limit: 1 },
            ],
        },
        mode: 'onTouched',
    });
    const selectedSubjectId = (0, react_hook_form_1.useWatch)({ control: form.control, name: 'subjectId' });
    const { data: topics = [], isLoading: isTopicsLoading } = (0, useTopics_1.useTopicsTree)(selectedSubjectId);
    const { fields, append, remove } = (0, react_hook_form_1.useFieldArray)({
        control: form.control,
        name: 'criteria',
    });
    const onSubmit = (values) => {
        const { subjectId, ...dtoPayload } = values;
        generateExam(dtoPayload);
    };
    if (!user?.subjects?.length) {
        return (<div className="p-8 text-center text-red-600 bg-red-50 border border-red-100 rounded-xl shadow-sm max-w-xl mx-auto">
        <h3 className="font-bold text-lg mb-2">Chưa gán bộ môn</h3>
        <p>Tài khoản của bạn chưa được thiết lập bộ môn giảng dạy. Vui lòng liên hệ Admin để cập nhật thông tin trước khi dùng tính năng Ma Trận.</p>
      </div>);
    }
    return (<div className="max-w-4xl mx-auto p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
      <form_1.Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          
          <div className="p-5 bg-slate-50 border rounded-xl space-y-5">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm">1</span> 
              Thông tin Vỏ Đề
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              <form_1.FormField control={form.control} name="title" render={({ field }) => (<form_1.FormItem className="col-span-12 md:col-span-6">
                    <form_1.FormLabel>Tên Đề Thi</form_1.FormLabel>
                    <form_1.FormControl><input_1.Input placeholder="VD: Đề thi thử THPT Quốc Gia..." disabled={isPending} {...field}/></form_1.FormControl>
                    <form_1.FormMessage />
                  </form_1.FormItem>)}/>
              
              <form_1.FormField control={form.control} name="subjectId" render={({ field }) => (<form_1.FormItem className="col-span-12 md:col-span-6">
                    <form_1.FormLabel>Môn học (Cố định)</form_1.FormLabel>
                    
                    <select_1.Select onValueChange={field.onChange} value={field.value} disabled={true}>
                      <form_1.FormControl>
                        <select_1.SelectTrigger className="bg-slate-100 opacity-100 cursor-not-allowed text-slate-700 font-medium">
                          <select_1.SelectValue placeholder="Chọn môn học"/>
                        </select_1.SelectTrigger>
                      </form_1.FormControl>
                      <select_1.SelectContent>
                        {user.subjects?.map(subj => (<select_1.SelectItem key={subj.id} value={subj.id}>{subj.name}</select_1.SelectItem>))}
                      </select_1.SelectContent>
                    </select_1.Select>
                    <form_1.FormMessage />
                  </form_1.FormItem>)}/>

              <form_1.FormField control={form.control} name="duration" render={({ field }) => (<form_1.FormItem className="col-span-6">
                    <form_1.FormLabel>Thời gian (Phút)</form_1.FormLabel>
                    <form_1.FormControl><input_1.Input type="number" disabled={isPending} {...field} onChange={e => field.onChange(Number(e.target.value))}/></form_1.FormControl>
                    <form_1.FormMessage />
                  </form_1.FormItem>)}/>

              <form_1.FormField control={form.control} name="totalScore" render={({ field }) => (<form_1.FormItem className="col-span-6">
                    <form_1.FormLabel>Tổng điểm</form_1.FormLabel>
                    <form_1.FormControl><input_1.Input type="number" disabled={isPending} {...field} onChange={e => field.onChange(Number(e.target.value))}/></form_1.FormControl>
                    <form_1.FormMessage />
                  </form_1.FormItem>)}/>
            </div>
          </div>

          
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
               <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm">2</span> 
                Cấu trúc Ma Trận
              </h3>
              <button_1.Button type="button" variant="outline" size="sm" disabled={isPending} onClick={() => append({ folderIds: [], topicId: '', difficulty: 'NB', limit: 1 })}>
                <lucide_react_1.Plus className="w-4 h-4 mr-2"/> Thêm Tiêu Chí
              </button_1.Button>
            </div>

            {fields.map((fieldItem, index) => (<div key={fieldItem.id} className="grid grid-cols-12 gap-5 items-start border p-5 rounded-xl bg-white shadow-sm relative transition-all hover:border-blue-300 group">
                
                
                <div className="col-span-12 md:col-span-4">
                   <form_1.FormField control={form.control} name={`criteria.${index}.folderIds`} render={({ field }) => (<form_1.FormItem>
                        <form_1.FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Thư mục nguồn</form_1.FormLabel>
                        
                        <div className="border rounded-md p-3 h-[120px] overflow-y-auto space-y-3 bg-slate-50/50 custom-scrollbar">
                          {folders.length === 0 ? (<p className="text-xs text-slate-400 text-center mt-4">Không có thư mục nào</p>) : (folders.map(f => (<form_1.FormField key={f.id} control={form.control} name={`criteria.${index}.folderIds`} render={({ field: checkboxField }) => {
                        return (<form_1.FormItem key={f.id} className="flex flex-row items-start space-x-3 space-y-0">
                                      <form_1.FormControl>
                                        <checkbox_1.Checkbox disabled={isPending} checked={checkboxField.value?.includes(f.id)} onCheckedChange={(checked) => {
                                return checked
                                    ? checkboxField.onChange([...checkboxField.value, f.id])
                                    : checkboxField.onChange(checkboxField.value?.filter((value) => value !== f.id));
                            }}/>
                                      </form_1.FormControl>
                                      <form_1.FormLabel className="font-normal text-sm leading-none cursor-pointer">
                                        {f.name}
                                      </form_1.FormLabel>
                                    </form_1.FormItem>);
                    }}/>)))}
                        </div>
                        <form_1.FormMessage />
                      </form_1.FormItem>)}/>
                </div>

                <div className="col-span-12 md:col-span-8 grid grid-cols-12 gap-4">
                  
                  <div className="col-span-12 md:col-span-5">
                    <form_1.FormField control={form.control} name={`criteria.${index}.topicId`} render={({ field }) => (<form_1.FormItem>
                          <form_1.FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Chuyên đề {isTopicsLoading && <lucide_react_1.Loader2 className="inline w-3 h-3 animate-spin ml-1 text-blue-500"/>}
                          </form_1.FormLabel>
                          <select_1.Select onValueChange={field.onChange} value={field.value} disabled={isPending}>
                            <form_1.FormControl><select_1.SelectTrigger><select_1.SelectValue placeholder="Chọn chuyên đề"/></select_1.SelectTrigger></form_1.FormControl>
                            <select_1.SelectContent>
                              {topics.map(t => (<select_1.SelectItem key={t.id} value={t.id}>{t.name}</select_1.SelectItem>))}
                            </select_1.SelectContent>
                          </select_1.Select>
                          <form_1.FormMessage />
                        </form_1.FormItem>)}/>
                  </div>

                  
                  <div className="col-span-6 md:col-span-4">
                    <form_1.FormField control={form.control} name={`criteria.${index}.difficulty`} render={({ field }) => (<form_1.FormItem>
                          <form_1.FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mức độ</form_1.FormLabel>
                          <select_1.Select onValueChange={field.onChange} value={field.value} disabled={isPending}>
                            <form_1.FormControl><select_1.SelectTrigger><select_1.SelectValue /></select_1.SelectTrigger></form_1.FormControl>
                            <select_1.SelectContent>
                              <select_1.SelectItem value="NB">Nhận biết</select_1.SelectItem>
                              <select_1.SelectItem value="TH">Thông hiểu</select_1.SelectItem>
                              <select_1.SelectItem value="VD">Vận dụng</select_1.SelectItem>
                              <select_1.SelectItem value="VDC">Vận dụng cao</select_1.SelectItem>
                            </select_1.SelectContent>
                          </select_1.Select>
                          <form_1.FormMessage />
                        </form_1.FormItem>)}/>
                  </div>

                  
                  <div className="col-span-4 md:col-span-2">
                    <form_1.FormField control={form.control} name={`criteria.${index}.limit`} render={({ field }) => (<form_1.FormItem>
                          <form_1.FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Số câu</form_1.FormLabel>
                          <form_1.FormControl><input_1.Input type="number" min="1" disabled={isPending} {...field} onChange={e => field.onChange(Number(e.target.value))}/></form_1.FormControl>
                          <form_1.FormMessage />
                        </form_1.FormItem>)}/>
                  </div>

                  
                  <div className="col-span-2 md:col-span-1 flex flex-col justify-end h-full pb-1">
                    <button_1.Button type="button" variant="ghost" size="icon" className="text-slate-400 hover:text-red-600 hover:bg-red-50 w-full" disabled={isPending || fields.length === 1} onClick={() => remove(index)}>
                      <lucide_react_1.Trash2 className="w-5 h-5"/>
                    </button_1.Button>
                  </div>
                </div>

              </div>))}
          </div>

          <button_1.Button type="submit" size="lg" className="w-full font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg text-white mt-8" disabled={isPending}>
            {isPending ? <lucide_react_1.Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <lucide_react_1.Zap className="mr-2 h-5 w-5"/>}
            {isPending ? 'Đang kích hoạt Matrix Engine...' : 'Kích hoạt Matrix Engine & Gen Đề'}
          </button_1.Button>
        </form>
      </form_1.Form>
    </div>);
}
//# sourceMappingURL=GenerateExamForm.js.map