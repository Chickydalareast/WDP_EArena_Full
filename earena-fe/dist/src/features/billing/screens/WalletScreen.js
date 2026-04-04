'use client';
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletScreen = WalletScreen;
const react_1 = __importStar(require("react"));
const useBillingFlows_1 = require("../hooks/useBillingFlows");
const button_1 = require("@/shared/components/ui/button");
const skeleton_1 = require("@/shared/components/ui/skeleton");
const lucide_react_1 = require("lucide-react");
const TRANSACTION_UI_MAP = {
    DEPOSIT: { icon: lucide_react_1.ArrowDownRight, sign: '+', colorClass: 'text-green-600' },
    REVENUE: { icon: lucide_react_1.ArrowDownRight, sign: '+', colorClass: 'text-green-600' },
    REFUND: { icon: lucide_react_1.ArrowDownRight, sign: '+', colorClass: 'text-green-600' },
    PAYMENT: { icon: lucide_react_1.ArrowUpRight, sign: '-', colorClass: 'text-red-600' },
    WITHDRAWAL: { icon: lucide_react_1.ArrowUpRight, sign: '-', colorClass: 'text-red-600' },
};
function WalletScreen() {
    const [page, setPage] = (0, react_1.useState)(1);
    const { data: walletData, isLoading: isWalletLoading } = (0, useBillingFlows_1.useSyncWallet)();
    const balance = walletData?.balance ?? 0;
    const { data, isLoading } = (0, useBillingFlows_1.useMyTransactions)(page, 10);
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };
    const formatDateTime = (isoString) => {
        const date = new Date(isoString);
        const time = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        const day = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        return `${time} - ${day}`;
    };
    return (<div className="max-w-5xl mx-auto py-8 px-4 space-y-6 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card border border-border p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <lucide_react_1.History className="w-6 h-6"/>
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Lịch sử giao dịch</h1>
            <p className="text-sm text-muted-foreground">Theo dõi biến động số dư tài khoản của bạn</p>
          </div>
        </div>
        <div className="text-right w-full sm:w-auto p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-border">
          <p className="text-xs font-semibold text-muted-foreground mb-1">Số dư khả dụng</p>
          {isWalletLoading ? (<skeleton_1.Skeleton className="h-7 w-24 ml-auto"/>) : (<p className="text-xl font-bold text-primary">{formatCurrency(balance)}</p>)}
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-0">
          {isLoading ? (<div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => <skeleton_1.Skeleton key={i} className="w-full h-16 rounded-xl"/>)}
            </div>) : !data || data.data.length === 0 ? (<div className="p-16 text-center text-slate-400">
              <lucide_react_1.Wallet className="w-12 h-12 mx-auto opacity-20 mb-3"/>
              <p>Chưa có biến động số dư nào phát sinh.</p>
            </div>) : (<div className="divide-y divide-border">
              {data.data.map((tx) => {
                const uiConfig = TRANSACTION_UI_MAP[tx.type];
                const Icon = uiConfig.icon;
                return (<div key={tx._id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-full bg-slate-100 ${uiConfig.colorClass} bg-opacity-10`}>
                        <Icon className="w-4 h-4"/>
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
                  </div>);
            })}
            </div>)}
        </div>

        {data?.meta && data.meta.totalPages > 1 && (<div className="p-4 border-t border-border bg-slate-50/50 flex justify-between items-center">
            <button_1.Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Trang trước
            </button_1.Button>
            <span className="text-sm font-medium text-slate-600">
              Trang {page} / {data.meta.totalPages}
            </span>
            <button_1.Button variant="outline" size="sm" disabled={page === data.meta.totalPages} onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))}>
              Trang sau
            </button_1.Button>
          </div>)}
      </div>
    </div>);
}
//# sourceMappingURL=WalletScreen.js.map