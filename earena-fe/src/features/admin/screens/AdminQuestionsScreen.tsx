'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Search, Archive, ArchiveRestore, Trash2 } from 'lucide-react';
import { adminService } from '../api/admin.service';
import { DataTable, PaginationBar } from '../components/DataTable';

export function AdminQuestionsScreen() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const params = useMemo(() => ({ page, limit: 20, search: search || undefined }), [page, search]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'questions', params],
    queryFn: () => adminService.listQuestions(params),
    staleTime: 0,
  });

  const archiveMut = useMutation({
    mutationFn: ({ id, isArchived }: { id: string; isArchived: boolean }) =>
      adminService.setQuestionArchived(id, isArchived),
    onSuccess: () => {
      toast.success('Đã cập nhật trạng thái archive');
      qc.invalidateQueries({ queryKey: ['admin', 'questions'] });
    },
    onError: (e: any) => toast.error('Thao tác thất bại', { description: e?.message }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => adminService.deleteQuestion(id),
    onSuccess: () => {
      toast.success('Đã xóa câu hỏi');
      qc.invalidateQueries({ queryKey: ['admin', 'questions'] });
    },
    onError: (e: any) => toast.error('Xóa thất bại', { description: e?.message }),
  });

  const rows = (data?.items || []).map((q) => ({
    content: (
      <div>
        <div className="font-semibold text-foreground line-clamp-2 max-w-[520px]">{q.content}</div>
        <div className="text-xs text-muted-foreground mt-1">
          {q.difficultyLevel} • tags: {(q.tags || []).slice(0, 3).join(', ') || '—'}
        </div>
      </div>
    ),
    ownerId: <div className="text-xs text-muted-foreground truncate max-w-[220px]">{q.ownerId}</div>,
    archive: (
      <button
        className={
          'inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs transition ' +
          (q.isArchived
            ? 'border-primary/20 bg-primary/10 text-primary'
            : 'border-border bg-background/60 text-muted-foreground hover:bg-accent')
        }
        onClick={() => archiveMut.mutate({ id: q._id, isArchived: !q.isArchived })}
      >
        {q.isArchived ? <ArchiveRestore className="size-4" /> : <Archive className="size-4" />}
        {q.isArchived ? 'Archived' : 'Active'}
      </button>
    ),
    actions: (
      <button
        className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs text-red-600 hover:bg-red-500/15"
        onClick={() => {
          if (confirm('Xóa vĩnh viễn câu hỏi này?')) deleteMut.mutate(q._id);
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
            className="w-[420px] max-w-full rounded-2xl border border-border bg-background/60 pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
            placeholder="Tìm theo nội dung / tag…"
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
          { key: 'content', header: 'Câu hỏi' },
          { key: 'ownerId', header: 'OwnerId', className: 'w-[240px]' },
          { key: 'archive', header: 'Archive', className: 'w-[160px]' },
          { key: 'actions', header: 'Thao tác', className: 'w-[120px]' },
        ]}
        rows={rows}
        empty={isLoading ? 'Đang tải…' : 'Chưa có câu hỏi'}
      />

      <PaginationBar page={data?.meta.page || page} totalPages={data?.meta.totalPages || 1} onPageChange={setPage} />
    </div>
  );
}
