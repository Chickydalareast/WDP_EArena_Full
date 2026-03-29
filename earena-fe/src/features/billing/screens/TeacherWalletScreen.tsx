'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { useSyncWallet, useMyTransactions } from '../hooks/useBillingFlows';
import { useBillingUIStore } from '../stores/billing-ui.store';
import { WithdrawModal } from '../components/WithdrawModal';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Wallet, ArrowUpRight, ArrowDownRight, History, PlusCircle } from 'lucide-react';
import { TransactionType } from '../types/billing.schema';

const TRANSACTION_UI_MAP: Record<TransactionType, { icon: React.ElementType, sign: string, colorClass: string }> = {
    DEPOSIT: { icon: ArrowDownRight, sign: '+', colorClass: 'text-green-600' },
    REVENUE: { icon: ArrowDownRight, sign: '+', colorClass: 'text-green-600' },
    REFUND: { icon: ArrowDownRight, sign: '+', colorClass: 'text-green-600' },
    PAYMENT: { icon: ArrowUpRight, sign: '-', colorClass: 'text-red-600' },
    WITHDRAWAL: { icon: ArrowUpRight, sign: '-', colorClass: 'text-amber-500' },
};

export function TeacherWalletScreen() {
    const { data: walletData, isLoading: isWalletLoading } = useSyncWallet();
    const balance = walletData?.balance ?? 0;
    const openDepositModal = useBillingUIStore((state) => state.openDepositModal);

    const [page, setPage] = useState(1);
    const { data, isLoading } = useMyTransactions(page, 10);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const formatDateTime = (isoString: string) => {
        const date = new Date(isoString);
        const time = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        const day = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        return `${time} - ${day}`;
    };

    return (
        <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
                        <Wallet className="w-10 h-10 text-white" />
                    </div>
                    <div>
                        <p className="text-indigo-100 font-medium mb-1">Ví Doanh Thu / Nạp tiền</p>
                        {isWalletLoading ? (
                            <Skeleton className="h-10 w-32 bg-white/20" />
                        ) : (
                            <h2 className="text-4xl font-bold tracking-tight">{formatCurrency(balance)}</h2>
                        )}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <Button 
                        size="lg"
                        className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold px-6 rounded-full transition-transform active:scale-95"
                        onClick={() => openDepositModal()}
                    >
                        <PlusCircle className="w-5 h-5 mr-2" /> Nạp tiền
                    </Button>
                    <WithdrawModal />
                </div>
            </div>

            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border bg-slate-50/50 flex items-center gap-2">
                    <History className="w-5 h-5 text-slate-500" />
                    <h3 className="text-lg font-bold text-slate-800">Biến động số dư</h3>
                </div>

                <div className="p-0">
                    {isLoading ? (
                        <div className="p-6 space-y-4">
                            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="w-full h-16 rounded-xl" />)}
                        </div>
                    ) : !data || data.data.length === 0 ? (
                        <div className="p-12 text-center text-slate-400">
                            <Wallet className="w-12 h-12 mx-auto opacity-20 mb-3" />
                            <p>Chưa có giao dịch doanh thu nào.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {data.data.map((tx) => {
                                const uiConfig = TRANSACTION_UI_MAP[tx.type];
                                const Icon = uiConfig.icon;

                                return (
                                    <div key={tx._id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-full bg-slate-100 ${uiConfig.colorClass} bg-opacity-10`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-800 line-clamp-1">{tx.description}</p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {formatDateTime(tx.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className={`font-bold text-base ${uiConfig.colorClass}`}>
                                                {uiConfig.sign}{formatCurrency(tx.amount)}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                Số dư cuối: {formatCurrency(tx.postBalance)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {data?.meta && data.meta.totalPages > 1 && (
                    <div className="p-4 border-t border-border bg-slate-50 flex justify-between items-center">
                        <Button variant="outline" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                            Trang trước
                        </Button>
                        <span className="text-sm font-medium text-slate-600">
                            {page} / {data.meta.totalPages}
                        </span>
                        <Button variant="outline" disabled={page === data.meta.totalPages} onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))}>
                            Trang sau
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}