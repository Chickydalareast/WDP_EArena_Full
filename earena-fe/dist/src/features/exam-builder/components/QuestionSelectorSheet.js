'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionSelectorSheet = QuestionSelectorSheet;
const react_1 = __importDefault(require("react"));
const useQuestions_1 = require("../hooks/useQuestions");
const useUpdatePaper_1 = require("../hooks/useUpdatePaper");
const sheet_1 = require("@/shared/components/ui/sheet");
const button_1 = require("@/shared/components/ui/button");
const lucide_react_1 = require("lucide-react");
const skeleton_1 = require("@/shared/components/ui/skeleton");
function QuestionSelectorSheet({ paperId, isOpen, onOpenChange, existingQuestionIds }) {
    const { data: questionsData, isLoading } = (0, useQuestions_1.useQuestions)();
    const { mutate: updatePaper, isPending: isUpdating } = (0, useUpdatePaper_1.useUpdatePaper)(paperId);
    const questions = questionsData?.data || [];
    const handleAddQuestion = (question) => {
        updatePaper({
            action: 'ADD',
            questionId: question._id,
            questionData: {
                originalQuestionId: question._id,
                content: question.content,
                answers: question.answers,
            }
        });
    };
    return (<sheet_1.Sheet open={isOpen} onOpenChange={onOpenChange}>
      <sheet_1.SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <sheet_1.SheetHeader className="mb-6">
          <sheet_1.SheetTitle className="text-xl font-bold">Ngân hàng câu hỏi</sheet_1.SheetTitle>
          <sheet_1.SheetDescription>
            Chọn câu hỏi từ thư viện để thêm vào tờ đề hiện tại.
          </sheet_1.SheetDescription>
        </sheet_1.SheetHeader>

        <div className="space-y-4 pb-12">
          {isLoading ? (Array(5).fill(0).map((_, i) => <skeleton_1.Skeleton key={i} className="h-32 w-full rounded-xl"/>)) : questions.length === 0 ? (<div className="text-center p-8 text-slate-500 bg-slate-50 rounded-xl border border-dashed">
              Kho câu hỏi đang trống. Vui lòng import thêm.
            </div>) : (questions.map((q) => {
            const isAlreadyAdded = existingQuestionIds.includes(q._id);
            return (<div key={q._id} className={`p-4 rounded-xl border transition-all ${isAlreadyAdded ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-200 hover:border-blue-300 shadow-sm'}`}>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded mb-2 inline-block">
                        {q.difficultyLevel || 'Chưa phân loại'}
                      </span>
                      <p className="text-sm font-medium text-slate-800 line-clamp-3">
                        {q.content}
                      </p>
                    </div>
                    
                    <button_1.Button size="sm" variant={isAlreadyAdded ? "secondary" : "default"} disabled={isAlreadyAdded || isUpdating} onClick={() => handleAddQuestion(q)} className="shrink-0 font-semibold">
                      {isAlreadyAdded ? 'Đã có trong đề' : (<>
                          <lucide_react_1.PlusCircle className="w-4 h-4 mr-1.5"/> Thêm
                        </>)}
                    </button_1.Button>
                  </div>
                </div>);
        }))}
        </div>
      </sheet_1.SheetContent>
    </sheet_1.Sheet>);
}
//# sourceMappingURL=QuestionSelectorSheet.js.map