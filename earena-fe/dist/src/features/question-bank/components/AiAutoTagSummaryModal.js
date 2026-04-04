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
exports.AiAutoTagSummaryModal = void 0;
const react_1 = __importStar(require("react"));
const react_query_1 = require("@tanstack/react-query");
const dialog_1 = require("@/shared/components/ui/dialog");
const button_1 = require("@/shared/components/ui/button");
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/shared/lib/utils");
const question_bank_store_1 = require("../stores/question-bank.store");
const useSession_1 = require("@/features/auth/hooks/useSession");
const useBankQueries_1 = require("../hooks/useBankQueries");
const useTopics_1 = require("@/features/exam-builder/hooks/useTopics");
const stripHtml = (html) => {
    if (!html)
        return '';
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
};
const getDifficultyStyles = (level) => {
    switch (level) {
        case 'NB': return { text: 'Nhận biết', style: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
        case 'TH': return { text: 'Thông hiểu', style: 'bg-blue-100 text-blue-700 border-blue-200' };
        case 'VD': return { text: 'Vận dụng', style: 'bg-amber-100 text-amber-700 border-amber-200' };
        case 'VDC': return { text: 'Vận dụng cao', style: 'bg-rose-100 text-rose-700 border-rose-200' };
        default: return { text: 'Chưa phân loại', style: 'bg-slate-100 text-slate-500 border-slate-200' };
    }
};
exports.AiAutoTagSummaryModal = react_1.default.memo(({ originalQuestions }) => {
    const queryClient = (0, react_query_1.useQueryClient)();
    const isSummaryModalOpen = (0, question_bank_store_1.useQuestionBankStore)(state => state.isSummaryModalOpen);
    const aiProcessedQuestions = (0, question_bank_store_1.useQuestionBankStore)(state => state.aiProcessedQuestions);
    const clearAiProcessState = (0, question_bank_store_1.useQuestionBankStore)(state => state.clearAiProcessState);
    const { user } = (0, useSession_1.useSession)();
    const subjectId = user?.subjects?.[0]?.id;
    const { data: topics = [] } = (0, useTopics_1.useTopicsTree)(subjectId);
    const topicsMap = (0, react_1.useMemo)(() => {
        const map = {};
        topics.forEach(t => { map[t.id] = t.path; });
        return map;
    }, [topics]);
    const previewList = (0, react_1.useMemo)(() => {
        return aiProcessedQuestions.map(aiItem => {
            const originalQ = originalQuestions.find(q => (q._id === aiItem.id || q.originalQuestionId === aiItem.id));
            const rawText = stripHtml(originalQ?.content || 'Nội dung không khả dụng...');
            const previewText = rawText.length > 120 ? rawText.substring(0, 120) + '...' : rawText;
            return {
                ...aiItem,
                previewText,
                isPassage: originalQ?.type === 'PASSAGE'
            };
        });
    }, [aiProcessedQuestions, originalQuestions]);
    const handleCloseAndSync = (isOpen) => {
        if (!isOpen) {
            clearAiProcessState();
            queryClient.invalidateQueries({ queryKey: useBankQueries_1.BANK_QUESTIONS_KEY });
        }
    };
    return (<dialog_1.Dialog open={isSummaryModalOpen} onOpenChange={handleCloseAndSync}>
            <dialog_1.DialogContent className="sm:max-w-2xl bg-white p-0 overflow-hidden shadow-2xl rounded-2xl">
                
                
                <div className="bg-gradient-to-br from-purple-600 to-indigo-700 px-6 py-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none"></div>
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30 shadow-inner">
                        <lucide_react_1.Sparkles className="w-8 h-8 text-white animate-pulse"/>
                    </div>
                    <dialog_1.DialogTitle className="text-2xl font-black text-white">
                        Phân loại hoàn tất!
                    </dialog_1.DialogTitle>
                    <dialog_1.DialogDescription className="text-purple-100 mt-2 text-base">
                        AI đã đọc hiểu và gán thuộc tính thành công cho <strong>{aiProcessedQuestions.length}</strong> câu hỏi.
                    </dialog_1.DialogDescription>
                </div>

                
                <div className="max-h-[50vh] overflow-y-auto p-6 bg-slate-50/50 space-y-4 scrollbar-thin scrollbar-thumb-slate-200">
                    {previewList.map((item, index) => {
            const diffData = getDifficultyStyles(item.difficultyLevel);
            return (<div key={item.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-purple-300 transition-colors relative">
                                <div className="absolute -left-2 top-4 w-6 h-6 bg-slate-800 text-white rounded-full flex items-center justify-center font-bold text-[10px] shadow-sm">
                                    {index + 1}
                                </div>
                                
                                <div className="pl-4">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        {item.isPassage ? (<span className="text-[10px] font-black uppercase text-purple-700 bg-purple-100 px-2 py-0.5 rounded flex items-center gap-1 border border-purple-200">
                                                <lucide_react_1.Layers className="w-3 h-3"/> Bài đọc
                                            </span>) : (<span className="text-[10px] font-black uppercase text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                                Câu đơn
                                            </span>)}

                                        {item.difficultyLevel !== 'UNKNOWN' && (<span className={(0, utils_1.cn)("text-[11px] font-bold px-2 py-0.5 rounded border", diffData.style)}>
                                                {diffData.text}
                                            </span>)}
                                        
                                        {item.topicId && topicsMap[item.topicId] && (<span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 truncate max-w-[200px]" title={topicsMap[item.topicId]}>
                                                {topicsMap[item.topicId]}
                                            </span>)}
                                    </div>

                                    <p className="text-sm text-slate-600 font-medium italic line-clamp-2 leading-relaxed">
                                        "{item.previewText}"
                                    </p>

                                    {item.tags && item.tags.length > 0 && (<div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500 mt-3 pt-3 border-t border-slate-100 border-dashed">
                                            <lucide_react_1.Tag className="w-3 h-3 text-slate-400"/>
                                            {item.tags.map((tag) => (<span key={tag} className="bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
                                                    #{tag}
                                                </span>))}
                                        </div>)}
                                </div>
                            </div>);
        })}
                </div>

                
                <dialog_1.DialogFooter className="p-4 border-t bg-white">
                    <button_1.Button onClick={() => handleCloseAndSync(false)} className="w-full bg-slate-900 text-white hover:bg-slate-800 font-bold py-6 text-md shadow-lg">
                        <lucide_react_1.CheckCircle2 className="w-5 h-5 mr-2 text-emerald-400"/> 
                        Đóng và Tải lại dữ liệu
                    </button_1.Button>
                </dialog_1.DialogFooter>
            </dialog_1.DialogContent>
        </dialog_1.Dialog>);
});
exports.AiAutoTagSummaryModal.displayName = 'AiAutoTagSummaryModal';
//# sourceMappingURL=AiAutoTagSummaryModal.js.map