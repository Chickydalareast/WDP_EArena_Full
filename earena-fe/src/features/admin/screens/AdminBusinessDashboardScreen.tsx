'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, DollarSign, Users, ShoppingBag } from 'lucide-react';
import { adminService } from '../api/admin.service';
import { StatCard } from '../components/StatCard';
import { downloadCsv } from '../lib/csv';

function yyyyMmDd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function AdminBusinessDashboardScreen() {
  const [range, setRange] = useState(() => {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - 30);
    return { from: yyyyMmDd(from), to: yyyyMmDd(to) };
  });

  const params = useMemo(() => {
    // Allow empty to mean all-time
    const p: { from?: string; to?: string } = {};
    if (range.from) p.from = range.from;
    if (range.to) p.to = range.to;
    return p;
  }, [range]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'business', 'metrics', params],
    queryFn: () => adminService.getBusinessMetrics(params),
    staleTime: 1000 * 30,
  });

  if (isLoading) return <div className="text-muted-foreground">Đang tải business metrics…</div>;
  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-destructive">
        Không thể tải business dashboard. Vui lòng thử lại.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div>
            <div className="text-xs font-semibold text-muted-foreground">Từ ngày</div>
            <input
              type="date"
              className="mt-1 rounded-2xl border border-border bg-background/60 px-3 py-2 text-sm"
              value={range.from}
              onChange={(e) => setRange((s) => ({ ...s, from: e.target.value }))}
            />
          </div>
          <div>
            <div className="text-xs font-semibold text-muted-foreground">Đến ngày</div>
            <input
              type="date"
              className="mt-1 rounded-2xl border border-border bg-background/60 px-3 py-2 text-sm"
              value={range.to}
              onChange={(e) => setRange((s) => ({ ...s, to: e.target.value }))}
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              className="rounded-2xl border border-border bg-background/60 px-3 py-2 text-sm text-foreground hover:bg-accent"
              onClick={() => {
                const to = new Date();
                const from = new Date();
                from.setDate(to.getDate() - 7);
                setRange({ from: yyyyMmDd(from), to: yyyyMmDd(to) });
              }}
            >
              7 ngày
            </button>
            <button
              className="rounded-2xl border border-border bg-background/60 px-3 py-2 text-sm text-foreground hover:bg-accent"
              onClick={() => {
                const to = new Date();
                const from = new Date();
                from.setDate(to.getDate() - 30);
                setRange({ from: yyyyMmDd(from), to: yyyyMmDd(to) });
              }}
            >
              30 ngày
            </button>
            <button
              className="rounded-2xl border border-border bg-background/60 px-3 py-2 text-sm text-foreground hover:bg-accent"
              onClick={() => setRange({ from: '', to: '' })}
            >
              All-time
            </button>
          </div>
        </div>

        <button
          className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background/60 px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent"
          onClick={() =>
            downloadCsv({
              filename: 'business-metrics',
              headers: [
                { key: 'from', label: 'From' },
                { key: 'to', label: 'To' },
                { key: 'revenueTotal', label: 'RevenueTotal' },
                { key: 'currency', label: 'Currency' },
                { key: 'paidOrders', label: 'PaidOrders' },
                { key: 'usersTotal', label: 'UsersTotal' },
                { key: 'teachers', label: 'Teachers' },
                { key: 'students', label: 'Students' },
              ],
              rows: [
                {
                  from: params.from || 'ALL',
                  to: params.to || 'ALL',
                  revenueTotal: data.revenue.total,
                  currency: data.revenue.currency,
                  paidOrders: data.revenue.paidOrders,
                  usersTotal: data.users.total,
                  teachers: data.users.teachers,
                  students: data.users.students,
                },
              ],
            })
          }
        >
          <Download className="size-4" /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Doanh thu (tổng)"
          value={`${data.revenue.total.toLocaleString()} ${data.revenue.currency}`}
          hint={`Đơn hàng paid: ${data.revenue.paidOrders}`}
          icon={<DollarSign className="size-5 text-primary" />}
        />
        <StatCard
          label="Tổng người dùng"
          value={data.users.total}
          hint={`Học sinh: ${data.users.students} • Giáo viên: ${data.users.teachers}`}
          icon={<Users className="size-5 text-primary" />}
        />
        <StatCard
          label="Gợi ý monetize"
          value="Pro/Enterprise"
          hint="Cấu hình gói ở mục Gói dịch vụ"
          icon={<ShoppingBag className="size-5 text-primary" />}
        />
      </div>

      <div className="rounded-2xl border border-border bg-card/60 p-6">
        <div className="text-lg font-bold">Ghi chú</div>
        <div className="mt-2 text-sm text-muted-foreground">{data.note || '—'}</div>
        <div className="mt-4 text-xs text-muted-foreground">
          Khi bạn tích hợp thanh toán (Momo/ZaloPay/Stripe), chỉ cần ghi transaction vào collection
          <code className="mx-1">subscription_transactions</code> là dashboard tự chạy.
        </div>
      </div>
    </div>
  );
}
