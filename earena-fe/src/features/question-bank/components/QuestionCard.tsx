'use client';

import React, { useState, useEffect } from 'react';
import { MediaGallery, PopulatedMedia } from '@/shared/components/common/MediaGallery';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { BookOpen, MoreVertical, Edit3, Copy, Trash2, Loader2, Sparkles, Tag } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/components/ui/dropdown-menu';
import { cn } from '@/shared/lib/utils';
import { PopulatedQuestion } from '@/features/exam-builder/lib/hydration-utils';
import { IAiProcessedQuestion } from '../types/question-bank.schema';

interface QuestionCardProps {
  question: PopulatedQuestion | any; 
  isSelected: boolean;
  isProcessing?: boolean; 
  optimisticData?: IAiProcessedQuestion; // [NEW] Dữ liệu ảo từ AI
  topicsMap?: Record<string, string>;    // [NEW] Từ điển map Topic ID -> Name
  onToggle: (id: string) => void;
  onEdit: (q: PopulatedQuestion) => void;
  onClone: (id: string) => void;
  onDelete: (id: string) => void;
}

export const QuestionCard = React.memo(({ 
    question, isSelected, isProcessing = false, 
    optimisticData, topicsMap = {}, 
    onToggle, onEdit, onClone, onDelete 
}: QuestionCardProps) => {
  const qId = question._id || question.id || '';
  const isPassage = question.type === 'PASSAGE';

  // --- LOGIC GHI ĐÈ DỮ LIỆU (OPTIMISTIC OVERRIDE) ---
  const displayDifficulty = optimisticData?.difficultyLevel || question.difficultyLevel;
  const displayTopicId = optimisticData?.topicId || question.topicId;
  const displayTags = optimisticData?.tags || question.tags || [];

  // --- STATE KÍCH HOẠT HIỆU ỨNG NHÁY SÁNG (FLASH WOW) ---
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
      // Khi optimisticData xuất hiện (AI vừa gán xong), kích hoạt flash
      if (optimisticData) {
          setIsFlashing(true);
          const timer = setTimeout(() => setIsFlashing(false), 1500);
          return () => clearTimeout(timer);
      }
  }, [optimisticData]);

  // --- HELPER RENDER MÀU SẮC ĐỘ KHÓ ---
  const getDifficultyStyles = (level: string) => {
      switch(level) {
          case 'NB': return { text: 'Nhận biết', style: 'bg-emerald-100 text-emerald-700 border-emerald-200 shadow-sm' };
          case 'TH': return { text: 'Thông hiểu', style: 'bg-blue-100 text-blue-700 border-blue-200 shadow-sm' };
          case 'VD': return { text: 'Vận dụng', style: 'bg-amber-100 text-amber-700 border-amber-200 shadow-sm' };
          case 'VDC': return { text: 'Vận dụng cao', style: 'bg-rose-100 text-rose-700 border-rose-200 shadow-sm' };
          default: return { text: 'Chưa phân loại', style: 'bg-slate-100 text-slate-500 border-slate-200' };
      }
  };
  const diffData = getDifficultyStyles(displayDifficulty);

  return (
    <div className={cn(
      "group bg-white border rounded-xl p-5 shadow-sm transition-all duration-700 relative overflow-hidden",
      isPassage ? "border-purple-200" : "border-slate-200",
      isSelected && "ring-2 ring-blue-500 border-blue-500 bg-blue-50/10",
      isProcessing && "border-dashed border-amber-300 ring-1 ring-amber-300/50",
      // [NEW] Hiệu ứng chớp sáng báo hiệu AI vừa làm xong
      isFlashing && "bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)] scale-[1.01]" 
    )}>
      
      {isProcessing && (
        <div className="absolute inset-0 z-20 bg-slate-50/60 backdrop-blur-[1.5px] flex items-center justify-center cursor-not-allowed transition-all duration-300">
            <div className="bg-white border border-amber-200 shadow-lg px-4 py-2 rounded-full flex items-center gap-2 text-amber-700 font-bold text-sm animate-in zoom-in duration-300">
                <Loader2 className="w-4 h-4 animate-spin" /> 
                <Sparkles className="w-4 h-4 text-amber-500" />
                AI đang phân tích & gắn thẻ...
            </div>
        </div>
      )}

      <div className="absolute left-4 top-5 z-10">
        <Checkbox 
          checked={isSelected} 
          onCheckedChange={() => onToggle(qId)} 
          className="w-5 h-5"
          disabled={isProcessing} 
        />
      </div>

      <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()} disabled={isProcessing}>
            <div className={cn("p-1.5 rounded-md hover:bg-slate-100 cursor-pointer transition-colors", isProcessing ? "text-slate-300" : "text-slate-500")}>
              <MoreVertical className="w-5 h-5" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 font-medium">
            <DropdownMenuItem onClick={() => onEdit(question)} className="cursor-pointer">
              <Edit3 className="w-4 h-4 mr-2 text-blue-600" /> Sửa câu hỏi
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onClone(qId)} className="cursor-pointer">
              <Copy className="w-4 h-4 mr-2 text-amber-600" /> Nhân bản
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(qId)} className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50">
              <Trash2 className="w-4 h-4 mr-2" /> Xóa vĩnh viễn
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className={cn("ml-8 pr-6 transition-all duration-500", isProcessing && "opacity-40 grayscale-[0.5]")}>
        {isPassage && (
          <span className="text-[11px] font-black uppercase text-purple-700 bg-purple-100 px-3 py-1 rounded-md mb-3 inline-flex items-center gap-1 tracking-wider border border-purple-200 shadow-sm">
            <BookOpen className="w-3 h-3" /> Bài đọc ({question.subQuestions?.length || 0} câu hỏi)
          </span>
        )}

        {/* [NEW] BADGE HIỂN THỊ THUỘC TÍNH AI GÁN */}
        <div className="flex flex-wrap items-center gap-2 mb-3 mt-1">
            {displayDifficulty && displayDifficulty !== 'UNKNOWN' && (
                <span className={cn("text-xs font-bold px-2.5 py-1 rounded border", diffData.style)}>
                    {diffData.text}
                </span>
            )}
            
            {displayTopicId && topicsMap[displayTopicId] && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200 truncate max-w-[220px]" title={topicsMap[displayTopicId]}>
                    {topicsMap[displayTopicId]}
                </span>
            )}

            {displayTags.length > 0 && (
                <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                    <Tag className="w-3 h-3 text-slate-400 ml-1" />
                    {displayTags.map((tag: string) => (
                        <span key={tag} className="bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
                            #{tag}
                        </span>
                    ))}
                </div>
            )}
        </div>
        
        <div className="prose prose-sm max-w-none text-slate-800 font-medium mb-2" dangerouslySetInnerHTML={{ __html: question.content }} />
        <MediaGallery mediaList={question.attachedMedia as unknown as PopulatedMedia[]} />

        {isPassage && question.subQuestions && (
           <div className="mt-4 space-y-3 pl-4 border-l-2 border-purple-200 relative">
             {question.subQuestions.map((subQ: any, idx: number) => (
               <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm">
                 <div className="font-semibold text-slate-700 mb-1">Câu {idx + 1}:</div>
                 <div dangerouslySetInnerHTML={{ __html: subQ.content }} />
                 <MediaGallery mediaList={subQ.attachedMedia as PopulatedMedia[]} />
                 <div className="mt-2 text-slate-500 text-xs flex gap-2">
                    {subQ.answers?.map((ans: any) => (
                      <span key={ans.id} className={cn("px-2 py-1 rounded", ans.isCorrect ? "bg-green-100 text-green-700 font-bold" : "bg-white border")}>
                        {ans.id}. {ans.content}
                      </span>
                    ))}
                 </div>
               </div>
             ))}
           </div>
        )}

        {!isPassage && question.answers && (
           <div className="mt-3 flex flex-wrap gap-2 text-sm">
              {question.answers.map((ans: any) => (
                <div key={ans.id} className={cn("px-3 py-1.5 rounded-lg border", ans.isCorrect ? "bg-green-50 border-green-500 text-green-700 font-bold" : "bg-white text-slate-600")}>
                  <span className="mr-2 font-bold">{ans.id}.</span>{ans.content}
                </div>
              ))}
           </div>
        )}
      </div>
    </div>
  );
});
QuestionCard.displayName = 'QuestionCard';