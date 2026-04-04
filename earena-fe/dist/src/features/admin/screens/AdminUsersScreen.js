'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminUsersScreen = AdminUsersScreen;
const react_1 = require("react");
const react_query_1 = require("@tanstack/react-query");
const sonner_1 = require("sonner");
const lucide_react_1 = require("lucide-react");
const admin_service_1 = require("../api/admin.service");
const DataTable_1 = require("../components/DataTable");
const roles = ['STUDENT', 'TEACHER', 'ADMIN'];
const statuses = ['ACTIVE', 'INACTIVE', 'BANNED'];
function AdminUsersScreen() {
    const qc = (0, react_query_1.useQueryClient)();
    const [page, setPage] = (0, react_1.useState)(1);
    const [search, setSearch] = (0, react_1.useState)('');
    const [role, setRole] = (0, react_1.useState)('');
    const [status, setStatus] = (0, react_1.useState)('');
    const params = (0, react_1.useMemo)(() => ({ page, limit: 20, search: search || undefined, role: role || undefined, status: status || undefined }), [page, search, role, status]);
    const { data, isLoading } = (0, react_query_1.useQuery)({
        queryKey: ['admin', 'users', params],
        queryFn: () => admin_service_1.adminService.listUsers(params),
        staleTime: 0,
    });
    const setRoleMut = (0, react_query_1.useMutation)({
        mutationFn: ({ id, role }) => admin_service_1.adminService.updateUserRole(id, role),
        onSuccess: () => {
            sonner_1.toast.success('Đã cập nhật role');
            qc.invalidateQueries({ queryKey: ['admin', 'users'] });
        },
        onError: (e) => sonner_1.toast.error('Cập nhật role thất bại', { description: e?.message }),
    });
    const setStatusMut = (0, react_query_1.useMutation)({
        mutationFn: ({ id, status }) => admin_service_1.adminService.updateUserStatus(id, status),
        onSuccess: () => {
            sonner_1.toast.success('Đã cập nhật trạng thái');
            qc.invalidateQueries({ queryKey: ['admin', 'users'] });
        },
        onError: (e) => sonner_1.toast.error('Cập nhật trạng thái thất bại', { description: e?.message }),
    });
    const resetPassMut = (0, react_query_1.useMutation)({
        mutationFn: ({ id }) => admin_service_1.adminService.resetUserPassword(id),
        onSuccess: (res) => {
            sonner_1.toast.success('Reset mật khẩu thành công', {
                description: `Mật khẩu mới: ${res?.newPassword || res?.data?.newPassword || ''}`,
            });
        },
        onError: (e) => sonner_1.toast.error('Reset mật khẩu thất bại', { description: e?.message }),
    });
    const createMut = (0, react_query_1.useMutation)({
        mutationFn: (payload) => admin_service_1.adminService.createUser(payload),
        onSuccess: () => {
            sonner_1.toast.success('Tạo user thành công');
            qc.invalidateQueries({ queryKey: ['admin', 'users'] });
        },
        onError: (e) => sonner_1.toast.error('Tạo user thất bại', { description: e?.message }),
    });
    const onQuickCreate = () => {
        const email = window.prompt('Email user mới:');
        if (!email)
            return;
        const fullName = window.prompt('Họ tên:') || 'EArena User';
        const password = window.prompt('Mật khẩu (>= 6 ký tự):') || '';
        const role = (window.prompt('Role (STUDENT | TEACHER | ADMIN):', 'TEACHER') || 'TEACHER');
        if (!password || password.length < 6) {
            sonner_1.toast.error('Mật khẩu phải >= 6 ký tự');
            return;
        }
        createMut.mutate({ email, fullName, password, role });
    };
    const rows = (data?.items || []).map((u) => ({
        email: (<div>
        <div className="font-semibold text-foreground truncate max-w-[260px]">{u.email}</div>
        <div className="text-xs text-muted-foreground truncate max-w-[260px]">{u.fullName}</div>
      </div>),
        role: (<select className="bg-background/60 border border-border rounded-xl px-2 py-1 text-xs" defaultValue={u.role} onChange={(e) => setRoleMut.mutate({ id: u._id, role: e.target.value })}>
        {roles.map((r) => (<option key={r} value={r}>
            {r}
          </option>))}
      </select>),
        status: (<select className="bg-background/60 border border-border rounded-xl px-2 py-1 text-xs" defaultValue={u.status} onChange={(e) => setStatusMut.mutate({ id: u._id, status: e.target.value })}>
        {statuses.map((s) => (<option key={s} value={s}>
            {s}
          </option>))}
      </select>),
        actions: (<div className="flex items-center gap-2">
        <button className="rounded-xl border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs text-primary hover:bg-primary/15" onClick={() => resetPassMut.mutate({ id: u._id })} title="Reset mật khẩu">
          <lucide_react_1.RefreshCcw className="inline size-3 mr-1"/> Reset
        </button>
      </div>),
    }));
    return (<div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <lucide_react_1.Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2"/>
            <input className="w-[320px] max-w-full rounded-2xl border border-border bg-background/60 pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground" placeholder="Tìm email / họ tên…" value={search} onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
        }}/>
          </div>
          <select className="rounded-2xl border border-border bg-background/60 px-3 py-2 text-sm" value={role} onChange={(e) => {
            setPage(1);
            setRole(e.target.value);
        }}>
            <option value="">All roles</option>
            {roles.map((r) => (<option key={r} value={r}>
                {r}
              </option>))}
          </select>
          <select className="rounded-2xl border border-border bg-background/60 px-3 py-2 text-sm" value={status} onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
        }}>
            <option value="">All status</option>
            {statuses.map((s) => (<option key={s} value={s}>
                {s}
              </option>))}
          </select>
        </div>

        <button className="inline-flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/15" onClick={onQuickCreate}>
          <lucide_react_1.UserPlus className="size-4"/> Tạo user
        </button>
      </div>

      <DataTable_1.DataTable columns={[
            { key: 'email', header: 'Tài khoản' },
            { key: 'role', header: 'Role', className: 'w-[140px]' },
            { key: 'status', header: 'Trạng thái', className: 'w-[160px]' },
            { key: 'actions', header: 'Thao tác', className: 'w-[180px]' },
        ]} rows={rows} empty={isLoading ? 'Đang tải…' : 'Chưa có user'}/>

      <DataTable_1.PaginationBar page={data?.meta.page || page} totalPages={data?.meta.totalPages || 1} onPageChange={(p) => setPage(p)}/>
    </div>);
}
//# sourceMappingURL=AdminUsersScreen.js.map