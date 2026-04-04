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
exports.MatrixBuilderDrawer = MatrixBuilderDrawer;
const react_1 = __importStar(require("react"));
const react_hook_form_1 = require("react-hook-form");
const rhf_zod_resolver_1 = require("@/shared/lib/rhf-zod-resolver");
const lucide_react_1 = require("lucide-react");
const sonner_1 = require("sonner");
const sheet_1 = require("@/shared/components/ui/sheet");
const form_1 = require("@/shared/components/ui/form");
const tabs_1 = require("@/shared/components/ui/tabs");
const button_1 = require("@/shared/components/ui/button");
const select_1 = require("@/shared/components/ui/select");
const exam_schema_1 = require("../types/exam.schema");
const useFillFromMatrix_1 = require("../hooks/useFillFromMatrix");
const useExamMatrices_1 = require("../hooks/useExamMatrices");
const useFolders_1 = require("../hooks/useFolders");
const useTopics_1 = require("../hooks/useTopics");
const MatrixAdHocBuilder_1 = require("./MatrixAdHocBuilder");
function MatrixBuilderDrawer({ isOpen, onClose, paperId, subjectId }) {
    const { mutate: fillMatrix, isPending: isSubmitting } = (0, useFillFromMatrix_1.useFillFromMatrix)(paperId);
    const form = (0, react_hook_form_1.useForm)({
        resolver: (0, rhf_zod_resolver_1.rhfZodResolver)(exam_schema_1.FillFromMatrixFormSchema),
        defaultValues: {
            mode: 'ADHOC',
            adHocSections: [
                { name: 'Phần 1', orderIndex: 0, rules: [{ limit: 10, folderIds: [], topicIds: [], difficulties: [], tags: [] }] }
            ],
        },
    });
    const { errors } = form.formState;
    const hasErrors = Object.keys(errors).length > 0;
    const currentMode = form.watch('mode');
    const { data: matricesData, isLoading: isLoadingMatrices } = (0, useExamMatrices_1.useExamMatrices)(subjectId);
    const { data: folders = [] } = (0, useFolders_1.useFoldersList)();
    const { data: topics = [] } = (0, useTopics_1.useTopicsTree)(subjectId);
    (0, react_1.useEffect)(() => {
        form.clearErrors();
    }, [currentMode, form]);
    const onSubmit = (values) => {
        let payload;
        if (values.mode === 'TEMPLATE') {
            payload = { matrixId: values.matrixId };
        }
        else {
            payload = { adHocSections: values.adHocSections };
        }
        fillMatrix(payload, {
            onSuccess: () => {
                onClose();
            },
            onError: (error) => {
                sonner_1.toast.error('Sinh đề thất bại', {
                    description: error.message || 'Ngân hàng không đủ dữ liệu.'
                });
            }
        });
    };
    return (<sheet_1.Sheet open={isOpen} onOpenChange={(open) => !isSubmitting && !open && onClose()}>
            <sheet_1.SheetContent side="right" className="w-full sm:max-w-4xl p-0 flex flex-col bg-slate-50 sm:max-w-[80vw]">

                
                {isSubmitting && (<div className="absolute inset-0 z-50 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center">
                        <lucide_react_1.Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4"/>
                        <h3 className="text-xl font-bold text-slate-800">Hệ thống đang bốc câu hỏi...</h3>
                        <p className="text-slate-500 font-medium">Vui lòng không tắt trình duyệt (Khoảng 2-5 giây)</p>
                    </div>)}

                <sheet_1.SheetHeader className="px-6 py-4 bg-white border-b shrink-0 shadow-sm">
                    <sheet_1.SheetTitle className="text-xl flex items-center"><lucide_react_1.Zap className="w-5 h-5 text-amber-500 mr-2"/> Đắp câu hỏi từ Ma trận</sheet_1.SheetTitle>
                    <sheet_1.SheetDescription>
                        Hệ thống sẽ tự động bốc câu hỏi và nhồi nối tiếp vào cuối đề thi hiện tại.
                    </sheet_1.SheetDescription>
                </sheet_1.SheetHeader>

                <form_1.Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 overflow-hidden flex flex-col">

                        <div className="flex-1 overflow-y-auto p-6">
                            <tabs_1.Tabs value={currentMode} onValueChange={(val) => form.setValue('mode', val)} className="w-full">
                                <tabs_1.TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
                                    <tabs_1.TabsTrigger value="TEMPLATE" disabled={isSubmitting} className="font-bold"><lucide_react_1.LibrarySquare className="w-4 h-4 mr-2"/> Khuôn mẫu lưu sẵn</tabs_1.TabsTrigger>
                                    <tabs_1.TabsTrigger value="ADHOC" disabled={isSubmitting} className="font-bold"><lucide_react_1.Settings2 className="w-4 h-4 mr-2"/> Tự cấu hình nhanh</tabs_1.TabsTrigger>
                                </tabs_1.TabsList>

                                <tabs_1.TabsContent value="TEMPLATE" className="mt-0 space-y-4">
                                    <div className="bg-white p-6 border rounded-xl shadow-sm">
                                        <form_1.FormField control={form.control} name="matrixId" render={({ field }) => (<form_1.FormItem>
                                                    <form_1.FormLabel className="font-bold">Chọn Khuôn mẫu Ma trận</form_1.FormLabel>
                                                    <select_1.Select onValueChange={field.onChange} value={field.value || ''} disabled={isSubmitting || isLoadingMatrices}>
                                                        <form_1.FormControl>
                                                            <select_1.SelectTrigger className="h-12">
                                                                <select_1.SelectValue placeholder={isLoadingMatrices ? "Đang tải khuôn mẫu..." : "--- Vui lòng chọn ---"}/>
                                                            </select_1.SelectTrigger>
                                                        </form_1.FormControl>
                                                        <select_1.SelectContent>
                                                            {matricesData?.items?.map((matrix) => (<select_1.SelectItem key={matrix._id} value={matrix._id}>{matrix.title}</select_1.SelectItem>))}
                                                            {matricesData?.items?.length === 0 && <select_1.SelectItem value="empty" disabled>Bạn chưa lưu khuôn mẫu nào</select_1.SelectItem>}
                                                        </select_1.SelectContent>
                                                    </select_1.Select>
                                                    <form_1.FormMessage />
                                                </form_1.FormItem>)}/>
                                    </div>
                                </tabs_1.TabsContent>

                                <tabs_1.TabsContent value="ADHOC" className="mt-0">
                                    
                                    <MatrixAdHocBuilder_1.MatrixAdHocBuilder paperId={paperId} folders={folders} topics={topics} disabled={isSubmitting}/>
                                </tabs_1.TabsContent>
                            </tabs_1.Tabs>
                        </div>

                        <div className="bg-white border-t px-6 py-4 flex justify-end gap-3 shrink-0 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
                            <button_1.Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>Hủy bỏ</button_1.Button>
                            
                            <button_1.Button type="submit" className="bg-blue-600 hover:bg-blue-700 shadow-md font-bold px-8" disabled={isSubmitting || hasErrors}>
                                <lucide_react_1.Zap className="w-4 h-4 mr-2"/> Thực thi đắp câu hỏi
                            </button_1.Button>
                        </div>

                    </form>
                </form_1.Form>
            </sheet_1.SheetContent>
        </sheet_1.Sheet>);
}
//# sourceMappingURL=MatrixBuilderDrawer.js.map