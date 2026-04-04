'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiniQuestionCard = exports.MiniQuestionCardUI = void 0;
const react_1 = __importDefault(require("react"));
const core_1 = require("@dnd-kit/core");
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/shared/lib/utils");
exports.MiniQuestionCardUI = react_1.default.memo(({ question, isAlreadyAdded }) => {
    const isPassage = question.type === 'PASSAGE';
    return (<div className={(0, utils_1.cn)("p-3 rounded-xl border bg-white flex items-start gap-2 transition-all relative w-full", isAlreadyAdded ? "opacity-50 bg-slate-50 cursor-not-allowed border-slate-200" : "hover:border-blue-400 hover:shadow-md", !isAlreadyAdded && isPassage ? "border-purple-200" : "border-slate-200")}>
            <div className="mt-1 text-slate-400 shrink-0 cursor-grab active:cursor-grabbing">
                <lucide_react_1.GripVertical className="w-4 h-4"/>
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                    {isPassage ? <lucide_react_1.BookOpen className="w-3.5 h-3.5 text-purple-600 shrink-0"/> : <lucide_react_1.FileQuestion className="w-3.5 h-3.5 text-blue-600 shrink-0"/>}
                    <span className={(0, utils_1.cn)("text-[10px] font-bold px-1.5 py-0.5 rounded-sm shrink-0", isPassage ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700")}>
                        {question.difficultyLevel || 'UNKNOWN'}
                    </span>
                    {isPassage && (<span className="text-[10px] text-purple-600 font-semibold truncate">
                            {question.subQuestions?.length || 0} câu phụ
                        </span>)}
                </div>
                <div className="text-xs text-slate-700 line-clamp-2 prose prose-sm prose-p:m-0 prose-p:inline font-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: question.content }}/>
                {isAlreadyAdded && (<div className="mt-2 text-[10px] font-bold text-red-500 uppercase tracking-wider">
                        Đã có trong đề
                    </div>)}
            </div>
        </div>);
});
exports.MiniQuestionCardUI.displayName = 'MiniQuestionCardUI';
exports.MiniQuestionCard = react_1.default.memo(({ question, isAlreadyAdded }) => {
    const rawId = question.originalQuestionId || question._id || question.id;
    const { attributes, listeners, setNodeRef, isDragging } = (0, core_1.useDraggable)({
        id: `bank-${rawId}`,
        data: {
            type: 'QuestionFromBank',
            questionData: question,
        },
        disabled: isAlreadyAdded,
    });
    if (isDragging) {
        return (<div ref={setNodeRef} className="h-24 rounded-xl border-2 border-dashed border-slate-300 bg-slate-100/50 opacity-50"/>);
    }
    return (<div ref={setNodeRef} {...attributes} {...listeners} className="touch-none">
            <exports.MiniQuestionCardUI question={question} isAlreadyAdded={isAlreadyAdded}/>
        </div>);
});
exports.MiniQuestionCard.displayName = 'MiniQuestionCard';
//# sourceMappingURL=MiniQuestionCard.js.map