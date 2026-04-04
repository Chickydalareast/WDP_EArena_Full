'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizLivePreviewModal = QuizLivePreviewModal;
const react_1 = __importDefault(require("react"));
const dialog_1 = require("@/shared/components/ui/dialog");
const lucide_react_1 = require("lucide-react");
function QuizLivePreviewModal({ isOpen, onClose, questions, totalItems, totalActualQuestions }) {
    return (<dialog_1.Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <dialog_1.DialogContent className="sm:max-w-[800px] max-h-[85vh] flex flex-col p-0 overflow-hidden bg-slate-50">
                <dialog_1.DialogHeader className="px-6 py-4 border-b bg-white shrink-0">
                    <dialog_1.DialogTitle className="text-xl flex items-center gap-2 text-purple-900">
                        <lucide_react_1.FileText className="w-5 h-5 text-purple-600"/> Bản nháp Đề thi (Dry-Run)
                    </dialog_1.DialogTitle>
                    <div className="flex gap-4 mt-2 text-sm text-muted-foreground font-medium">
                        <span className="flex items-center gap-1"><lucide_react_1.ScrollText className="w-4 h-4"/> Tổng elements: {totalItems}</span>
                        <span className="flex items-center gap-1 text-green-600"><lucide_react_1.CheckCircle2 className="w-4 h-4"/> Câu hỏi thực tế: {totalActualQuestions}</span>
                    </div>
                </dialog_1.DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {questions.length === 0 ? (<div className="text-center p-10 text-muted-foreground">Không có dữ liệu đề thi.</div>) : (questions.map((q, index) => (<div key={q.originalQuestionId} className="bg-white p-5 rounded-xl border shadow-sm">
                                
                                
                                {q.type === 'PASSAGE' ? (<div className="space-y-4">
                                        <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-100">
                                            <div className="text-xs font-bold text-amber-600 uppercase mb-2">Đoạn văn / Ngữ liệu</div>
                                            <div className="text-sm font-medium leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: q.content }}/>
                                        </div>
                                        
                                        <div className="pl-4 border-l-2 border-purple-200 space-y-4 mt-4">
                                            {q.subQuestions?.map((subQ, subIdx) => (<div key={subQ.originalQuestionId} className="space-y-2">
                                                    <div className="font-bold text-sm flex gap-2">
                                                        <span className="text-purple-600">Câu {subIdx + 1}:</span>
                                                        <span dangerouslySetInnerHTML={{ __html: subQ.content }}/>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                                        {subQ.answers?.map((ans) => (<div key={ans.id} className="p-2 bg-slate-50 border rounded-lg text-xs flex gap-2">
                                                                <span className="font-bold text-slate-500">{ans.id}.</span> 
                                                                <span dangerouslySetInnerHTML={{ __html: ans.content }}/>
                                                            </div>))}
                                                    </div>
                                                </div>))}
                                        </div>
                                    </div>) : (<div className="space-y-3">
                                        <div className="font-bold text-sm flex gap-2">
                                            <span className="text-purple-600">Câu {index + 1}:</span>
                                            <span dangerouslySetInnerHTML={{ __html: q.content }}/>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                            {q.answers?.map((ans) => (<div key={ans.id} className="p-2 bg-slate-50 border rounded-lg text-xs flex gap-2">
                                                    <span className="font-bold text-slate-500">{ans.id}.</span> 
                                                    <span dangerouslySetInnerHTML={{ __html: ans.content }}/>
                                                </div>))}
                                        </div>
                                    </div>)}
                            </div>)))}
                </div>
            </dialog_1.DialogContent>
        </dialog_1.Dialog>);
}
//# sourceMappingURL=QuizLivePreviewModal.js.map