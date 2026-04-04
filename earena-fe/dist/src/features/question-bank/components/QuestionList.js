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
exports.QuestionList = QuestionList;
const react_1 = __importStar(require("react"));
const useBankQueries_1 = require("../hooks/useBankQueries");
const useBankMutations_1 = require("../hooks/useBankMutations");
const useAutoTagSync_1 = require("../hooks/useAutoTagSync");
const question_bank_store_1 = require("../stores/question-bank.store");
const useDebounce_1 = require("@/shared/hooks/useDebounce");
const QuestionCard_1 = require("./QuestionCard");
const BulkMoveModal_1 = require("./BulkMoveModal");
const SmartOrganizeModal_1 = require("./SmartOrganizeModal");
const CreateBankQuestionSheet_1 = require("./CreateBankQuestionSheet");
const EditQuestionSheet_1 = require("@/features/exam-builder/components/EditQuestionSheet");
const AiQuestionBuilderModal_1 = require("./AiQuestionBuilderModal");
const AiAutoTagSummaryModal_1 = require("./AiAutoTagSummaryModal");
const input_1 = require("@/shared/components/ui/input");
const button_1 = require("@/shared/components/ui/button");
const checkbox_1 = require("@/shared/components/ui/checkbox");
const skeleton_1 = require("@/shared/components/ui/skeleton");
const dialog_1 = require("@/shared/components/ui/dialog");
const multi_select_1 = require("@/shared/components/ui/multi-select");
const utils_1 = require("@/shared/lib/utils");
const lucide_react_1 = require("lucide-react");
const useSession_1 = require("@/features/auth/hooks/useSession");
const useTopics_1 = require("@/features/exam-builder/hooks/useTopics");
const useActiveFilters_1 = require("@/features/exam-builder/hooks/useActiveFilters");
function QuestionList() {
    const selectedFolderId = (0, question_bank_store_1.useQuestionBankStore)(state => state.selectedFolderId);
    const activePayload = (0, question_bank_store_1.useQuestionBankStore)(state => state.activePayload);
    const setFilters = (0, question_bank_store_1.useQuestionBankStore)(state => state.setFilters);
    const selectedQuestionIds = (0, question_bank_store_1.useQuestionBankStore)(state => state.selectedQuestionIds);
    const processingIds = (0, question_bank_store_1.useQuestionBankStore)(state => state.processingIds);
    const aiProcessedQuestions = (0, question_bank_store_1.useQuestionBankStore)(state => state.aiProcessedQuestions);
    const toggleSelection = (0, question_bank_store_1.useQuestionBankStore)(state => state.toggleQuestionSelection);
    const selectAll = (0, question_bank_store_1.useQuestionBankStore)(state => state.selectAllQuestions);
    const clearSelection = (0, question_bank_store_1.useQuestionBankStore)(state => state.clearQuestionSelection);
    const [searchTerm, setSearchTerm] = (0, react_1.useState)('');
    const debouncedSearch = (0, useDebounce_1.useDebounce)(searchTerm, 500);
    const [page, setPage] = (0, react_1.useState)(1);
    const [isBulkMoveOpen, setIsBulkMoveOpen] = (0, react_1.useState)(false);
    const [isSmartOrganizeOpen, setIsSmartOrganizeOpen] = (0, react_1.useState)(false);
    const [isCreateOpen, setIsCreateOpen] = (0, react_1.useState)(false);
    const [isAiModalOpen, setIsAiModalOpen] = (0, react_1.useState)(false);
    const [editTarget, setEditTarget] = (0, react_1.useState)(null);
    const [deleteTarget, setDeleteTarget] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        setPage(1);
    }, [activePayload, debouncedSearch, selectedFolderId]);
    const isPollingActive = processingIds.length > 0;
    const queryPayload = (0, react_1.useMemo)(() => ({
        ...activePayload,
        folderIds: selectedFolderId ? [selectedFolderId] : [],
    }), [activePayload, selectedFolderId]);
    const { data: filtersResponse, isFetching: isFetchingFilters } = (0, useActiveFilters_1.useActiveFilters)(queryPayload);
    const { data: response, isLoading, isError, refetch, isRefetching } = (0, useBankQueries_1.useBankQuestions)({
        ...queryPayload,
        search: debouncedSearch,
        page,
        limit: 10,
    }, isPollingActive);
    const { user } = (0, useSession_1.useSession)();
    const subjectId = user?.subjects?.[0]?.id;
    const { data: topics = [] } = (0, useTopics_1.useTopicsTree)(subjectId);
    const topicsMap = (0, react_1.useMemo)(() => {
        const map = {};
        topics.forEach(t => { map[t.id] = t.path; });
        return map;
    }, [topics]);
    const questions = response?.items || response?.data || [];
    const meta = response?.meta;
    const typedQuestions = (0, react_1.useMemo)(() => questions, [questions]);
    (0, useAutoTagSync_1.useAutoTagSync)(typedQuestions);
    const { mutate: cloneSingle } = (0, useBankMutations_1.useCloneQuestion)();
    const { mutate: cloneBulk, isPending: isCloningBulk } = (0, useBankMutations_1.useBulkCloneQuestions)();
    const { mutate: deleteBulk, isPending: isDeleting } = (0, useBankMutations_1.useBulkDeleteQuestions)();
    const { mutate: autoTagBulk, isPending: isAutoTagging } = (0, useBankMutations_1.useBulkAutoTag)();
    const { mutate: publishBulk, isPending: isPublishingBulk } = (0, useBankMutations_1.useBulkPublishQuestions)();
    const currentPageIds = (0, react_1.useMemo)(() => questions.map((q) => q._id || q.id), [questions]);
    const isAllSelected = currentPageIds.length > 0 && currentPageIds.every((id) => selectedQuestionIds.includes(id));
    const handleToggleAll = (checked) => {
        if (checked)
            selectAll(Array.from(new Set([...selectedQuestionIds, ...currentPageIds])));
        else
            selectAll(selectedQuestionIds.filter(id => !currentPageIds.includes(id)));
    };
    const handleCloneSingle = (id) => {
        if (!selectedFolderId)
            return;
        cloneSingle({ id, data: { destFolderId: selectedFolderId } });
    };
    const handleConfirmDelete = () => {
        if (!deleteTarget)
            return;
        deleteBulk({ questionIds: deleteTarget.ids }, {
            onSuccess: () => {
                clearSelection();
                setDeleteTarget(null);
                if (questions.length === deleteTarget.ids.length && page > 1)
                    setPage(p => p - 1);
            }
        });
    };
    const handleBulkAutoTag = () => {
        if (selectedQuestionIds.length > 200)
            return;
        autoTagBulk({ questionIds: selectedQuestionIds });
    };
    const diffOptions = (0, react_1.useMemo)(() => [
        { label: 'Nhận biết', value: 'NB' },
        { label: 'Thông hiểu', value: 'TH' },
        { label: 'Vận dụng', value: 'VD' },
        { label: 'Vận dụng cao', value: 'VDC' }
    ], []);
    const availableTags = filtersResponse?.tags || [];
    const tagOptions = (0, react_1.useMemo)(() => availableTags.map(tag => ({ label: tag, value: tag })), [availableTags]);
    if (!selectedFolderId) {
        return (<div className="h-full flex flex-col items-center justify-center p-8 bg-slate-50 text-slate-400">
        <lucide_react_1.Inbox className="w-16 h-16 mb-4 opacity-20"/>
        <h3 className="text-xl font-semibold text-slate-500 mb-2">Chưa chọn thư mục</h3>
        <p>Vui lòng chọn một thư mục bên thanh điều hướng để xem và quản lý câu hỏi.</p>
      </div>);
    }
    const isOverLimit = selectedQuestionIds.length > 200;
    return (<div className="h-full flex flex-col bg-white">
      
      <div className="p-4 border-b border-slate-200 flex flex-col lg:flex-row gap-4 justify-between items-center bg-white sticky top-0 z-30 shadow-sm">
        <div className="flex gap-2 w-full lg:w-72 shrink-0">
          <div className="relative flex-1">
            <lucide_react_1.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
            <input_1.Input placeholder="Tìm kiếm câu hỏi..." className="pl-9 bg-slate-50 border-slate-200" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
          </div>
          <button_1.Button onClick={() => refetch()} variant="outline" size="icon" className="shrink-0 bg-white shadow-sm" title="Làm mới dữ liệu">
             <lucide_react_1.RefreshCw className={(0, utils_1.cn)("w-4 h-4 text-slate-600", isRefetching && "animate-spin text-primary")}/>
          </button_1.Button>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
          {selectedQuestionIds.length > 0 ? (<div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
              <span className={(0, utils_1.cn)("text-sm font-semibold px-3 py-1.5 rounded-full border whitespace-nowrap shadow-sm", isOverLimit ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-primary/10 text-primary border-primary/20")}>
                Đã chọn {selectedQuestionIds.length} câu
              </span>
              
              
              <button_1.Button onClick={() => publishBulk({ questionIds: selectedQuestionIds }, { onSuccess: () => clearSelection() })} disabled={isPublishingBulk || isOverLimit} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-bold">
                  {isPublishingBulk ? <lucide_react_1.Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <lucide_react_1.CheckCircle className="w-4 h-4 mr-2"/>} 
                  Xuất bản
              </button_1.Button>

              <button_1.Button onClick={handleBulkAutoTag} disabled={isAutoTagging || isOverLimit} className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm font-bold">
                  {isAutoTagging ? <lucide_react_1.Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <lucide_react_1.Sparkles className="w-4 h-4 mr-2 text-purple-200"/>} 
                  AI Phân loại
              </button_1.Button>

              <button_1.Button onClick={() => setIsSmartOrganizeOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                  <lucide_react_1.Waypoints className="w-4 h-4 mr-2"/> Sắp xếp
              </button_1.Button>

              <button_1.Button onClick={() => selectedFolderId && cloneBulk({ questionIds: selectedQuestionIds, destFolderId: selectedFolderId }, { onSuccess: () => clearSelection() })} disabled={isCloningBulk} variant="outline" className="border-amber-200 text-amber-700 hover:bg-amber-50">
                {isCloningBulk ? <lucide_react_1.Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <lucide_react_1.Copy className="w-4 h-4 mr-2"/>} Nhân bản
              </button_1.Button>
              <button_1.Button onClick={() => setIsBulkMoveOpen(true)} className="bg-primary hover:bg-primary/90 text-white shadow-sm">
                <lucide_react_1.FolderSync className="w-4 h-4 mr-2"/> Di chuyển
              </button_1.Button>
              <button_1.Button onClick={() => setDeleteTarget({ type: 'BULK', ids: selectedQuestionIds })} variant="destructive" className="shadow-sm">
                <lucide_react_1.Trash2 className="w-4 h-4 mr-2"/> Xóa
              </button_1.Button>
            </div>) : (<div className="flex gap-2">
              <button_1.Button onClick={() => setIsAiModalOpen(true)} className="bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-200 shadow-sm font-semibold">
                <lucide_react_1.Sparkles className="w-4 h-4 mr-2"/> AI Builder
              </button_1.Button>
              <button_1.Button onClick={() => setIsCreateOpen(true)} className="bg-slate-900 text-white hover:bg-slate-800 font-bold shadow-md">
                <lucide_react_1.PlusCircle className="w-5 h-5 mr-2"/> Tạo câu hỏi
              </button_1.Button>
            </div>)}
        </div>
      </div>

      <div className="px-4 py-2 border-b bg-slate-50 flex items-center gap-3 shrink-0">
         <lucide_react_1.Filter className="w-4 h-4 text-slate-400"/>
         <div className="w-48">
             <multi_select_1.MultiSelect options={diffOptions} selected={activePayload.difficulties || []} onChange={(vals) => setFilters({ difficulties: vals })} placeholder="Mức độ..."/>
         </div>
         <div className="w-64">
             <multi_select_1.MultiSelect options={tagOptions} selected={activePayload.tags || []} onChange={(vals) => setFilters({ tags: vals })} placeholder={availableTags.length === 0 ? "Không có Tag nào" : "Lọc theo Tags..."} disabled={isFetchingFilters}/>
         </div>
         {isFetchingFilters && <lucide_react_1.Loader2 className="w-4 h-4 animate-spin text-primary ml-2"/>}
      </div>

      <div className="px-6 py-2 border-b bg-slate-100 flex items-center justify-between text-sm text-slate-600 font-medium shrink-0">
        <div className="flex items-center gap-3">
           <checkbox_1.Checkbox checked={isAllSelected} onCheckedChange={handleToggleAll}/>
           <span>Chọn tất cả trang này</span>
        </div>
        <div>{isLoading ? 'Đang tải...' : `Tổng số ${meta?.total || 0} câu`}</div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 scrollbar-thin scrollbar-thumb-slate-300 relative">
        {isPollingActive && (<div className="absolute top-0 right-4 p-2 z-10 animate-pulse">
                <span className="text-xs font-bold text-amber-600 bg-amber-100 px-3 py-1 rounded-full shadow-sm border border-amber-200 flex items-center gap-1">
                    <lucide_react_1.RefreshCw className="w-3 h-3 animate-spin"/> Hệ thống AI đang quét...
                </span>
             </div>)}

        {isLoading ? (<div className="space-y-5">
             {[1, 2, 3].map(i => <skeleton_1.Skeleton key={i} className="h-40 w-full rounded-2xl"/>)}
          </div>) : isError ? (<div className="text-center text-destructive py-10">Đã xảy ra lỗi khi tải dữ liệu từ máy chủ.</div>) : questions.length === 0 ? (<div className="text-center py-24 text-slate-400">
             <lucide_react_1.Inbox className="w-16 h-16 mx-auto mb-4 opacity-20"/>
             <p className="text-lg">Không có câu hỏi nào khớp với bộ lọc.</p>
          </div>) : (<div className="space-y-5 pb-16">
            {questions.map((q) => {
                const qId = q._id || q.id;
                const optimisticData = aiProcessedQuestions.find(aq => aq.id === qId);
                return (<QuestionCard_1.QuestionCard key={qId} question={q} isSelected={selectedQuestionIds.includes(qId)} isProcessing={processingIds.includes(qId)} optimisticData={optimisticData} topicsMap={topicsMap} onToggle={toggleSelection} onEdit={setEditTarget} onClone={handleCloneSingle} onDelete={(id) => setDeleteTarget({ type: 'SINGLE', ids: [id] })}/>);
            })}
          </div>)}
      </div>

      {meta && meta.totalPages > 1 && (<div className="p-4 border-t flex justify-center items-center gap-4 bg-white shrink-0">
          <button_1.Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Trang trước</button_1.Button>
          <span className="text-sm font-medium">Trang {page} / {meta.totalPages}</span>
          <button_1.Button variant="outline" disabled={page === meta.totalPages} onClick={() => setPage(p => p + 1)}>Trang sau</button_1.Button>
        </div>)}
      
      
      <BulkMoveModal_1.BulkMoveModal isOpen={isBulkMoveOpen} onClose={() => setIsBulkMoveOpen(false)}/>
      <SmartOrganizeModal_1.SmartOrganizeModal isOpen={isSmartOrganizeOpen} onClose={() => setIsSmartOrganizeOpen(false)}/>
      <CreateBankQuestionSheet_1.CreateBankQuestionSheet isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)}/>
      
      {selectedFolderId && (<AiQuestionBuilderModal_1.AiQuestionBuilderModal folderId={selectedFolderId} isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)}/>)}
      
      <EditQuestionSheet_1.EditQuestionSheet question={editTarget} mode="BANK" onClose={() => setEditTarget(null)}/>
      <AiAutoTagSummaryModal_1.AiAutoTagSummaryModal originalQuestions={typedQuestions}/>

      <dialog_1.Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <dialog_1.DialogContent>
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle className="text-destructive">Cảnh báo Xóa dữ liệu</dialog_1.DialogTitle>
            <dialog_1.DialogDescription>
              Bạn đang chuẩn bị xóa vĩnh viễn <strong>{deleteTarget?.ids.length}</strong> câu hỏi. Hành động này không thể hoàn tác và sẽ tự động xóa luôn tất cả các câu hỏi con đi kèm (nếu có).
            </dialog_1.DialogDescription>
          </dialog_1.DialogHeader>
          <dialog_1.DialogFooter className="mt-4">
            <button_1.Button variant="ghost" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>Hủy</button_1.Button>
            <button_1.Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? <lucide_react_1.Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <lucide_react_1.Trash2 className="w-4 h-4 mr-2"/>} Xác nhận Xóa
            </button_1.Button>
          </dialog_1.DialogFooter>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>
    </div>);
}
//# sourceMappingURL=QuestionList.js.map