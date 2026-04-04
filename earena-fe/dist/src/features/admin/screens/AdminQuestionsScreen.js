'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminQuestionsScreen = AdminQuestionsScreen;
const react_1 = require("react");
const react_query_1 = require("@tanstack/react-query");
const sonner_1 = require("sonner");
const lucide_react_1 = require("lucide-react");
const admin_service_1 = require("../api/admin.service");
const DataTable_1 = require("../components/DataTable");
function AdminQuestionsScreen() {
    const qc = (0, react_query_1.useQueryClient)();
    const [page, setPage] = (0, react_1.useState)(1);
    const [search, setSearch] = (0, react_1.useState)('');
    const params = (0, react_1.useMemo)(() => ({ page, limit: 20, search: search || undefined }), [page, search]);
    const { data, isLoading } = (0, react_query_1.useQuery)({
        queryKey: ['admin', 'questions', params],
        queryFn: () => admin_service_1.adminService.listQuestions(params),
        staleTime: 0,
    });
    const archiveMut = (0, react_query_1.useMutation)({
        mutationFn: ({ id, isArchived }) => admin_service_1.adminService.setQuestionArchived(id, isArchived),
        onSuccess: () => {
            sonner_1.toast.success('Đã cập nhật trạng thái archive');
            qc.invalidateQueries({ queryKey: ['admin', 'questions'] });
        },
        onError: (e) => sonner_1.toast.error('Thao tác thất bại', { description: e?.message }),
    });
    const deleteMut = (0, react_query_1.useMutation)({
        mutationFn: (id) => admin_service_1.adminService.deleteQuestion(id),
        onSuccess: () => {
            sonner_1.toast.success('Đã xóa câu hỏi');
            qc.invalidateQueries({ queryKey: ['admin', 'questions'] });
        },
        onError: (e) => sonner_1.toast.error('Xóa thất bại', { description: e?.message }),
    });
    const rows = (data?.items || []).map((q) => ({
        content: (<div>
        <div className="font-semibold text-foreground line-clamp-2 max-w-[520px]">{q.content}</div>
        <div className="text-xs text-muted-foreground mt-1">
          {q.difficultyLevel} • tags: {(q.tags || []).slice(0, 3).join(', ') || '—'}
        </div>
      </div>),
        ownerId: <div className="text-xs text-muted-foreground truncate max-w-[220px]">{q.ownerId}</div>,
        archive: (<button className={'inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs transition ' +
                (q.isArchived
                    ? 'border-primary/20 bg-primary/10 text-primary'
                    : 'border-border bg-background/60 text-muted-foreground hover:bg-accent')} onClick={() => archiveMut.mutate({ id: q._id, isArchived: !q.isArchived })}>
        {q.isArchived ? <lucide_react_1.ArchiveRestore className="size-4"/> : <lucide_react_1.Archive className="size-4"/>}
        {q.isArchived ? 'Archived' : 'Active'}
      </button>),
        actions: (<button className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs text-red-600 hover:bg-red-500/15" onClick={() => {
                if (confirm('Xóa vĩnh viễn câu hỏi này?'))
                    deleteMut.mutate(q._id);
            }}>
        <lucide_react_1.Trash2 className="size-4"/> Xóa
      </button>),
    }));
    return (<div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative">
          <lucide_react_1.Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2"/>
          <input className="w-[420px] max-w-full rounded-2xl border border-border bg-background/60 pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground" placeholder="Tìm theo nội dung / tag…" value={search} onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
        }}/>
        </div>
      </div>

      <DataTable_1.DataTable columns={[
            { key: 'content', header: 'Câu hỏi' },
            { key: 'ownerId', header: 'OwnerId', className: 'w-[240px]' },
            { key: 'archive', header: 'Archive', className: 'w-[160px]' },
            { key: 'actions', header: 'Thao tác', className: 'w-[120px]' },
        ]} rows={rows} empty={isLoading ? 'Đang tải…' : 'Chưa có câu hỏi'}/>

      <DataTable_1.PaginationBar page={data?.meta.page || page} totalPages={data?.meta.totalPages || 1} onPageChange={setPage}/>
    </div>);
}
//# sourceMappingURL=AdminQuestionsScreen.js.map