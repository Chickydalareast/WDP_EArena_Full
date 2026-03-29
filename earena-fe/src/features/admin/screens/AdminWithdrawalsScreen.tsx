'use client';

import React, { useState, useMemo } from 'react';
import { useAdminWithdrawals } from '../hooks/useAdminWithdrawals';
import { WithdrawalRequest, WithdrawalStatus } from '../types/admin-wallet.schema';
import { ProcessWithdrawalModal } from '../components/ProcessWithdrawalModal';
import { DataTable, PaginationBar } from '../components/DataTable';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';

const STATUS_MAP: Record<WithdrawalStatus, { label: string, color: string, icon: React.ElementType }> = {
    PENDING: { label: 'Chờ duyệt', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
    PROCESSING: { label: 'Đang xử lý', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock },
    COMPLETED: { label: 'Đã thanh toán', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2 },
    REJECTED: { label: 'Đã từ chối', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
};

export function AdminWithdrawalsScreen() {
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<WithdrawalStatus | ''>('');
    const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);

    const { data, isLoading } = useAdminWithdrawals({ page, limit: 10, status: statusFilter });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const formatDateTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    // [CTO FIX]: Memoize mảng columns để tránh re-render bảng không cần thiết
    const columns = useMemo(() => [
        { key: 'id', header: 'Mã / Thời gian', className: 'w-48' },
        { key: 'teacher', header: 'Giáo viên' },
        { key: 'amount', header: 'Số tiền rút' },
        { key: 'bank', header: 'Thông tin NH' },
        { key: 'status', header: 'Trạng thái' },
        { key: 'action', header: 'Thao tác', className: 'text-right' },
    ], []);

    // [CTO FIX]: Memoize việc transform dữ liệu data -> rows. Kèm skeleton UI khi loading.
    const rows = useMemo(() => {
        if (isLoading) {
            return Array.from({ length: 5 }).map((_, idx) => ({
                id: <div className="space-y-1"><Skeleton className="h-4 w-20" /><Skeleton className="h-3 w-32" /></div>,
                teacher: <div className="space-y-1"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-24" /></div>,
                amount: <Skeleton className="h-5 w-24" />,
                bank: <div className="space-y-1"><Skeleton className="h-4 w-24" /><Skeleton className="h-3 w-32" /></div>,
                status: <Skeleton className="h-6 w-24 rounded-full" />,
                action: <div className="flex justify-end"><Skeleton className="h-8 w-16" /></div>,
            }));
        }

        if (!data?.data) return [];

        return data.data.map((req) => {
            const statusUi = STATUS_MAP[req.status];
            const StatusIcon = statusUi.icon;

            return {
                id: (
                    <div>
                        <div className="font-mono text-xs font-semibold text-slate-600">{req._id.slice(-8).toUpperCase()}</div>
                        <div className="text-slate-400 text-[11px] mt-1">{formatDateTime(req.createdAt)}</div>
                    </div>
                ),
                teacher: (
                    <div>
                        <div className="font-semibold text-slate-800">{req.teacherId.fullName}</div>
                        <div className="text-slate-500 text-xs">{req.teacherId.email}</div>
                    </div>
                ),
                amount: <div className="font-bold text-red-600">{formatCurrency(req.amount)}</div>,
                bank: (
                    <div>
                        <div className="font-semibold text-sm">{req.bankInfo.bankName}</div>
                        <div className="text-slate-500 text-xs font-mono">{req.bankInfo.accountNumber}</div>
                    </div>
                ),
                status: (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusUi.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusUi.label}
                    </span>
                ),
                action: (
                    <div className="flex justify-end">
                        {req.status === 'PENDING' ? (
                            <Button
                                size="sm"
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                                onClick={() => setSelectedRequest(req)}
                            >
                                Xử lý
                            </Button>
                        ) : (
                            <Button size="sm" variant="ghost" className="text-slate-400" disabled>
                                Đã chốt
                            </Button>
                        )}
                    </div>
                )
            };
        });
    }, [data, isLoading]);

    return (
        <div className="space-y-6">
            <div className="flex justify-end mb-4">
                {/* Bộ lọc trạng thái */}
                <div className="w-full sm:w-[200px]">
                    <Select
                        value={statusFilter}
                        onValueChange={(val) => { setStatusFilter(val as WithdrawalStatus | ''); setPage(1); }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Tất cả trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                            <SelectItem value="PENDING">Chờ duyệt</SelectItem>
                            <SelectItem value="COMPLETED">Đã thanh toán</SelectItem>
                            <SelectItem value="REJECTED">Đã từ chối</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <DataTable
                columns={columns}
                rows={rows}
                empty="Chưa có yêu cầu rút tiền nào trong hệ thống."
            />

            {data?.meta && data.meta.totalPages > 1 && (
                <PaginationBar
                    page={page}
                    totalPages={data.meta.totalPages}
                    onPageChange={setPage}
                />
            )}

            {/* Cắm Modal vào Root */}
            <ProcessWithdrawalModal
                request={selectedRequest}
                onClose={() => setSelectedRequest(null)}
            />
        </div>
    );
}