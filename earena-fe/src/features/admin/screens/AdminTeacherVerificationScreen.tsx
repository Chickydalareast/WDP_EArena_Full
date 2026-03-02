'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Download, Search, BadgeCheck, BadgeX, Save } from 'lucide-react';

import { adminService } from '../api/admin.service';
import type { TeacherVerificationRow, TeacherVerificationStatus } from '../types/admin.types';
import { DataTable, PaginationBar } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { downloadCsv } from '../lib/csv';

const statuses: TeacherVerificationStatus[] = ['PENDING', 'VERIFIED', 'REJECTED'];

export function AdminTeacherVerificationScreen() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<TeacherVerificationStatus | ''>('PENDING');

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TeacherVerificationRow | null>(null);
  const [form, setForm] = useState<{ status: TeacherVerificationStatus; note: string }>({
    status: 'PENDING',
    note: '',
  });

  const params = useMemo(
    () => ({ page, limit: 20, search: search || undefined, status: (status || undefined) as any }),
    [page, search, status]
  );

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'teachers', 'verification', params],
    queryFn: () => adminService.listTeacherVerifications(params),
    staleTime: 0,
  });

  const updateMut = useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: TeacherVerificationStatus; note?: string }) =>
      adminService.updateTeacherVerification(id, { status, note }),
    onSuccess: () => {
      toast.success('Đã cập nhật trạng thái duyệt');
      qc.invalidateQueries({ queryKey: ['admin', 'teachers', 'verification'] });
    },
    onError: (e: any) => toast.error('Cập nhật thất bại', { description: e?.message }),
  });

  const openModal = (row: TeacherVerificationRow, preset?: TeacherVerificationStatus) => {
    setEditing(row);
    setForm({
      status: preset || row.teacherVerificationStatus,
      note: row.teacherVerificationNote || '',
    });
    setOpen(true);
  };

  const submit = () => {
    if (!editing) return;
    if (form.status === 'REJECTED' && !form.note.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }
    updateMut.mutate({ id: editing._id, status: form.status, note: form.note.trim() || undefined });
    setOpen(false);
  };

  const rows = (data?.items || []).map((t) => ({
    teacher: (
      <div className="flex items-center gap-3">
        <img
          src={t.avatar || 'https://ui-avatars.com/api/?name=Teacher&background=random'}
          className="size-10 rounded-xl border border-border"
          alt="avatar"
        />
        <div>
          <div className="font-semibold text-foreground truncate max-w-[260px]">{t.fullName}</div>
          <div className="text-xs text-muted-foreground truncate max-w-[260px]">{t.email}</div>
        </div>
      </div>
    ),
    status: (
      <button
        className={
          'inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-semibold transition ' +
          (t.teacherVerificationStatus === 'VERIFIED'
            ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15'
            : t.teacherVerificationStatus === 'REJECTED'
              ? 'border-red-500/20 bg-red-500/10 text-red-700 hover:bg-red-500/15'
              : 'border-border bg-background/60 text-muted-foreground hover:bg-accent hover:text-foreground')
        }
        onClick={() => openModal(t)}
        title="Cập nhật trạng thái"
      >
        {t.teacherVerificationStatus}
      </button>
    ),
    note: <div className="text-xs text-muted-foreground max-w-[420px] truncate">{t.teacherVerificationNote || '—'}</div>,
    actions: (
      <div className="flex gap-2">
        <button
          className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-700 hover:bg-emerald-500/15"
          onClick={() => {
            openModal(t, 'VERIFIED');
          }}
        >
          <BadgeCheck className="inline size-3 mr-1" /> Duyệt
        </button>
        <button
          className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs text-red-700 hover:bg-red-500/15"
          onClick={() => {
            openModal(t, 'REJECTED');
          }}
        >
          <BadgeX className="inline size-3 mr-1" /> Từ chối
        </button>
      </div>
    ),
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              className="w-[320px] max-w-full rounded-2xl border border-border bg-background/60 pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
              placeholder="Tìm email / họ tên…"
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
            />
          </div>

          <select
            className="rounded-2xl border border-border bg-background/60 px-3 py-2 text-sm"
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value as any);
            }}
          >
            <option value="">All status</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background/60 px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent"
            onClick={() =>
              downloadCsv({
                filename: 'teacher-verification',
                headers: [
                  { key: 'email', label: 'Email' },
                  { key: 'fullName', label: 'Họ tên' },
                  { key: 'status', label: 'Status' },
                  { key: 'note', label: 'Note' },
                  { key: 'verifiedAt', label: 'VerifiedAt' },
                ],
                rows: (data?.items || []).map((t) => ({
                  email: t.email,
                  fullName: t.fullName,
                  status: t.teacherVerificationStatus,
                  note: t.teacherVerificationNote || '',
                  verifiedAt: t.teacherVerifiedAt || '',
                })),
              })
            }
          >
            <Download className="size-4" /> Export CSV
          </button>
          <div className="hidden md:block text-xs text-muted-foreground">Tick xanh hiển thị ở profile/teacher card.</div>
        </div>
      </div>

      <DataTable
        columns={[
          { key: 'teacher', header: 'Giáo viên' },
          { key: 'status', header: 'Trạng thái', className: 'w-[160px]' },
          { key: 'note', header: 'Ghi chú' },
          { key: 'actions', header: 'Thao tác', className: 'w-[220px]' },
        ]}
        rows={rows}
        empty={isLoading ? 'Đang tải…' : 'Chưa có hồ sơ cần duyệt'}
      />

      <PaginationBar page={data?.meta.page || page} totalPages={data?.meta.totalPages || 1} onPageChange={setPage} />

      <Modal
        open={open}
        title="Cập nhật duyệt giáo viên"
        onClose={() => setOpen(false)}
        widthClassName="max-w-[680px]"
        footer={
          <>
            <button
              className="rounded-2xl border border-border bg-background/60 px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              Hủy
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/15"
              onClick={submit}
              disabled={updateMut.isPending}
            >
              <Save className="size-4" /> Lưu
            </button>
          </>
        }
      >
        {!editing ? (
          <div className="text-sm text-muted-foreground">Chọn 1 giáo viên để cập nhật.</div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={editing.avatar || 'https://ui-avatars.com/api/?name=Teacher&background=random'}
                className="size-12 rounded-2xl border border-border"
                alt="avatar"
              />
              <div>
                <div className="text-sm font-semibold text-foreground">{editing.fullName}</div>
                <div className="text-xs text-muted-foreground">{editing.email}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-semibold text-muted-foreground">Trạng thái</div>
                <select
                  className="mt-1 w-full rounded-2xl border border-border bg-background/60 px-3 py-2 text-sm"
                  value={form.status}
                  onChange={(e) => setForm((s) => ({ ...s, status: e.target.value as TeacherVerificationStatus }))}
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="text-xs font-semibold text-muted-foreground">Gợi ý</div>
                <div className="mt-2 text-xs text-muted-foreground">
                  VERIFIED: cấp tick xanh • REJECTED: cần lý do
                </div>
              </div>
              <div className="md:col-span-2">
                <div className="text-xs font-semibold text-muted-foreground">Ghi chú / lý do</div>
                <textarea
                  className="mt-1 w-full min-h-[120px] rounded-2xl border border-border bg-background/60 px-3 py-2 text-sm"
                  value={form.note}
                  onChange={(e) => setForm((s) => ({ ...s, note: e.target.value }))}
                  placeholder={form.status === 'REJECTED' ? 'Nhập lý do từ chối…' : 'Ghi chú (optional)…'}
                />
                {form.status === 'REJECTED' && !form.note.trim() ? (
                  <div className="mt-1 text-xs text-red-600">Lý do từ chối là bắt buộc.</div>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
