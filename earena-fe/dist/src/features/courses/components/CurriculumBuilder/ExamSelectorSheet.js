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
exports.ExamSelectorSheet = ExamSelectorSheet;
const react_1 = __importStar(require("react"));
const useTeacherExams_1 = require("@/features/exam-builder/hooks/useTeacherExams");
const sheet_1 = require("@/shared/components/ui/sheet");
const input_1 = require("@/shared/components/ui/input");
const lucide_react_1 = require("lucide-react");
const skeleton_1 = require("@/shared/components/ui/skeleton");
function ExamSelectorSheet({ isOpen, onClose, onSelectExam, currentExamId }) {
    const { data: examsData, isLoading } = (0, useTeacherExams_1.useTeacherExams)();
    const [searchQuery, setSearchQuery] = (0, react_1.useState)('');
    const filteredExams = (0, react_1.useMemo)(() => {
        const raw = examsData;
        const examsList = Array.isArray(raw)
            ? raw
            : (raw && typeof raw === 'object' && 'items' in raw
                ? raw.items
                : (raw && typeof raw === 'object' && 'data' in raw
                    ? raw.data
                    : [])) || [];
        if (!searchQuery)
            return examsList;
        return examsList.filter((exam) => exam.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [examsData, searchQuery]);
    return (<sheet_1.Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <sheet_1.SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0 border-l border-border bg-slate-50">
                <div className="p-6 border-b bg-white">
                    <sheet_1.SheetHeader className="mb-4">
                        <sheet_1.SheetTitle className="text-xl font-bold text-slate-800">Chọn Đề Thi (Quiz)</sheet_1.SheetTitle>
                        <sheet_1.SheetDescription>
                            Gắn một đề thi đã tạo vào bài học để làm bài kiểm tra.
                        </sheet_1.SheetDescription>
                    </sheet_1.SheetHeader>
                    <div className="relative">
                        <lucide_react_1.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                        <input_1.Input placeholder="Tìm kiếm tên đề thi..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 bg-slate-50 border-slate-200"/>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {isLoading ? (Array.from({ length: 4 }).map((_, i) => (<skeleton_1.Skeleton key={i} className="h-24 w-full rounded-xl bg-slate-200"/>))) : filteredExams.length === 0 ? (<div className="text-center p-8 text-slate-500">
                            <lucide_react_1.FileText className="w-12 h-12 mx-auto text-slate-300 mb-3"/>
                            <p>Không tìm thấy đề thi nào.</p>
                        </div>) : (filteredExams.map((exam) => {
            const examId = exam._id || exam.id;
            const isSelected = currentExamId === examId;
            return (<div key={examId} className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-3 group ${isSelected
                    ? 'bg-blue-50 border-blue-300 shadow-sm ring-1 ring-blue-500'
                    : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm'}`} onClick={() => {
                    onSelectExam(examId, exam.title);
                    onClose();
                }}>
                                    <div className="flex justify-between items-start gap-3">
                                        <h4 className={`font-semibold line-clamp-2 text-sm ${isSelected ? 'text-blue-700' : 'text-slate-800 group-hover:text-blue-600'}`}>
                                            {exam.title}
                                        </h4>
                                        {isSelected && <lucide_react_1.CheckCircle className="w-5 h-5 text-blue-600 shrink-0"/>}
                                    </div>
                                    <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                                        <span className="flex items-center gap-1"><lucide_react_1.Clock className="w-3.5 h-3.5"/> {exam.duration} phút</span>
                                        <span className="flex items-center gap-1"><lucide_react_1.CheckCircle className="w-3.5 h-3.5"/> {exam.totalScore} điểm</span>
                                    </div>
                                </div>);
        }))}
                </div>
            </sheet_1.SheetContent>
        </sheet_1.Sheet>);
}
//# sourceMappingURL=ExamSelectorSheet.js.map