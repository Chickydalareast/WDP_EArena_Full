'use client';

import React, { Suspense, useState } from 'react';
import { useSyncWallet, useMyTransactions } from '../hooks/useBillingFlows';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Wallet, ArrowUpRight, ArrowDownRight, History } from 'lucide-react';
import { TransactionType } from '../types/billing.schema';
import { PayOsReturnHandler } from '../components/PayOsReturnHandler';

const TRANSACTION_UI_MAP: Record<TransactionType, { icon: React.ElementType, sign: string, colorClass: string }> = {
  DEPOSIT: { icon: ArrowDownRight, sign: '+', colorClass: 'text-green-600' },
  REVENUE: { icon: ArrowDownRight, sign: '+', colorClass: 'text-green-600' },
  REFUND: { icon: ArrowDownRight, sign: '+', colorClass: 'text-green-600' },
  PAYMENT: { icon: ArrowUpRight, sign: '-', colorClass: 'text-red-600' },
  WITHDRAWAL: { icon: ArrowUpRight, sign: '-', colorClass: 'text-red-600' },
};

export function WalletScreen() {
  const [page, setPage] = useState(1);
  
  const { data: walletData, isLoading: isWalletLoading } = useSyncWallet();
  const balance = walletData?.balance ?? 0;
  
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
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-6 animate-in fade-in duration-500">
      <Suspense fallback={null}>
        <PayOsReturnHandler />
      </Suspense>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card border border-border p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Lịch sử giao dịch</h1>
            <p className="text-sm text-muted-foreground">Theo dõi biến động số dư tài khoản của bạn</p>
          </div>
        </div>
        <div className="text-right w-full sm:w-auto p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-border">
          <p className="text-xs font-semibold text-muted-foreground mb-1">Số dư khả dụng</p>
          {isWalletLoading ? (
            <Skeleton className="h-7 w-24 ml-auto" />
          ) : (
            <p className="text-xl font-bold text-primary">{formatCurrency(balance)}</p>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="w-full h-16 rounded-xl" />)}
            </div>
          ) : !data || data.data.length === 0 ? (
            <div className="p-16 text-center text-slate-400">
              <Wallet className="w-12 h-12 mx-auto opacity-20 mb-3" />
              <p>Chưa có biến động số dư nào phát sinh.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {data.data.map((tx) => {
                const uiConfig = TRANSACTION_UI_MAP[tx.type];
                const Icon = uiConfig.icon;
                
                return (
                  <div key={tx._id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-full bg-slate-100 ${uiConfig.colorClass} bg-opacity-10`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-foreground line-clamp-1">{tx.description}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDateTime(tx.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className={`font-bold text-sm ${uiConfig.colorClass}`}>
                        {uiConfig.sign}{formatCurrency(tx.amount)}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Dư cuối: {formatCurrency(tx.postBalance)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {data?.meta && data.meta.totalPages > 1 && (
          <div className="p-4 border-t border-border bg-slate-50/50 flex justify-between items-center">
            <Button 
              variant="outline" 
              size="sm"
              disabled={page === 1} 
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Trang trước
            </Button>
            <span className="text-sm font-medium text-slate-600">
              Trang {page} / {data.meta.totalPages}
            </span>
            <Button 
              variant="outline"
              size="sm" 
              disabled={page === data.meta.totalPages} 
              onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))}
            >
              Trang sau
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}