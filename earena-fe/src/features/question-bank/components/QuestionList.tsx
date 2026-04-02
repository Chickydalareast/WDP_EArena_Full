'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useBankQuestions } from '../hooks/useBankQueries';
import { 
    useCloneQuestion, 
    useBulkCloneQuestions, 
    useBulkDeleteQuestions, 
    useBulkAutoTag,
    useBulkPublishQuestions
} from '../hooks/useBankMutations';
import { useAutoTagSync } from '../hooks/useAutoTagSync'; 
import { useQuestionBankStore } from '../stores/question-bank.store';
import { useDebounce } from '@/shared/hooks/useDebounce'; 

import { QuestionCard } from './QuestionCard';
import { BulkMoveModal } from './BulkMoveModal';
import { SmartOrganizeModal } from './SmartOrganizeModal';
import { CreateBankQuestionSheet } from './CreateBankQuestionSheet';
import { EditQuestionSheet } from '@/features/exam-builder/components/EditQuestionSheet';
import { AiQuestionBuilderModal } from './AiQuestionBuilderModal';
import { AiAutoTagSummaryModal } from './AiAutoTagSummaryModal'; 
import { PopulatedQuestion } from '@/features/exam-builder/lib/hydration-utils';

import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/shared/components/ui/dialog';
import { MultiSelect } from '@/shared/components/ui/multi-select';

import { cn } from '@/shared/lib/utils'; 
import { Search, FolderSync, Inbox, PlusCircle, Trash2, Copy, Loader2, Sparkles, Waypoints, RefreshCw, Filter, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

import { useSession } from '@/features/auth/hooks/useSession';
import { useTopicsTree } from '@/features/exam-builder/hooks/useTopics';
import { useActiveFilters } from '@/features/exam-builder/hooks/useActiveFilters';

export function QuestionList() {
  // [CTO RESTORE]: Lấy Folder Context gốc
  const selectedFolderId = useQuestionBankStore(state => state.selectedFolderId);
  const activePayload = useQuestionBankStore(state => state.activePayload);
  const setFilters = useQuestionBankStore(state => state.setFilters);

  const selectedQuestionIds = useQuestionBankStore(state => state.selectedQuestionIds);
  const processingIds = useQuestionBankStore(state => state.processingIds); 
  const aiProcessedQuestions = useQuestionBankStore(state => state.aiProcessedQuestions);

  const toggleSelection = useQuestionBankStore(state => state.toggleQuestionSelection);
  const selectAll = useQuestionBankStore(state => state.selectAllQuestions);
  const clearSelection = useQuestionBankStore(state => state.clearQuestionSelection);

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);
  
  const [isBulkMoveOpen, setIsBulkMoveOpen] = useState(false);
  const [isSmartOrganizeOpen, setIsSmartOrganizeOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false); 
  const [editTarget, setEditTarget] = useState<PopulatedQuestion | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'SINGLE' | 'BULK', ids: string[] } | null>(null);

  useEffect(() => {
    setPage(1);
  }, [activePayload, debouncedSearch, selectedFolderId]);

  // --- DATA FETCHING (QUERIES) ---
  const isPollingActive = processingIds.length > 0;

  // [CTO ARCHITECTURE]: Hợp nhất payload. Dùng selectedFolderId làm mỏ neo.
  const queryPayload = useMemo(() => ({
      ...activePayload,
      folderIds: selectedFolderId ? [selectedFolderId] : [], 
  }), [activePayload, selectedFolderId]);

  // 1. Lấy dữ liệu Filter Động dựa trên Thư mục đang đứng
  const { data: filtersResponse, isFetching: isFetchingFilters } = useActiveFilters(queryPayload);

  // 2. Lấy Danh sách câu hỏi
  const { data: response, isLoading, isError, refetch, isRefetching } = useBankQuestions({
    ...queryPayload,
    search: debouncedSearch, 
    page, 
    limit: 10,
  }, isPollingActive);

  // --- TOPIC MAPPING ---
  const { user } = useSession();
  const subjectId = user?.subjects?.[0]?.id;
  const { data: topics = [] } = useTopicsTree(subjectId);
  const topicsMap = useMemo(() => {
      const map: Record<string, string> = {};
      topics.forEach(t => { map[t.id] = t.path; });
      return map;
  }, [topics]);

  const questions = response?.items || (response as any)?.data || [];
  const meta = response?.meta;
  const typedQuestions = useMemo(() => questions as PopulatedQuestion[], [questions]);
  
  useAutoTagSync(typedQuestions);

  // --- MUTATIONS ---
  const { mutate: cloneSingle } = useCloneQuestion();
  const { mutate: cloneBulk, isPending: isCloningBulk } = useBulkCloneQuestions();
  const { mutate: deleteBulk, isPending: isDeleting } = useBulkDeleteQuestions();
  const { mutate: autoTagBulk, isPending: isAutoTagging } = useBulkAutoTag();
  
  // [CTO BỔ SUNG]: Hook Xuất bản
  const { mutate: publishBulk, isPending: isPublishingBulk } = useBulkPublishQuestions();

  const currentPageIds = useMemo(() => questions.map((q: any) => q._id || q.id), [questions]);
  const isAllSelected = currentPageIds.length > 0 && currentPageIds.every((id: string) => selectedQuestionIds.includes(id));

  const handleToggleAll = (checked: boolean) => {
    if (checked) selectAll(Array.from(new Set([...selectedQuestionIds, ...currentPageIds])));
    else selectAll(selectedQuestionIds.filter(id => !currentPageIds.includes(id)));
  };

  const handleCloneSingle = (id: string) => {
    if (!selectedFolderId) return;
    cloneSingle({ id, data: { destFolderId: selectedFolderId } });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteBulk(
      { questionIds: deleteTarget.ids },
      { 
        onSuccess: () => {
          clearSelection();
          setDeleteTarget(null);
          if (questions.length === deleteTarget.ids.length && page > 1) setPage(p => p - 1);
        }
      }
    );
  };

  const handleBulkAutoTag = () => {
      if (selectedQuestionIds.length > 200) return;
      autoTagBulk({ questionIds: selectedQuestionIds });
  };

  // --- UI DICTIONARIES CHO BỘ LỌC ---
  const diffOptions = useMemo(() => [
    { label: 'Nhận biết', value: 'NB' },
    { label: 'Thông hiểu', value: 'TH' },
    { label: 'Vận dụng', value: 'VD' },
    { label: 'Vận dụng cao', value: 'VDC' }
  ], []);
  
  const availableTags = filtersResponse?.tags || [];
  const tagOptions = useMemo(() => availableTags.map(tag => ({ label: tag, value: tag })), [availableTags]);

  // EMPTY STATE CHÍNH
  if (!selectedFolderId) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-50 text-slate-400">
        <Inbox className="w-16 h-16 mb-4 opacity-20" />
        <h3 className="text-xl font-semibold text-slate-500 mb-2">Chưa chọn thư mục</h3>
        <p>Vui lòng chọn một thư mục bên thanh điều hướng để xem và quản lý câu hỏi.</p>
      </div>
    );
  }

  const isOverLimit = selectedQuestionIds.length > 200;

  return (
    <div className="h-full flex flex-col bg-white">
      {/* TOOLBAR CHÍNH VÀ FACETED SEARCH */}
      <div className="p-4 border-b border-slate-200 flex flex-col lg:flex-row gap-4 justify-between items-center bg-white sticky top-0 z-30 shadow-sm">
        <div className="flex gap-2 w-full lg:w-72 shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Tìm kiếm câu hỏi..." className="pl-9 bg-slate-50 border-slate-200"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => refetch()} variant="outline" size="icon" className="shrink-0 bg-white shadow-sm" title="Làm mới dữ liệu">
             <RefreshCw className={cn("w-4 h-4 text-slate-600", isRefetching && "animate-spin text-primary")} />
          </Button>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
          {selectedQuestionIds.length > 0 ? (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
              <span className={cn(
                  "text-sm font-semibold px-3 py-1.5 rounded-full border whitespace-nowrap shadow-sm",
                  isOverLimit ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-primary/10 text-primary border-primary/20"
              )}>
                Đã chọn {selectedQuestionIds.length} câu
              </span>
              
              {/* [CTO BỔ SUNG]: Nút Xuất Bản (Màu Xanh lá - Chuẩn UX Hành động Tích cực) */}
              <Button 
                  onClick={() => publishBulk({ questionIds: selectedQuestionIds }, { onSuccess: () => clearSelection() })} 
                  disabled={isPublishingBulk || isOverLimit} 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-bold"
              >
                  {isPublishingBulk ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />} 
                  Xuất bản
              </Button>

              <Button onClick={handleBulkAutoTag} disabled={isAutoTagging || isOverLimit} className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm font-bold">
                  {isAutoTagging ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2 text-purple-200" />} 
                  AI Phân loại
              </Button>

              <Button onClick={() => setIsSmartOrganizeOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                  <Waypoints className="w-4 h-4 mr-2" /> Sắp xếp
              </Button>

              <Button onClick={() => selectedFolderId && cloneBulk({ questionIds: selectedQuestionIds, destFolderId: selectedFolderId }, { onSuccess: () => clearSelection() })} disabled={isCloningBulk} variant="outline" className="border-amber-200 text-amber-700 hover:bg-amber-50">
                {isCloningBulk ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Copy className="w-4 h-4 mr-2" />} Nhân bản
              </Button>
              <Button onClick={() => setIsBulkMoveOpen(true)} className="bg-primary hover:bg-primary/90 text-white shadow-sm">
                <FolderSync className="w-4 h-4 mr-2" /> Di chuyển
              </Button>
              <Button onClick={() => setDeleteTarget({ type: 'BULK', ids: selectedQuestionIds })} variant="destructive" className="shadow-sm">
                <Trash2 className="w-4 h-4 mr-2" /> Xóa
              </Button>
            </div>
          ) : (
             <div className="flex gap-2">
              <Button onClick={() => setIsAiModalOpen(true)} className="bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-200 shadow-sm font-semibold">
                <Sparkles className="w-4 h-4 mr-2" /> AI Builder
              </Button>
              <Button onClick={() => setIsCreateOpen(true)} className="bg-slate-900 text-white hover:bg-slate-800 font-bold shadow-md">
                <PlusCircle className="w-5 h-5 mr-2" /> Tạo câu hỏi
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 py-2 border-b bg-slate-50 flex items-center gap-3 shrink-0">
         <Filter className="w-4 h-4 text-slate-400" />
         <div className="w-48">
             <MultiSelect 
                 options={diffOptions} 
                 selected={activePayload.difficulties || []} 
                 onChange={(vals) => setFilters({ difficulties: vals as any })} 
                 placeholder="Mức độ..." 
             />
         </div>
         <div className="w-64">
             <MultiSelect 
                 options={tagOptions} 
                 selected={activePayload.tags || []} 
                 onChange={(vals) => setFilters({ tags: vals })} 
                 placeholder={availableTags.length === 0 ? "Không có Tag nào" : "Lọc theo Tags..."} 
                 disabled={isFetchingFilters}
             />
         </div>
         {isFetchingFilters && <Loader2 className="w-4 h-4 animate-spin text-primary ml-2" />}
      </div>

      <div className="px-6 py-2 border-b bg-slate-100 flex items-center justify-between text-sm text-slate-600 font-medium shrink-0">
        <div className="flex items-center gap-3">
           <Checkbox checked={isAllSelected} onCheckedChange={handleToggleAll} />
           <span>Chọn tất cả trang này</span>
        </div>
        <div>{isLoading ? 'Đang tải...' : `Tổng số ${meta?.total || 0} câu`}</div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 scrollbar-thin scrollbar-thumb-slate-300 relative">
        {isPollingActive && (
             <div className="absolute top-0 right-4 p-2 z-10 animate-pulse">
                <span className="text-xs font-bold text-amber-600 bg-amber-100 px-3 py-1 rounded-full shadow-sm border border-amber-200 flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Hệ thống AI đang quét...
                </span>
             </div>
        )}

        {isLoading ? (
          <div className="space-y-5">
             {[1,2,3].map(i => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)}
          </div>
        ) : isError ? (
          <div className="text-center text-destructive py-10">Đã xảy ra lỗi khi tải dữ liệu từ máy chủ.</div>
        ) : questions.length === 0 ? (
          <div className="text-center py-24 text-slate-400">
             <Inbox className="w-16 h-16 mx-auto mb-4 opacity-20" />
             <p className="text-lg">Không có câu hỏi nào khớp với bộ lọc.</p>
          </div>
        ) : (
          <div className="space-y-5 pb-16">
            {questions.map((q: any) => {
              const qId = q._id || q.id;
              const optimisticData = aiProcessedQuestions.find(aq => aq.id === qId);

              return (
                  <QuestionCard 
                    key={qId} 
                    question={q} 
                    isSelected={selectedQuestionIds.includes(qId)} 
                    isProcessing={processingIds.includes(qId)}
                    optimisticData={optimisticData}   
                    topicsMap={topicsMap}             
                    onToggle={toggleSelection}
                    onEdit={setEditTarget}
                    onClone={handleCloneSingle}
                    onDelete={(id) => setDeleteTarget({ type: 'SINGLE', ids: [id] })}
                  />
              );
            })}
          </div>
        )}
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="p-4 border-t flex justify-center items-center gap-4 bg-white shrink-0">
          <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Trang trước</Button>
          <span className="text-sm font-medium">Trang {page} / {meta.totalPages}</span>
          <Button variant="outline" disabled={page === meta.totalPages} onClick={() => setPage(p => p + 1)}>Trang sau</Button>
        </div>
      )}
      
      {/* MODALS */}
      <BulkMoveModal isOpen={isBulkMoveOpen} onClose={() => setIsBulkMoveOpen(false)} />
      <SmartOrganizeModal isOpen={isSmartOrganizeOpen} onClose={() => setIsSmartOrganizeOpen(false)} />
      <CreateBankQuestionSheet isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      
      {selectedFolderId && (
         <AiQuestionBuilderModal folderId={selectedFolderId} isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} />
      )}
      
      <EditQuestionSheet question={editTarget} mode="BANK" onClose={() => setEditTarget(null)} />
      <AiAutoTagSummaryModal originalQuestions={typedQuestions} />

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Cảnh báo Xóa dữ liệu</DialogTitle>
            <DialogDescription>
              Bạn đang chuẩn bị xóa vĩnh viễn <strong>{deleteTarget?.ids.length}</strong> câu hỏi. Hành động này không thể hoàn tác và sẽ tự động xóa luôn tất cả các câu hỏi con đi kèm (nếu có).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>Hủy</Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />} Xác nhận Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}