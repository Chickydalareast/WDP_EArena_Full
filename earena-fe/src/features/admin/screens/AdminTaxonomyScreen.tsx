'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Download, FolderTree, Pencil, Plus, Save, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';

import { adminService } from '../api/admin.service';
import { DataTable } from '../components/DataTable';
import type { KnowledgeTopic, Subject } from '../types/admin.types';
import { Modal } from '../components/Modal';
import { downloadCsv } from '../lib/csv';

export function AdminTaxonomyScreen() {
  const qc = useQueryClient();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');

  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [subjectEditing, setSubjectEditing] = useState<Subject | null>(null);
  const [subjectForm, setSubjectForm] = useState({ name: '', code: '', isActive: true });

  const [topicModalOpen, setTopicModalOpen] = useState(false);
  const [topicEditing, setTopicEditing] = useState<KnowledgeTopic | null>(null);
  const [topicForm, setTopicForm] = useState({ name: '', level: 1, parentId: '' });

  const { data: subjects, isLoading: subjectsLoading } = useQuery({
    queryKey: ['admin', 'subjects'],
    queryFn: adminService.listSubjects,
    staleTime: 0,
  });

  const { data: topics, isLoading: topicsLoading } = useQuery({
    queryKey: ['admin', 'topics', selectedSubjectId],
    queryFn: () => (selectedSubjectId ? adminService.listTopicsBySubject(selectedSubjectId) : Promise.resolve([])),
    enabled: !!selectedSubjectId,
    staleTime: 0,
  });

  const createSubjectMut = useMutation({
    mutationFn: (p: any) => adminService.createSubject(p),
    onSuccess: () => {
      toast.success('Đã tạo môn học');
      qc.invalidateQueries({ queryKey: ['admin', 'subjects'] });
    },
    onError: (e: any) => toast.error('Tạo thất bại', { description: e?.message }),
  });

  const updateSubjectMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => adminService.updateSubject(id, payload),
    onSuccess: () => {
      toast.success('Đã cập nhật môn học');
      qc.invalidateQueries({ queryKey: ['admin', 'subjects'] });
    },
    onError: (e: any) => toast.error('Cập nhật thất bại', { description: e?.message }),
  });

  const createTopicMut = useMutation({
    mutationFn: (p: any) => adminService.createTopic(p),
    onSuccess: () => {
      toast.success('Đã tạo node kiến thức');
      qc.invalidateQueries({ queryKey: ['admin', 'topics', selectedSubjectId] });
    },
    onError: (e: any) => toast.error('Tạo thất bại', { description: e?.message }),
  });

  const updateTopicMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => adminService.updateTopic(id, payload),
    onSuccess: () => {
      toast.success('Đã cập nhật node');
      qc.invalidateQueries({ queryKey: ['admin', 'topics', selectedSubjectId] });
    },
    onError: (e: any) => toast.error('Cập nhật thất bại', { description: e?.message }),
  });

  const deleteTopicMut = useMutation({
    mutationFn: (id: string) => adminService.deleteTopic(id),
    onSuccess: () => {
      toast.success('Đã xóa node');
      qc.invalidateQueries({ queryKey: ['admin', 'topics', selectedSubjectId] });
    },
    onError: (e: any) => toast.error('Xóa thất bại', { description: e?.message }),
  });

  const openCreateSubject = () => {
    setSubjectEditing(null);
    setSubjectForm({ name: '', code: '', isActive: true });
    setSubjectModalOpen(true);
  };

  const openEditSubject = (s: Subject) => {
    setSubjectEditing(s);
    setSubjectForm({ name: s.name, code: s.code, isActive: s.isActive });
    setSubjectModalOpen(true);
  };

  const submitSubject = () => {
    if (!subjectForm.name.trim()) return toast.error('Vui lòng nhập tên môn học');
    if (!subjectForm.code.trim()) return toast.error('Vui lòng nhập mã môn');

    const payload = {
      name: subjectForm.name.trim(),
      code: subjectForm.code.trim().toUpperCase(),
      isActive: subjectForm.isActive,
    };

    if (subjectEditing) {
      updateSubjectMut.mutate({ id: subjectEditing._id, payload });
    } else {
      createSubjectMut.mutate(payload);
    }
    setSubjectModalOpen(false);
  };

  const openCreateTopic = () => {
    if (!selectedSubjectId) {
      toast.error('Hãy chọn 1 môn học trước');
      return;
    }
    setTopicEditing(null);
    setTopicForm({ name: '', level: 1, parentId: '' });
    setTopicModalOpen(true);
  };

  const openEditTopic = (t: KnowledgeTopic) => {
    setTopicEditing(t);
    setTopicForm({ name: t.name, level: t.level, parentId: (t.parentId || '') as any });
    setTopicModalOpen(true);
  };

  const submitTopic = () => {
    if (!selectedSubjectId) return toast.error('Chọn môn học trước');
    if (!topicForm.name.trim()) return toast.error('Vui lòng nhập tên node');
    if (topicForm.level < 1 || topicForm.level > 3) return toast.error('Level phải từ 1-3');

    const payload = {
      name: topicForm.name.trim(),
      level: Number(topicForm.level),
      parentId: topicForm.parentId.trim() ? topicForm.parentId.trim() : null,
    };

    if (topicEditing) {
      updateTopicMut.mutate({ id: topicEditing._id, payload });
    } else {
      createTopicMut.mutate({ subjectId: selectedSubjectId, ...payload, parentId: payload.parentId || undefined });
    }
    setTopicModalOpen(false);
  };

  const subjectRows = (subjects || []).map((s: Subject) => ({
    subject: (
      <button
        className={
          'text-left w-full ' +
          (selectedSubjectId === s._id ? 'text-primary' : 'text-foreground hover:text-primary')
        }
        onClick={() => setSelectedSubjectId(s._id)}
      >
        <div className="font-semibold">{s.name}</div>
        <div className="text-xs text-muted-foreground">{s.code}</div>
      </button>
    ),
    active: (
      <div className="flex items-center gap-2 justify-end">
        <button
          className={
            'inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs transition ' +
            (s.isActive
              ? 'border-primary/20 bg-primary/10 text-primary'
              : 'border-border bg-background/60 text-muted-foreground hover:bg-accent')
          }
          onClick={() => updateSubjectMut.mutate({ id: s._id, payload: { isActive: !s.isActive } })}
          title="Bật/Tắt môn"
        >
          {s.isActive ? <ToggleRight className="size-4" /> : <ToggleLeft className="size-4" />}
          {s.isActive ? 'Active' : 'Inactive'}
        </button>
        <button
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/60 px-3 py-1.5 text-xs text-foreground hover:bg-accent"
          onClick={() => openEditSubject(s)}
          title="Sửa môn"
        >
          <Pencil className="size-3" /> Sửa
        </button>
      </div>
    ),
  }));

  const topicRows = (topics || []).map((t: KnowledgeTopic) => ({
    topic: (
      <div>
        <div className="font-semibold text-foreground">{t.name}</div>
        <div className="text-xs text-muted-foreground">Level: {t.level} • Parent: {t.parentId || '—'}</div>
      </div>
    ),
    actions: (
      <div className="flex items-center gap-2 justify-end">
        <button
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/60 px-3 py-1.5 text-xs text-foreground hover:bg-accent"
          onClick={() => openEditTopic(t)}
        >
          <Pencil className="size-3" /> Sửa
        </button>
        <button
          className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs text-red-600 hover:bg-red-500/15"
          onClick={() => {
            if (confirm('Xóa node này? (Không xóa được nếu có node con)')) deleteTopicMut.mutate(t._id);
          }}
        >
          <Trash2 className="size-4" /> Xóa
        </button>
      </div>
    ),
  }));

  const topicOptions = useMemo(() => (topics || []) as KnowledgeTopic[], [topics]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderTree className="size-4 text-primary" />
            <div className="font-bold">Môn học</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background/60 px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent"
              onClick={() =>
                downloadCsv({
                  filename: 'subjects',
                  headers: [
                    { key: 'code', label: 'Code' },
                    { key: 'name', label: 'Tên' },
                    { key: 'isActive', label: 'Active' },
                  ],
                  rows: (subjects || []).map((s: Subject) => ({
                    code: s.code,
                    name: s.name,
                    isActive: s.isActive ? 'TRUE' : 'FALSE',
                  })),
                })
              }
            >
              <Download className="size-4" /> Export
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/15"
              onClick={openCreateSubject}
            >
              <Plus className="size-4" /> Thêm môn
            </button>
          </div>
        </div>

        <DataTable
          columns={[
            { key: 'subject', header: 'Môn học' },
            { key: 'active', header: 'Trạng thái', className: 'w-[160px]' },
          ]}
          rows={subjectRows}
          empty={subjectsLoading ? 'Đang tải…' : 'Chưa có môn học'}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-bold">Cây kiến thức</div>
            <div className="text-xs text-muted-foreground">Chọn môn học để xem & quản trị node</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background/60 px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent disabled:opacity-50"
              disabled={!selectedSubjectId}
              onClick={() =>
                downloadCsv({
                  filename: 'topics',
                  headers: [
                    { key: 'subjectId', label: 'SubjectId' },
                    { key: '_id', label: 'TopicId' },
                    { key: 'name', label: 'Tên' },
                    { key: 'level', label: 'Level' },
                    { key: 'parentId', label: 'ParentId' },
                  ],
                  rows: (topics || []).map((t: KnowledgeTopic) => ({
                    subjectId: t.subjectId,
                    _id: t._id,
                    name: t.name,
                    level: t.level,
                    parentId: t.parentId || '',
                  })),
                })
              }
            >
              <Download className="size-4" /> Export
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/15 disabled:opacity-50"
              onClick={openCreateTopic}
              disabled={!selectedSubjectId}
            >
              <Plus className="size-4" /> Thêm node
            </button>
          </div>
        </div>

        <DataTable
          columns={[
            { key: 'topic', header: 'Node' },
            { key: 'actions', header: 'Thao tác', className: 'w-[140px]' },
          ]}
          rows={topicRows}
          empty={!selectedSubjectId ? 'Chọn môn học bên trái để xem node' : topicsLoading ? 'Đang tải…' : 'Chưa có node'}
        />
      </div>

      <Modal
        open={subjectModalOpen}
        title={subjectEditing ? 'Cập nhật môn học' : 'Tạo môn học'}
        onClose={() => setSubjectModalOpen(false)}
        footer={
          <>
            <button
              className="rounded-2xl border border-border bg-background/60 px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
              onClick={() => setSubjectModalOpen(false)}
            >
              Hủy
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/15"
              onClick={submitSubject}
            >
              <Save className="size-4" /> Lưu
            </button>
          </>
        }
        widthClassName="max-w-[560px]"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <div className="text-xs font-semibold text-muted-foreground">Tên môn</div>
            <input
              className="mt-1 w-full rounded-2xl border border-border bg-background/60 px-3 py-2 text-sm"
              value={subjectForm.name}
              onChange={(e) => setSubjectForm((s) => ({ ...s, name: e.target.value }))}
              placeholder="Ví dụ: Toán"
            />
          </div>
          <div>
            <div className="text-xs font-semibold text-muted-foreground">Mã môn</div>
            <input
              className="mt-1 w-full rounded-2xl border border-border bg-background/60 px-3 py-2 text-sm"
              value={subjectForm.code}
              onChange={(e) => setSubjectForm((s) => ({ ...s, code: e.target.value }))}
              placeholder="TOAN"
            />
          </div>
          <div>
            <div className="text-xs font-semibold text-muted-foreground">Trạng thái</div>
            <label className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={subjectForm.isActive}
                onChange={(e) => setSubjectForm((s) => ({ ...s, isActive: e.target.checked }))}
              />
              Active
            </label>
          </div>
        </div>
      </Modal>

      <Modal
        open={topicModalOpen}
        title={topicEditing ? 'Cập nhật node kiến thức' : 'Tạo node kiến thức'}
        onClose={() => setTopicModalOpen(false)}
        footer={
          <>
            <button
              className="rounded-2xl border border-border bg-background/60 px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
              onClick={() => setTopicModalOpen(false)}
            >
              Hủy
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/15"
              onClick={submitTopic}
            >
              <Save className="size-4" /> Lưu
            </button>
          </>
        }
        widthClassName="max-w-[680px]"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <div className="text-xs font-semibold text-muted-foreground">Tên node</div>
            <input
              className="mt-1 w-full rounded-2xl border border-border bg-background/60 px-3 py-2 text-sm"
              value={topicForm.name}
              onChange={(e) => setTopicForm((s) => ({ ...s, name: e.target.value }))}
              placeholder="Ví dụ: Hàm số bậc nhất"
            />
          </div>
          <div>
            <div className="text-xs font-semibold text-muted-foreground">Level</div>
            <select
              className="mt-1 w-full rounded-2xl border border-border bg-background/60 px-3 py-2 text-sm"
              value={topicForm.level}
              onChange={(e) => setTopicForm((s) => ({ ...s, level: Number(e.target.value) }))}
            >
              {[1, 2, 3].map((lv) => (
                <option key={lv} value={lv}>
                  {lv}
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className="text-xs font-semibold text-muted-foreground">Parent (optional)</div>
            <select
              className="mt-1 w-full rounded-2xl border border-border bg-background/60 px-3 py-2 text-sm"
              value={topicForm.parentId}
              onChange={(e) => setTopicForm((s) => ({ ...s, parentId: e.target.value }))}
            >
              <option value="">— Root —</option>
              {topicOptions
                .filter((t) => !topicEditing || t._id !== topicEditing._id)
                .map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name} (L{t.level})
                  </option>
                ))}
            </select>
            <div className="mt-1 text-[11px] text-muted-foreground">Chọn node cha để tạo cấu trúc cây.</div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
