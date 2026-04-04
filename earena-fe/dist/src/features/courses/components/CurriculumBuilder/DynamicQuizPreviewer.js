'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamicQuizPreviewer = DynamicQuizPreviewer;
const react_1 = __importDefault(require("react"));
const lucide_react_1 = require("lucide-react");
const react_hook_form_1 = require("react-hook-form");
const useDebounce_1 = require("@/shared/hooks/useDebounce");
const useDynamicPreview_1 = require("../../hooks/useDynamicPreview");
const skeleton_1 = require("@/shared/components/ui/skeleton");
const utils_1 = require("@/shared/lib/utils");
function DynamicQuizPreviewer() {
    const { control } = (0, react_hook_form_1.useFormContext)();
    const adHocSections = (0, react_hook_form_1.useWatch)({ control, name: 'dynamicConfig.adHocSections' }) || [];
    const totalRequired = adHocSections.reduce((acc, section) => {
        const sectionTotal = (section.rules || []).reduce((sum, r) => sum + (Number(r.limit) || 0), 0);
        return acc + sectionTotal;
    }, 0);
    const rawPayload = { adHocSections };
    const debouncedPayload = (0, useDebounce_1.useDebounce)(rawPayload, 800);
    const { data: rawPreviewResponse, isFetching, isError, error } = (0, useDynamicPreview_1.useDynamicPreview)(totalRequired > 0 ? debouncedPayload : null);
    const actualPreviewData = rawPreviewResponse?.data || rawPreviewResponse;
    const actualQuestions = actualPreviewData?.totalActualQuestions || 0;
    const questionsList = actualPreviewData?.previewData?.questions || [];
    const isHealthy = actualQuestions >= totalRequired;
    if (totalRequired === 0) {
        return (<div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-slate-400">
                <lucide_react_1.LayoutTemplate className="w-12 h-12 mb-3 opacity-50"/>
                <p className="font-medium text-sm">Vui lòng thiết lập luật bốc đề để xem trước kết quả.</p>
            </div>);
    }
    return (<div className="bg-card border shadow-sm rounded-xl overflow-hidden flex flex-col h-full animate-in fade-in duration-300">
            
            <div className={(0, utils_1.cn)("p-4 border-b flex items-center justify-between transition-colors", isError ? "bg-destructive/10 border-destructive/20" : isHealthy ? "bg-green-50 dark:bg-green-950/20 border-green-200" : "bg-amber-50 dark:bg-amber-950/20 border-amber-200")}>
                <div className="flex items-center gap-3">
                    <div className={(0, utils_1.cn)("p-2 rounded-full", isError ? "bg-destructive/20 text-destructive" : isHealthy ? "bg-green-200 text-green-700" : "bg-amber-200 text-amber-700")}>
                        <lucide_react_1.BrainCircuit className="w-5 h-5"/>
                    </div>
                    <div>
                        <h4 className="font-bold text-sm text-foreground">Sức khỏe Ngân hàng</h4>
                        
                        <div className="text-xs font-medium text-muted-foreground flex items-center gap-1 mt-0.5">
                            Yêu cầu: <span className="text-foreground font-bold">{totalRequired}</span> | 
                            Khả dụng: 
                            {isFetching ? <skeleton_1.Skeleton className="w-8 h-3 inline-block ml-1"/> : (<span className={(0, utils_1.cn)("font-bold ml-1", isHealthy ? "text-green-600" : "text-amber-600")}>{actualQuestions}</span>)}
                        </div>
                    </div>
                </div>

                {isError ? (<div className="text-xs font-bold text-destructive flex items-center bg-destructive/10 px-2.5 py-1 rounded-md">
                        <lucide_react_1.AlertCircle className="w-4 h-4 mr-1.5"/> Lỗi cấu hình
                    </div>) : isHealthy ? (<div className="text-xs font-bold text-green-700 flex items-center bg-green-100 px-2.5 py-1 rounded-md">
                        <lucide_react_1.CheckCircle2 className="w-4 h-4 mr-1.5"/> Đủ dữ liệu
                    </div>) : (<div className="text-xs font-bold text-amber-700 flex items-center bg-amber-100 px-2.5 py-1 rounded-md">
                        <lucide_react_1.AlertCircle className="w-4 h-4 mr-1.5"/> Thiếu câu hỏi
                    </div>)}
            </div>

            
            {isError && (<div className="p-4 bg-destructive/5 text-destructive text-sm font-medium">
                    {error?.response?.data?.message || "Kho câu hỏi không đủ đáp ứng tiêu chí. Vui lòng nới lỏng điều kiện."}
                </div>)}

            
            <div className="p-4 flex-1 overflow-y-auto bg-slate-50/50 space-y-4">
                <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Bản nháp sinh thử (#001)</h5>
                
                {isFetching ? (Array.from({ length: 2 }).map((_, i) => (<skeleton_1.Skeleton key={i} className="w-full h-32 rounded-xl"/>))) : questionsList.length > 0 ? (questionsList.slice(0, 3).map((q, idx) => (<div key={idx} className="bg-background p-4 rounded-xl border border-border shadow-sm text-sm">
                            <span className="font-bold text-primary mr-2">Câu {idx + 1}:</span>
                            <span className="font-medium text-foreground">{q.content}</span>
                            <div className="mt-3 grid grid-cols-2 gap-2">
                                {q.answers?.map((ans) => (<div key={ans.id} className="p-2 bg-muted/30 rounded-lg border border-border text-xs text-muted-foreground truncate">
                                        <span className="font-bold mr-1">{ans.id}.</span> {ans.content}
                                    </div>))}
                            </div>
                        </div>))) : null}
                
                {!isFetching && actualQuestions > 3 && (<div className="text-center text-xs font-bold text-muted-foreground bg-muted/20 py-2 rounded-lg border border-border border-dashed">
                        + {actualQuestions - 3} câu hỏi khác...
                    </div>)}
            </div>
        </div>);
}
//# sourceMappingURL=DynamicQuizPreviewer.js.map