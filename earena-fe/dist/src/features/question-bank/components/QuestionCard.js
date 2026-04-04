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
exports.QuestionCard = void 0;
const react_1 = __importStar(require("react"));
const MediaGallery_1 = require("@/shared/components/common/MediaGallery");
const checkbox_1 = require("@/shared/components/ui/checkbox");
const lucide_react_1 = require("lucide-react");
const dropdown_menu_1 = require("@/shared/components/ui/dropdown-menu");
const utils_1 = require("@/shared/lib/utils");
exports.QuestionCard = react_1.default.memo(({ question, isSelected, isProcessing = false, optimisticData, topicsMap = {}, onToggle, onEdit, onClone, onDelete }) => {
    const qId = question._id || question.id || '';
    const isPassage = question.type === 'PASSAGE';
    const displayDifficulty = optimisticData?.difficultyLevel || question.difficultyLevel;
    const displayTopicId = optimisticData?.topicId || question.topicId;
    const displayTags = optimisticData?.tags || question.tags || [];
    const [isFlashing, setIsFlashing] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        if (optimisticData) {
            setIsFlashing(true);
            const timer = setTimeout(() => setIsFlashing(false), 1500);
            return () => clearTimeout(timer);
        }
    }, [optimisticData]);
    const getDifficultyStyles = (level) => {
        switch (level) {
            case 'NB': return { text: 'Nhận biết', style: 'bg-emerald-100 text-emerald-700 border-emerald-200 shadow-sm' };
            case 'TH': return { text: 'Thông hiểu', style: 'bg-blue-100 text-blue-700 border-blue-200 shadow-sm' };
            case 'VD': return { text: 'Vận dụng', style: 'bg-amber-100 text-amber-700 border-amber-200 shadow-sm' };
            case 'VDC': return { text: 'Vận dụng cao', style: 'bg-rose-100 text-rose-700 border-rose-200 shadow-sm' };
            default: return { text: 'Chưa phân loại', style: 'bg-slate-100 text-slate-500 border-slate-200' };
        }
    };
    const diffData = getDifficultyStyles(displayDifficulty);
    return (<div className={(0, utils_1.cn)("group bg-white border rounded-xl p-5 shadow-sm transition-all duration-700 relative overflow-hidden", isPassage ? "border-purple-200" : "border-slate-200", isSelected && "ring-2 ring-blue-500 border-blue-500 bg-blue-50/10", isProcessing && "border-dashed border-amber-300 ring-1 ring-amber-300/50", isFlashing && "bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)] scale-[1.01]")}>
      
      {isProcessing && (<div className="absolute inset-0 z-20 bg-slate-50/60 backdrop-blur-[1.5px] flex items-center justify-center cursor-not-allowed transition-all duration-300">
            <div className="bg-white border border-amber-200 shadow-lg px-4 py-2 rounded-full flex items-center gap-2 text-amber-700 font-bold text-sm animate-in zoom-in duration-300">
                <lucide_react_1.Loader2 className="w-4 h-4 animate-spin"/> 
                <lucide_react_1.Sparkles className="w-4 h-4 text-amber-500"/>
                AI đang phân tích & gắn thẻ...
            </div>
        </div>)}

      <div className="absolute left-4 top-5 z-10">
        <checkbox_1.Checkbox checked={isSelected} onCheckedChange={() => onToggle(qId)} className="w-5 h-5" disabled={isProcessing}/>
      </div>

      <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <dropdown_menu_1.DropdownMenu>
          <dropdown_menu_1.DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()} disabled={isProcessing}>
            <div className={(0, utils_1.cn)("p-1.5 rounded-md hover:bg-slate-100 cursor-pointer transition-colors", isProcessing ? "text-slate-300" : "text-slate-500")}>
              <lucide_react_1.MoreVertical className="w-5 h-5"/>
            </div>
          </dropdown_menu_1.DropdownMenuTrigger>
          <dropdown_menu_1.DropdownMenuContent align="end" className="w-40 font-medium">
            <dropdown_menu_1.DropdownMenuItem onClick={() => onEdit(question)} className="cursor-pointer">
              <lucide_react_1.Edit3 className="w-4 h-4 mr-2 text-blue-600"/> Sửa câu hỏi
            </dropdown_menu_1.DropdownMenuItem>
            <dropdown_menu_1.DropdownMenuItem onClick={() => onClone(qId)} className="cursor-pointer">
              <lucide_react_1.Copy className="w-4 h-4 mr-2 text-amber-600"/> Nhân bản
            </dropdown_menu_1.DropdownMenuItem>
            <dropdown_menu_1.DropdownMenuItem onClick={() => onDelete(qId)} className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50">
              <lucide_react_1.Trash2 className="w-4 h-4 mr-2"/> Xóa vĩnh viễn
            </dropdown_menu_1.DropdownMenuItem>
          </dropdown_menu_1.DropdownMenuContent>
        </dropdown_menu_1.DropdownMenu>
      </div>

      <div className={(0, utils_1.cn)("ml-8 pr-6 transition-all duration-500", isProcessing && "opacity-40 grayscale-[0.5]")}>
        {isPassage && (<span className="text-[11px] font-black uppercase text-purple-700 bg-purple-100 px-3 py-1 rounded-md mb-3 inline-flex items-center gap-1 tracking-wider border border-purple-200 shadow-sm">
            <lucide_react_1.BookOpen className="w-3 h-3"/> Bài đọc ({question.subQuestions?.length || 0} câu hỏi)
          </span>)}

        
        <div className="flex flex-wrap items-center gap-2 mb-3 mt-1">
            {displayDifficulty && displayDifficulty !== 'UNKNOWN' && (<span className={(0, utils_1.cn)("text-xs font-bold px-2.5 py-1 rounded border", diffData.style)}>
                    {diffData.text}
                </span>)}
            
            {displayTopicId && topicsMap[displayTopicId] && (<span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200 truncate max-w-[220px]" title={topicsMap[displayTopicId]}>
                    {topicsMap[displayTopicId]}
                </span>)}

            {displayTags.length > 0 && (<div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                    <lucide_react_1.Tag className="w-3 h-3 text-slate-400 ml-1"/>
                    {displayTags.map((tag) => (<span key={tag} className="bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
                            #{tag}
                        </span>))}
                </div>)}
        </div>
        
        <div className="prose prose-sm max-w-none text-slate-800 font-medium mb-2" dangerouslySetInnerHTML={{ __html: question.content }}/>
        <MediaGallery_1.MediaGallery mediaList={question.attachedMedia}/>

        {isPassage && question.subQuestions && (<div className="mt-4 space-y-3 pl-4 border-l-2 border-purple-200 relative">
             {question.subQuestions.map((subQ, idx) => (<div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm">
                 <div className="font-semibold text-slate-700 mb-1">Câu {idx + 1}:</div>
                 <div dangerouslySetInnerHTML={{ __html: subQ.content }}/>
                 <MediaGallery_1.MediaGallery mediaList={subQ.attachedMedia}/>
                 <div className="mt-2 text-slate-500 text-xs flex gap-2">
                    {subQ.answers?.map((ans) => (<span key={ans.id} className={(0, utils_1.cn)("px-2 py-1 rounded", ans.isCorrect ? "bg-green-100 text-green-700 font-bold" : "bg-white border")}>
                        {ans.id}. {ans.content}
                      </span>))}
                 </div>
               </div>))}
           </div>)}

        {!isPassage && question.answers && (<div className="mt-3 flex flex-wrap gap-2 text-sm">
              {question.answers.map((ans) => (<div key={ans.id} className={(0, utils_1.cn)("px-3 py-1.5 rounded-lg border", ans.isCorrect ? "bg-green-50 border-green-500 text-green-700 font-bold" : "bg-white text-slate-600")}>
                  <span className="mr-2 font-bold">{ans.id}.</span>{ans.content}
                </div>))}
           </div>)}
      </div>
    </div>);
});
exports.QuestionCard.displayName = 'QuestionCard';
//# sourceMappingURL=QuestionCard.js.map