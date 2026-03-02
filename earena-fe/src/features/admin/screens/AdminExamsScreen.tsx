'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Search, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { adminService } from '../api/admin.service';
import { DataTable, PaginationBar } from '../components/DataTable';

export function AdminExamsScreen() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [type, setType] = useState<'OFFICIAL' | 'PRACTICE' | ''>('');

  const params = useMemo(
    () => ({ page, limit: 20, search: search || undefined, type: type || undefined }),
    [page, search, type]
  );

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'exams', params],
    queryFn: () => adminService.listExams(params),
    staleTime: 0,
  });

  const publishMut = useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) =>
      adminService.setExamPublish(id, isPublished),
    onSuccess: () => {
      toast.success('Đã cập nhật trạng thái publish');
      qc.invalidateQueries({ queryKey: ['admin', 'exams'] });
    },
    onError: (e: any) => toast.error('Thao tác thất bại', { description: e?.message }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => adminService.deleteExam(id),
    onSuccess: () => {
      toast.success('Đã xóa đề thi');
      qc.invalidateQueries({ queryKey: ['admin', 'exams'] });
    },
    onError: (e: any) => toast.error('Xóa thất bại', { description: e?.message }),
  });

  const rows = (data?.items || []).map((e) => ({
    title: (
      <div>
        <div className="font-semibold text-foreground truncate max-w-[420px]">{e.title}</div>
        <div className="text-xs text-muted-foreground">
          {e.type} • {e.duration} phút • {e.totalScore} điểm
        </div>
      </div>
    ),
    teacherId: <div className="text-xs text-muted-foreground truncate max-w-[220px]">{e.teacherId}</div>,
    publish: (
      <button
        className={
          'inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs transition ' +
          (e.isPublished
            ? 'border-primary/20 bg-primary/10 text-primary'
            : 'border-border bg-background/60 text-muted-foreground hover:bg-accent')
        }
        onClick={() => publishMut.mutate({ id: e._id, isPublished: !e.isPublished })}
        title="Toggle publish"
      >
        {e.isPublished ? <ToggleRight className="size-4" /> : <ToggleLeft className="size-4" />}
        {e.isPublished ? 'Published' : 'Draft'}
      </button>
    ),
    actions: (
      <button
        className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs text-red-600 hover:bg-red-500/15"
        onClick={() => {
          if (confirm('Xóa vĩnh viễn đề thi này?')) deleteMut.mutate(e._id);
        }}
      >
        <Trash2 className="size-4" /> Xóa
      </button>
    ),
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              className="w-[380px] max-w-full rounded-2xl border border-border bg-background/60 pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
              placeholder="Tìm theo title/description…"
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
            />
          </div>
          <select
            className="rounded-2xl border border-border bg-background/60 px-3 py-2 text-sm"
            value={type}
            onChange={(e) => {
              setPage(1);
              setType(e.target.value as any);
            }}
          >
            <option value="">All types</option>
            <option value="OFFICIAL">OFFICIAL</option>
            <option value="PRACTICE">PRACTICE</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={[
          { key: 'title', header: 'Đề thi' },
          { key: 'teacherId', header: 'TeacherId', className: 'w-[240px]' },
          { key: 'publish', header: 'Publish', className: 'w-[160px]' },
          { key: 'actions', header: 'Thao tác', className: 'w-[120px]' },
        ]}
        rows={rows}
        empty={isLoading ? 'Đang tải…' : 'Chưa có đề thi'}
      />

      <PaginationBar page={data?.meta.page || page} totalPages={data?.meta.totalPages || 1} onPageChange={setPage} />
    </div>
  );
}
