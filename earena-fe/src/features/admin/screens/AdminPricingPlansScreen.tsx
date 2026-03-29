'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Download, Pencil, Plus, Save } from 'lucide-react';

import { adminService } from '../api/admin.service';
import type { PricingPlan, PricingPlanCode } from '../types/admin.types';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { downloadCsv } from '../lib/csv';

const codes: PricingPlanCode[] = ['FREE', 'PRO', 'ENTERPRISE'];

export function AdminPricingPlansScreen() {
  const qc = useQueryClient();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PricingPlan | null>(null);
  const [form, setForm] = useState({
    name: '',
    code: 'PRO' as PricingPlanCode,
    priceMonthly: 99000,
    priceYearly: 999000,
    isActive: true,
    benefitsText: 'Làm đề không giới hạn\nThống kê nâng cao',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'pricing-plans'],
    queryFn: adminService.listPricingPlans,
    staleTime: 0,
  });

  const createMut = useMutation({
    mutationFn: adminService.createPricingPlan,
    onSuccess: () => {
      toast.success('Đã tạo gói');
      qc.invalidateQueries({ queryKey: ['admin', 'pricing-plans'] });
    },
    onError: (e: any) => toast.error('Tạo gói thất bại', { description: e?.message }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => adminService.updatePricingPlan(id, payload),
    onSuccess: () => {
      toast.success('Đã cập nhật gói');
      qc.invalidateQueries({ queryKey: ['admin', 'pricing-plans'] });
    },
    onError: (e: any) => toast.error('Cập nhật thất bại', { description: e?.message }),
  });

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: '',
      code: 'PRO',
      priceMonthly: 99000,
      priceYearly: 999000,
      isActive: true,
      benefitsText: 'Làm đề không giới hạn\nThống kê nâng cao',
    });
    setOpen(true);
  };

  const openEdit = (p: PricingPlan) => {
    setEditing(p);
    setForm({
      name: p.name,
      code: p.code,
      priceMonthly: p.priceMonthly,
      priceYearly: p.priceYearly,
      isActive: p.isActive,
      benefitsText: (p.benefits || []).join('\n'),
    });
    setOpen(true);
  };

  const benefits = useMemo(
    () =>
      form.benefitsText
        .split(/\n|;/g)
        .map((x) => x.trim())
        .filter(Boolean),
    [form.benefitsText]
  );

  const onSubmit = () => {
    if (!form.name.trim()) {
      toast.error('Vui lòng nhập tên gói');
      return;
    }
    if (!codes.includes(form.code)) {
      toast.error('Code không hợp lệ');
      return;
    }
    if (Number.isNaN(Number(form.priceMonthly)) || Number(form.priceMonthly) < 0) {
      toast.error('Giá tháng không hợp lệ');
      return;
    }
    if (Number.isNaN(Number(form.priceYearly)) || Number(form.priceYearly) < 0) {
      toast.error('Giá năm không hợp lệ');
      return;
    }

    const payload = {
      name: form.name.trim(),
      code: form.code,
      priceMonthly: Number(form.priceMonthly),
      priceYearly: Number(form.priceYearly),
      benefits,
      isActive: form.isActive,
    };

    if (editing) {
      updateMut.mutate({ id: editing._id, payload });
    } else {
      createMut.mutate(payload);
    }
    setOpen(false);
  };

  const rows = (data || []).map((p: PricingPlan) => ({
    name: (
      <div>
        <div className="font-semibold text-foreground">{p.name}</div>
        <div className="text-xs text-muted-foreground">{p.code}</div>
      </div>
    ),
    price: (
      <div className="text-sm text-foreground">
        <div>
          Tháng: <b>{p.priceMonthly.toLocaleString()} VND</b>
        </div>
        <div className="text-xs text-muted-foreground">Năm: {p.priceYearly.toLocaleString()} VND</div>
      </div>
    ),
    active: (
      <label className="inline-flex items-center gap-2 text-xs">
        <input
          type="checkbox"
          defaultChecked={p.isActive}
          onChange={(e) => updateMut.mutate({ id: p._id, payload: { isActive: e.target.checked } })}
        />
        <span className="text-muted-foreground">Active</span>
      </label>
    ),
    benefits: (
      <div className="text-xs text-foreground">
        {(p.benefits || []).slice(0, 3).map((b, i) => (
          <div key={i}>• {b}</div>
        ))}
        {(p.benefits || []).length > 3 ? (
          <div className="text-muted-foreground">+{p.benefits.length - 3} more</div>
        ) : null}
      </div>
    ),
    actions: (
      <button
        className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs text-primary hover:bg-primary/15"
        onClick={() => openEdit(p)}
      >
        <Pencil className="size-3" /> Sửa
      </button>
    ),
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">Quản lý giá và quyền lợi gói Pro/Enterprise.</div>
        <div className="flex items-center gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background/60 px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent"
            onClick={() =>
              downloadCsv({
                filename: 'pricing-plans',
                headers: [
                  { key: 'code', label: 'Code' },
                  { key: 'name', label: 'Tên' },
                  { key: 'priceMonthly', label: 'Giá tháng' },
                  { key: 'priceYearly', label: 'Giá năm' },
                  { key: 'isActive', label: 'Active' },
                  { key: 'benefits', label: 'Quyền lợi' },
                ],
                rows: (data || []).map((p: PricingPlan) => ({
                  code: p.code,
                  name: p.name,
                  priceMonthly: p.priceMonthly,
                  priceYearly: p.priceYearly,
                  isActive: p.isActive ? 'TRUE' : 'FALSE',
                  benefits: (p.benefits || []).join(' | '),
                })),
              })
            }
          >
            <Download className="size-4" /> Export CSV
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/15"
            onClick={openCreate}
          >
            <Plus className="size-4" /> Tạo gói
          </button>
        </div>
      </div>

      <DataTable
        columns={[
          { key: 'name', header: 'Gói' },
          { key: 'price', header: 'Giá', className: 'w-[220px]' },
          { key: 'active', header: 'Trạng thái', className: 'w-[140px]' },
          { key: 'benefits', header: 'Quyền lợi' },
          { key: 'actions', header: 'Thao tác', className: 'w-[140px]' },
        ]}
        rows={rows}
        empty={isLoading ? 'Đang tải…' : 'Chưa có pricing plan'}
      />

      <Modal
        open={open}
        title={editing ? 'Cập nhật gói dịch vụ' : 'Tạo gói dịch vụ'}
        onClose={() => setOpen(false)}
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
              onClick={onSubmit}
              disabled={createMut.isPending || updateMut.isPending}
            >
              <Save className="size-4" /> Lưu
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-semibold text-muted-foreground">Tên gói</div>
            <input
              className="mt-1 w-full rounded-2xl border border-border bg-background/60 px-3 py-2 text-sm"
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              placeholder="Ví dụ: Pro"
            />
          </div>
          <div>
            <div className="text-xs font-semibold text-muted-foreground">Code</div>
            <select
              className="mt-1 w-full rounded-2xl border border-border bg-background/60 px-3 py-2 text-sm"
              value={form.code}
              onChange={(e) => setForm((s) => ({ ...s, code: e.target.value as PricingPlanCode }))}
              disabled={!!editing}
            >
              {codes.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {editing ? <div className="mt-1 text-[11px] text-muted-foreground">Không đổi code sau khi tạo.</div> : null}
          </div>

          <div>
            <div className="text-xs font-semibold text-muted-foreground">Giá tháng (VND)</div>
            <input
              type="number"
              className="mt-1 w-full rounded-2xl border border-border bg-background/60 px-3 py-2 text-sm"
              value={form.priceMonthly}
              onChange={(e) => setForm((s) => ({ ...s, priceMonthly: Number(e.target.value) }))}
            />
          </div>
          <div>
            <div className="text-xs font-semibold text-muted-foreground">Giá năm (VND)</div>
            <input
              type="number"
              className="mt-1 w-full rounded-2xl border border-border bg-background/60 px-3 py-2 text-sm"
              value={form.priceYearly}
              onChange={(e) => setForm((s) => ({ ...s, priceYearly: Number(e.target.value) }))}
            />
          </div>

          <div className="md:col-span-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-muted-foreground">Quyền lợi (mỗi dòng 1 mục)</div>
              <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((s) => ({ ...s, isActive: e.target.checked }))}
                />
                Active
              </label>
            </div>
            <textarea
              className="mt-1 w-full min-h-[120px] rounded-2xl border border-border bg-background/60 px-3 py-2 text-sm"
              value={form.benefitsText}
              onChange={(e) => setForm((s) => ({ ...s, benefitsText: e.target.value }))}
              placeholder="Ví dụ:\nLàm đề không giới hạn\nThống kê nâng cao"
            />
            <div className="mt-2 text-xs text-muted-foreground">Preview: {benefits.length} quyền lợi</div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
