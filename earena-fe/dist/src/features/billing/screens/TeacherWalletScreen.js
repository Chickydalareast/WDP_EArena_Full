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
exports.TeacherWalletScreen = TeacherWalletScreen;
const react_1 = __importStar(require("react"));
const useBillingFlows_1 = require("../hooks/useBillingFlows");
const billing_ui_store_1 = require("../stores/billing-ui.store");
const WithdrawModal_1 = require("../components/WithdrawModal");
const button_1 = require("@/shared/components/ui/button");
const skeleton_1 = require("@/shared/components/ui/skeleton");
const lucide_react_1 = require("lucide-react");
const TRANSACTION_UI_MAP = {
    DEPOSIT: { icon: lucide_react_1.ArrowDownRight, sign: '+', colorClass: 'text-green-600 dark:text-green-500', bgClass: 'bg-green-100 dark:bg-green-900/30' },
    REVENUE: { icon: lucide_react_1.ArrowDownRight, sign: '+', colorClass: 'text-green-600 dark:text-green-500', bgClass: 'bg-green-100 dark:bg-green-900/30' },
    REFUND: { icon: lucide_react_1.ArrowDownRight, sign: '+', colorClass: 'text-green-600 dark:text-green-500', bgClass: 'bg-green-100 dark:bg-green-900/30' },
    PAYMENT: { icon: lucide_react_1.ArrowUpRight, sign: '-', colorClass: 'text-destructive', bgClass: 'bg-destructive/10' },
    WITHDRAWAL: { icon: lucide_react_1.ArrowUpRight, sign: '-', colorClass: 'text-amber-600 dark:text-amber-500', bgClass: 'bg-amber-100 dark:bg-amber-900/30' },
};
function TeacherWalletScreen() {
    const { data: walletData, isLoading: isWalletLoading } = (0, useBillingFlows_1.useSyncWallet)();
    const balance = walletData?.balance ?? 0;
    const openDepositModal = (0, billing_ui_store_1.useBillingUIStore)((state) => state.openDepositModal);
    const [page, setPage] = (0, react_1.useState)(1);
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
    return (<div className="max-w-[1600px] w-full mx-auto p-4 md:p-6 lg:p-8 space-y-6 animate-in fade-in duration-500">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                
                <div className="lg:col-span-8 bg-primary rounded-[2rem] p-8 md:p-10 text-primary-foreground shadow-sm relative overflow-hidden flex flex-col justify-center">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none"/>
                    <div className="relative z-10 flex items-center gap-6">
                        <div className="p-5 bg-background/20 rounded-3xl backdrop-blur-md shadow-inner shrink-0">
                            <lucide_react_1.Wallet className="w-10 h-10 text-white"/>
                        </div>
                        <div>
                            <p className="text-primary-foreground/90 font-bold text-lg mb-1 uppercase tracking-wider text-sm">Ví doanh thu hiện tại</p>
                            {isWalletLoading ? (<skeleton_1.Skeleton className="h-12 w-48 bg-background/20 rounded-xl mt-2"/>) : (<h2 className="text-4xl md:text-5xl font-black tracking-tight drop-shadow-sm">
                                    {formatCurrency(balance)}
                                </h2>)}
                        </div>
                    </div>
                </div>

                
                <div className="lg:col-span-4 bg-card rounded-[2rem] border border-border p-8 shadow-sm flex flex-col justify-center gap-4">
                    <div className="flex items-center gap-2 mb-2 text-foreground font-bold">
                        <lucide_react_1.ShieldCheck className="w-5 h-5 text-primary"/>
                        Thao tác nhanh
                    </div>
                    <button_1.Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-14 rounded-xl shadow-lg shadow-primary/20 transition-transform active:scale-95 text-base" onClick={() => openDepositModal()}>
                        <lucide_react_1.PlusCircle className="w-5 h-5 mr-2"/> Nạp tiền vào ví
                    </button_1.Button>
                    <div className="w-full">
                        <WithdrawModal_1.WithdrawModal />
                    </div>
                </div>

            </div>

            
            <div className="bg-card border border-border rounded-[2rem] shadow-sm overflow-hidden">
                <div className="p-6 md:p-8 border-b border-border bg-secondary/30 flex items-center gap-3">
                    <div className="p-2 bg-background rounded-lg border border-border shadow-sm">
                        <lucide_react_1.History className="w-5 h-5 text-primary"/>
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Biến động số dư</h3>
                </div>

                <div className="p-0">
                    {isLoading ? (<div className="p-6 space-y-4">
                            {[1, 2, 3, 4].map((i) => <skeleton_1.Skeleton key={i} className="w-full h-20 rounded-2xl"/>)}
                        </div>) : !data || data.data.length === 0 ? (<div className="p-16 text-center text-muted-foreground flex flex-col items-center">
                            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                                <lucide_react_1.History className="w-8 h-8 opacity-40"/>
                            </div>
                            <p className="font-semibold text-lg text-foreground">Chưa có giao dịch nào.</p>
                            <p className="text-sm mt-1">Lịch sử doanh thu và nạp/rút sẽ xuất hiện tại đây.</p>
                        </div>) : (<div className="divide-y divide-border">
                            {data.data.map((tx) => {
                const uiConfig = TRANSACTION_UI_MAP[tx.type];
                const Icon = uiConfig.icon;
                return (<div key={tx._id} className="p-5 md:p-6 flex items-center justify-between hover:bg-secondary/40 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3.5 rounded-2xl ${uiConfig.bgClass} transition-transform group-hover:scale-105`}>
                                                <Icon className={`w-5 h-5 ${uiConfig.colorClass}`}/>
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
                                    </div>);
            })}
                        </div>)}
                </div>

                {data?.meta && data.meta.totalPages > 1 && (<div className="p-6 border-t border-border bg-secondary/10 flex justify-center items-center gap-4">
                        <button_1.Button variant="outline" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded-full font-bold px-6">
                            Trang trước
                        </button_1.Button>
                        <span className="text-sm font-bold text-foreground bg-background px-4 py-2 rounded-full border border-border shadow-sm">
                            {page} / {data.meta.totalPages}
                        </span>
                        <button_1.Button variant="outline" disabled={page === data.meta.totalPages} onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))} className="rounded-full font-bold px-6">
                            Trang sau
                        </button_1.Button>
                    </div>)}
            </div>
        </div>);
}
//# sourceMappingURL=TeacherWalletScreen.js.map