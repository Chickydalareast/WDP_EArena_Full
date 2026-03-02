'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Search, Lock, Unlock, Trash2 } from 'lucide-react';
import { adminService } from '../api/admin.service';
import { DataTable, PaginationBar } from '../components/DataTable';

export function AdminClassesScreen() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const params = useMemo(() => ({ page, limit: 20, search: search || undefined }), [page, search]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'classes', params],
    queryFn: () => adminService.listClasses(params),
    staleTime: 0,
  });

  const lockMut = useMutation({
    mutationFn: ({ id, isLocked }: { id: string; isLocked: boolean }) => adminService.setClassLocked(id, isLocked),
    onSuccess: () => {
      toast.success('Đã cập nhật trạng thái khóa');
      qc.invalidateQueries({ queryKey: ['admin', 'classes'] });
    },
    onError: (e: any) => toast.error('Thao tác thất bại', { description: e?.message }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => adminService.deleteClass(id),
    onSuccess: () => {
      toast.success('Đã xóa lớp học');
      qc.invalidateQueries({ queryKey: ['admin', 'classes'] });
    },
    onError: (e: any) => toast.error('Xóa thất bại', { description: e?.message }),
  });

  const rows = (data?.items || []).map((c) => ({
    name: (
      <div>
        <div className="font-semibold text-foreground truncate max-w-[420px]">{c.name}</div>
        <div className="text-xs text-muted-foreground">
          Code: {c.code} • {c.isPublic ? 'Public' : 'Private'}
        </div>
      </div>
    ),
    teacherId: <div className="text-xs text-muted-foreground truncate max-w-[220px]">{c.teacherId}</div>,
    lock: (
      <button
        className={
          'inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs transition ' +
          (c.isLocked
            ? 'border-primary/20 bg-primary/10 text-primary'
            : 'border-border bg-background/60 text-muted-foreground hover:bg-accent')
        }
        onClick={() => lockMut.mutate({ id: c._id, isLocked: !c.isLocked })}
      >
        {c.isLocked ? <Lock className="size-4" /> : <Unlock className="size-4" />}
        {c.isLocked ? 'Locked' : 'Open'}
      </button>
    ),
    actions: (
      <button
        className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs text-red-600 hover:bg-red-500/15"
        onClick={() => {
          if (confirm('Xóa vĩnh viễn lớp học này?')) deleteMut.mutate(c._id);
        }}
      >
        <Trash2 className="size-4" /> Xóa
      </button>
    ),
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            className="w-[380px] max-w-full rounded-2xl border border-border bg-background/60 pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
            placeholder="Tìm theo name/description/code…"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
        </div>
      </div>

      <DataTable
        columns={[
          { key: 'name', header: 'Lớp học' },
          { key: 'teacherId', header: 'TeacherId', className: 'w-[240px]' },
          { key: 'lock', header: 'Khóa', className: 'w-[160px]' },
          { key: 'actions', header: 'Thao tác', className: 'w-[120px]' },
        ]}
        rows={rows}
        empty={isLoading ? 'Đang tải…' : 'Chưa có lớp học'}
      />

      <PaginationBar page={data?.meta.page || page} totalPages={data?.meta.totalPages || 1} onPageChange={setPage} />
    </div>
  );
}
