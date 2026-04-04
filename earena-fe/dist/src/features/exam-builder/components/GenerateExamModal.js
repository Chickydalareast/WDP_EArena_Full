'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateExamModal = GenerateExamModal;
const react_1 = __importDefault(require("react"));
const react_hook_form_1 = require("react-hook-form");
const rhf_zod_resolver_1 = require("@/shared/lib/rhf-zod-resolver");
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/shared/components/ui/button");
const form_1 = require("@/shared/components/ui/form");
const input_1 = require("@/shared/components/ui/input");
const select_1 = require("@/shared/components/ui/select");
const exam_schema_1 = require("../types/exam.schema");
const useSession_1 = require("@/features/auth/hooks/useSession");
const useFolders_1 = require("../hooks/useFolders");
const useTopics_1 = require("../hooks/useTopics");
const useGenerateExam_1 = require("../hooks/useGenerateExam");
function GenerateExamModal({ onClose }) {
    const { user } = (0, useSession_1.useSession)();
    const { data: folders = [] } = (0, useFolders_1.useFoldersList)();
    const { mutate: generateExam, isPending } = (0, useGenerateExam_1.useGenerateExam)();
    const subjectIds = user?.subjects?.map((s) => s.id) ?? [];
    const form = (0, react_hook_form_1.useForm)({
        resolver: (0, rhf_zod_resolver_1.rhfZodResolver)(exam_schema_1.GenerateExamFormSchema),
        defaultValues: {
            title: '',
            duration: 90,
            totalScore: 10,
            subjectId: subjectIds[0] || '',
            criteria: [
                { folderIds: [], topicId: '', difficulty: 'NB', limit: 1 },
            ],
        },
    });
    const selectedSubjectId = (0, react_hook_form_1.useWatch)({ control: form.control, name: 'subjectId' });
    const { data: topics = [], isLoading: isTopicsLoading } = (0, useTopics_1.useTopicsTree)(selectedSubjectId);
    const { fields, append, remove } = (0, react_hook_form_1.useFieldArray)({
        control: form.control,
        name: 'criteria',
    });
    const onSubmit = (values) => {
        const { subjectId, ...dtoPayload } = values;
        generateExam(dtoPayload, {
            onSuccess: () => onClose(),
        });
    };
    if (!subjectIds.length) {
        return (<div className="p-6 text-center text-red-500">
                Bạn chưa được gán bộ môn nào. Vui lòng liên hệ Admin.
            </div>);
    }
    return (<form_1.Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-h-[80vh] overflow-y-auto p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <form_1.FormField control={form.control} name="title" render={({ field }) => (<form_1.FormItem className="col-span-2">
                                <form_1.FormLabel>Tên Đề Thi</form_1.FormLabel>
                                <form_1.FormControl><input_1.Input placeholder="VD: Khảo sát Toán 12..." {...field}/></form_1.FormControl>
                                <form_1.FormMessage />
                            </form_1.FormItem>)}/>
                    <form_1.FormField control={form.control} name="duration" render={({ field }) => (<form_1.FormItem>
                                <form_1.FormLabel>Thời gian làm bài (Phút)</form_1.FormLabel>
                                <form_1.FormControl><input_1.Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))}/></form_1.FormControl>
                                <form_1.FormMessage />
                            </form_1.FormItem>)}/>
                    <form_1.FormField control={form.control} name="totalScore" render={({ field }) => (<form_1.FormItem>
                                <form_1.FormLabel>Tổng điểm</form_1.FormLabel>
                                <form_1.FormControl><input_1.Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))}/></form_1.FormControl>
                                <form_1.FormMessage />
                            </form_1.FormItem>)}/>
                </div>

                
                <form_1.FormField control={form.control} name="subjectId" render={({ field }) => (<form_1.FormItem>
                            <form_1.FormLabel>Môn học (Dùng để lọc chuyên đề)</form_1.FormLabel>
                            <select_1.Select onValueChange={field.onChange} defaultValue={field.value}>
                                <form_1.FormControl>
                                    <select_1.SelectTrigger><select_1.SelectValue placeholder="Chọn môn học"/></select_1.SelectTrigger>
                                </form_1.FormControl>
                                <select_1.SelectContent>
                                    {user?.subjects?.map((s) => (<select_1.SelectItem key={s.id} value={s.id}>
                                            {s.name || s.id}
                                        </select_1.SelectItem>))}
                                </select_1.SelectContent>
                            </select_1.Select>
                            <form_1.FormMessage />
                        </form_1.FormItem>)}/>

                
                <div className="space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                        <h3 className="font-bold text-lg text-slate-800">Cấu hình Ma trận sinh đề</h3>
                        <button_1.Button type="button" variant="outline" size="sm" onClick={() => append({ folderIds: [], topicId: '', difficulty: 'NB', limit: 1 })}>
                            <lucide_react_1.Plus className="w-4 h-4 mr-2"/> Thêm tiêu chí
                        </button_1.Button>
                    </div>

                    {fields.map((fieldItem, index) => (<div key={fieldItem.id} className="grid grid-cols-12 gap-3 items-start border p-4 rounded-xl bg-slate-50 relative">

                            
                            <div className="col-span-3">
                                <form_1.FormField control={form.control} name={`criteria.${index}.folderIds`} render={({ field }) => (<form_1.FormItem>
                                            <form_1.FormLabel className="text-xs">Thư mục nguồn</form_1.FormLabel>
                                            
                                            <form_1.FormControl>
                                                <select multiple className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" value={field.value} onChange={(e) => field.onChange(Array.from(e.target.selectedOptions, option => option.value))}>
                                                    {folders.map(f => (<option key={f.id} value={f.id}>{f.name}</option>))}
                                                </select>
                                            </form_1.FormControl>
                                            <form_1.FormMessage />
                                        </form_1.FormItem>)}/>
                            </div>

                            
                            <div className="col-span-4">
                                <form_1.FormField control={form.control} name={`criteria.${index}.topicId`} render={({ field }) => (<form_1.FormItem>
                                            <form_1.FormLabel className="text-xs">Chuyên đề {isTopicsLoading && <lucide_react_1.Loader2 className="inline w-3 h-3 animate-spin ml-1"/>}</form_1.FormLabel>
                                            <select_1.Select onValueChange={field.onChange} value={field.value}>
                                                <form_1.FormControl><select_1.SelectTrigger><select_1.SelectValue placeholder="Chọn chuyên đề"/></select_1.SelectTrigger></form_1.FormControl>
                                                <select_1.SelectContent>
                                                    {topics.map(t => (<select_1.SelectItem key={t.id} value={t.id}>{t.name}</select_1.SelectItem>))}
                                                </select_1.SelectContent>
                                            </select_1.Select>
                                            <form_1.FormMessage />
                                        </form_1.FormItem>)}/>
                            </div>

                            
                            <div className="col-span-2">
                                <form_1.FormField control={form.control} name={`criteria.${index}.difficulty`} render={({ field }) => (<form_1.FormItem>
                                            <form_1.FormLabel className="text-xs">Độ khó</form_1.FormLabel>
                                            <select_1.Select onValueChange={field.onChange} value={field.value}>
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

                            
                            <div className="col-span-2">
                                <form_1.FormField control={form.control} name={`criteria.${index}.limit`} render={({ field }) => (<form_1.FormItem>
                                            <form_1.FormLabel className="text-xs">SL Câu</form_1.FormLabel>
                                            <form_1.FormControl><input_1.Input type="number" min="1" {...field} onChange={e => field.onChange(Number(e.target.value))}/></form_1.FormControl>
                                            <form_1.FormMessage />
                                        </form_1.FormItem>)}/>
                            </div>

                            
                            <div className="col-span-1 flex flex-col justify-end h-full pb-2">
                                <button_1.Button type="button" variant="destructive" size="icon" disabled={fields.length === 1} onClick={() => remove(index)}>
                                    <lucide_react_1.Trash2 className="w-4 h-4"/>
                                </button_1.Button>
                            </div>

                        </div>))}
                </div>

                
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <button_1.Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>Hủy</button_1.Button>
                    <button_1.Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isPending}>
                        {isPending ? <lucide_react_1.Loader2 className="w-4 h-4 mr-2 animate-spin"/> : null}
                        Tạo Đề Tự Động
                    </button_1.Button>
                </div>
            </form>
        </form_1.Form>);
}
//# sourceMappingURL=GenerateExamModal.js.map