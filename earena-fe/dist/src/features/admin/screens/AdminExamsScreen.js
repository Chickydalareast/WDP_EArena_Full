'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminExamsScreen = AdminExamsScreen;
const react_1 = require("react");
const react_query_1 = require("@tanstack/react-query");
const sonner_1 = require("sonner");
const lucide_react_1 = require("lucide-react");
const admin_service_1 = require("../api/admin.service");
const DataTable_1 = require("../components/DataTable");
function AdminExamsScreen() {
    const qc = (0, react_query_1.useQueryClient)();
    const [page, setPage] = (0, react_1.useState)(1);
    const [search, setSearch] = (0, react_1.useState)('');
    const [type, setType] = (0, react_1.useState)('');
    const params = (0, react_1.useMemo)(() => ({ page, limit: 20, search: search || undefined, type: type || undefined }), [page, search, type]);
    const { data, isLoading } = (0, react_query_1.useQuery)({
        queryKey: ['admin', 'exams', params],
        queryFn: () => admin_service_1.adminService.listExams(params),
        staleTime: 0,
    });
    const publishMut = (0, react_query_1.useMutation)({
        mutationFn: ({ id, isPublished }) => admin_service_1.adminService.setExamPublish(id, isPublished),
        onSuccess: () => {
            sonner_1.toast.success('Đã cập nhật trạng thái publish');
            qc.invalidateQueries({ queryKey: ['admin', 'exams'] });
        },
        onError: (e) => sonner_1.toast.error('Thao tác thất bại', { description: e?.message }),
    });
    const deleteMut = (0, react_query_1.useMutation)({
        mutationFn: (id) => admin_service_1.adminService.deleteExam(id),
        onSuccess: () => {
            sonner_1.toast.success('Đã xóa đề thi');
            qc.invalidateQueries({ queryKey: ['admin', 'exams'] });
        },
        onError: (e) => sonner_1.toast.error('Xóa thất bại', { description: e?.message }),
    });
    const rows = (data?.items || []).map((e) => ({
        title: (<div>
        <div className="font-semibold text-foreground truncate max-w-[420px]">{e.title}</div>
        <div className="text-xs text-muted-foreground">
          {e.type} • {e.duration} phút • {e.totalScore} điểm
        </div>
      </div>),
        teacherId: <div className="text-xs text-muted-foreground truncate max-w-[220px]">{e.teacherId}</div>,
        publish: (<button className={'inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs transition ' +
                (e.isPublished
                    ? 'border-primary/20 bg-primary/10 text-primary'
                    : 'border-border bg-background/60 text-muted-foreground hover:bg-accent')} onClick={() => publishMut.mutate({ id: e._id, isPublished: !e.isPublished })} title="Toggle publish">
        {e.isPublished ? <lucide_react_1.ToggleRight className="size-4"/> : <lucide_react_1.ToggleLeft className="size-4"/>}
        {e.isPublished ? 'Published' : 'Draft'}
      </button>),
        actions: (<button className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs text-red-600 hover:bg-red-500/15" onClick={() => {
                if (confirm('Xóa vĩnh viễn đề thi này?'))
                    deleteMut.mutate(e._id);
            }}>
        <lucide_react_1.Trash2 className="size-4"/> Xóa
      </button>),
    }));
    return (<div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <lucide_react_1.Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2"/>
            <input className="w-[380px] max-w-full rounded-2xl border border-border bg-background/60 pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground" placeholder="Tìm theo title/description…" value={search} onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
        }}/>
          </div>
          <select className="rounded-2xl border border-border bg-background/60 px-3 py-2 text-sm" value={type} onChange={(e) => {
            setPage(1);
            setType(e.target.value);
        }}>
            <option value="">All types</option>
            <option value="OFFICIAL">OFFICIAL</option>
            <option value="PRACTICE">PRACTICE</option>
          </select>
        </div>
      </div>

      <DataTable_1.DataTable columns={[
            { key: 'title', header: 'Đề thi' },
            { key: 'teacherId', header: 'TeacherId', className: 'w-[240px]' },
            { key: 'publish', header: 'Publish', className: 'w-[160px]' },
            { key: 'actions', header: 'Thao tác', className: 'w-[120px]' },
        ]} rows={rows} empty={isLoading ? 'Đang tải…' : 'Chưa có đề thi'}/>

      <DataTable_1.PaginationBar page={data?.meta.page || page} totalPages={data?.meta.totalPages || 1} onPageChange={setPage}/>
    </div>);
}
//# sourceMappingURL=AdminExamsScreen.js.map