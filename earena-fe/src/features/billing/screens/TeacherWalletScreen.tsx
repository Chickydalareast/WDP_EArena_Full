'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { useSyncWallet, useMyTransactions } from '../hooks/useBillingFlows';
import { useBillingUIStore } from '../stores/billing-ui.store';
import { WithdrawModal } from '../components/WithdrawModal';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Wallet, ArrowUpRight, ArrowDownRight, History, PlusCircle, ShieldCheck } from 'lucide-react';
import { TransactionType } from '../types/billing.schema';

const TRANSACTION_UI_MAP: Record<TransactionType, { icon: React.ElementType, sign: string, colorClass: string, bgClass: string }> = {
    DEPOSIT: { icon: ArrowDownRight, sign: '+', colorClass: 'text-green-600 dark:text-green-500', bgClass: 'bg-green-100 dark:bg-green-900/30' },
    REVENUE: { icon: ArrowDownRight, sign: '+', colorClass: 'text-green-600 dark:text-green-500', bgClass: 'bg-green-100 dark:bg-green-900/30' },
    REFUND: { icon: ArrowDownRight, sign: '+', colorClass: 'text-green-600 dark:text-green-500', bgClass: 'bg-green-100 dark:bg-green-900/30' },
    PAYMENT: { icon: ArrowUpRight, sign: '-', colorClass: 'text-destructive', bgClass: 'bg-destructive/10' },
    WITHDRAWAL: { icon: ArrowUpRight, sign: '-', colorClass: 'text-amber-600 dark:text-amber-500', bgClass: 'bg-amber-100 dark:bg-amber-900/30' },
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
        <div className="max-w-[1600px] w-full mx-auto p-4 md:p-6 lg:p-8 space-y-6 animate-in fade-in duration-500">
            {/* TOP BENTO GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Module 1: Hero Balance (8 Cols) */}
                <div className="lg:col-span-8 bg-primary rounded-[2rem] p-8 md:p-10 text-primary-foreground shadow-sm relative overflow-hidden flex flex-col justify-center">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
                    <div className="relative z-10 flex items-center gap-6">
                        <div className="p-5 bg-background/20 rounded-3xl backdrop-blur-md shadow-inner shrink-0">
                            <Wallet className="w-10 h-10 text-white" />
                        </div>
                        <div>
                            <p className="text-primary-foreground/90 font-bold text-lg mb-1 uppercase tracking-wider text-sm">Ví doanh thu hiện tại</p>
                            {isWalletLoading ? (
                                <Skeleton className="h-12 w-48 bg-background/20 rounded-xl mt-2" />
                            ) : (
                                <h2 className="text-4xl md:text-5xl font-black tracking-tight drop-shadow-sm">
                                    {formatCurrency(balance)}
                                </h2>
                            )}
                        </div>
                    </div>
                </div>

                {/* Module 2: Quick Actions (4 Cols) */}
                <div className="lg:col-span-4 bg-card rounded-[2rem] border border-border p-8 shadow-sm flex flex-col justify-center gap-4">
                    <div className="flex items-center gap-2 mb-2 text-foreground font-bold">
                        <ShieldCheck className="w-5 h-5 text-primary" />
                        Thao tác nhanh
                    </div>
                    <Button 
                        size="lg"
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-14 rounded-xl shadow-lg shadow-primary/20 transition-transform active:scale-95 text-base"
                        onClick={() => openDepositModal()}
                    >
                        <PlusCircle className="w-5 h-5 mr-2" /> Nạp tiền vào ví
                    </Button>
                    <div className="w-full">
                        <WithdrawModal />
                    </div>
                </div>

            </div>

            {/* BOTTOM BENTO: History (12 Cols) */}
            <div className="bg-card border border-border rounded-[2rem] shadow-sm overflow-hidden">
                <div className="p-6 md:p-8 border-b border-border bg-secondary/30 flex items-center gap-3">
                    <div className="p-2 bg-background rounded-lg border border-border shadow-sm">
                        <History className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Biến động số dư</h3>
                </div>

                <div className="p-0">
                    {isLoading ? (
                        <div className="p-6 space-y-4">
                            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="w-full h-20 rounded-2xl" />)}
                        </div>
                    ) : !data || data.data.length === 0 ? (
                        <div className="p-16 text-center text-muted-foreground flex flex-col items-center">
                            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                                <History className="w-8 h-8 opacity-40" />
                            </div>
                            <p className="font-semibold text-lg text-foreground">Chưa có giao dịch nào.</p>
                            <p className="text-sm mt-1">Lịch sử doanh thu và nạp/rút sẽ xuất hiện tại đây.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {data.data.map((tx) => {
                                const uiConfig = TRANSACTION_UI_MAP[tx.type];
                                const Icon = uiConfig.icon;

                                return (
                                    <div key={tx._id} className="p-5 md:p-6 flex items-center justify-between hover:bg-secondary/40 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3.5 rounded-2xl ${uiConfig.bgClass} transition-transform group-hover:scale-105`}>
                                                <Icon className={`w-5 h-5 ${uiConfig.colorClass}`} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-foreground line-clamp-1">{tx.description}</p>
                                                <p className="text-sm text-muted-foreground mt-1 font-medium">
                                                    {formatDateTime(tx.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0 ml-4">
                                            <p className={`font-black text-lg ${uiConfig.colorClass}`}>
                                                {uiConfig.sign}{formatCurrency(tx.amount)}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1 font-medium">
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
                    <div className="p-6 border-t border-border bg-secondary/10 flex justify-center items-center gap-4">
                        <Button 
                            variant="outline" 
                            disabled={page === 1} 
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            className="rounded-full font-bold px-6"
                        >
                            Trang trước
                        </Button>
                        <span className="text-sm font-bold text-foreground bg-background px-4 py-2 rounded-full border border-border shadow-sm">
                            {page} / {data.meta.totalPages}
                        </span>
                        <Button 
                            variant="outline" 
                            disabled={page === data.meta.totalPages} 
                            onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))}
                            className="rounded-full font-bold px-6"
                        >
                            Trang sau
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}