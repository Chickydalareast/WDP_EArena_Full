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
exports.AdminWithdrawalsScreen = AdminWithdrawalsScreen;
const react_1 = __importStar(require("react"));
const useAdminWithdrawals_1 = require("../hooks/useAdminWithdrawals");
const ProcessWithdrawalModal_1 = require("../components/ProcessWithdrawalModal");
const DataTable_1 = require("../components/DataTable");
const button_1 = require("@/shared/components/ui/button");
const skeleton_1 = require("@/shared/components/ui/skeleton");
const select_1 = require("@/shared/components/ui/select");
const lucide_react_1 = require("lucide-react");
const STATUS_MAP = {
    PENDING: { label: 'Chờ duyệt', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: lucide_react_1.Clock },
    PROCESSING: { label: 'Đang xử lý', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: lucide_react_1.Clock },
    COMPLETED: { label: 'Đã thanh toán', color: 'bg-green-100 text-green-700 border-green-200', icon: lucide_react_1.CheckCircle2 },
    REJECTED: { label: 'Đã từ chối', color: 'bg-red-100 text-red-700 border-red-200', icon: lucide_react_1.XCircle },
};
function AdminWithdrawalsScreen() {
    const [page, setPage] = (0, react_1.useState)(1);
    const [statusFilter, setStatusFilter] = (0, react_1.useState)('');
    const [selectedRequest, setSelectedRequest] = (0, react_1.useState)(null);
    const { data, isLoading } = (0, useAdminWithdrawals_1.useAdminWithdrawals)({ page, limit: 10, status: statusFilter });
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };
    const formatDateTime = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };
    const columns = (0, react_1.useMemo)(() => [
        { key: 'id', header: 'Mã / Thời gian', className: 'w-48' },
        { key: 'teacher', header: 'Giáo viên' },
        { key: 'amount', header: 'Số tiền rút' },
        { key: 'bank', header: 'Thông tin NH' },
        { key: 'status', header: 'Trạng thái' },
        { key: 'action', header: 'Thao tác', className: 'text-right' },
    ], []);
    const rows = (0, react_1.useMemo)(() => {
        if (isLoading) {
            return Array.from({ length: 5 }).map((_, idx) => ({
                id: <div className="space-y-1"><skeleton_1.Skeleton className="h-4 w-20"/><skeleton_1.Skeleton className="h-3 w-32"/></div>,
                teacher: <div className="space-y-1"><skeleton_1.Skeleton className="h-4 w-32"/><skeleton_1.Skeleton className="h-3 w-24"/></div>,
                amount: <skeleton_1.Skeleton className="h-5 w-24"/>,
                bank: <div className="space-y-1"><skeleton_1.Skeleton className="h-4 w-24"/><skeleton_1.Skeleton className="h-3 w-32"/></div>,
                status: <skeleton_1.Skeleton className="h-6 w-24 rounded-full"/>,
                action: <div className="flex justify-end"><skeleton_1.Skeleton className="h-8 w-16"/></div>,
            }));
        }
        if (!data?.data)
            return [];
        return data.data.map((req) => {
            const statusUi = STATUS_MAP[req.status];
            const StatusIcon = statusUi.icon;
            return {
                id: (<div>
                        <div className="font-mono text-xs font-semibold text-slate-600">{req._id.slice(-8).toUpperCase()}</div>
                        <div className="text-slate-400 text-[11px] mt-1">{formatDateTime(req.createdAt)}</div>
                    </div>),
                teacher: (<div>
                        <div className="font-semibold text-slate-800">{req.teacherId.fullName}</div>
                        <div className="text-slate-500 text-xs">{req.teacherId.email}</div>
                    </div>),
                amount: <div className="font-bold text-red-600">{formatCurrency(req.amount)}</div>,
                bank: (<div>
                        <div className="font-semibold text-sm">{req.bankInfo.bankName}</div>
                        <div className="text-slate-500 text-xs font-mono">{req.bankInfo.accountNumber}</div>
                    </div>),
                status: (<span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusUi.color}`}>
                        <StatusIcon className="w-3.5 h-3.5"/>
                        {statusUi.label}
                    </span>),
                action: (<div className="flex justify-end">
                        {req.status === 'PENDING' ? (<button_1.Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold" onClick={() => setSelectedRequest(req)}>
                                Xử lý
                            </button_1.Button>) : (<button_1.Button size="sm" variant="ghost" className="text-slate-400" disabled>
                                Đã chốt
                            </button_1.Button>)}
                    </div>)
            };
        });
    }, [data, isLoading]);
    return (<div className="space-y-6">
            <div className="flex justify-end mb-4">
                
                <div className="w-full sm:w-[200px]">
                    <select_1.Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1); }}>
                        <select_1.SelectTrigger>
                            <select_1.SelectValue placeholder="Tất cả trạng thái"/>
                        </select_1.SelectTrigger>
                        <select_1.SelectContent>
                            <select_1.SelectItem value="ALL">Tất cả trạng thái</select_1.SelectItem>
                            <select_1.SelectItem value="PENDING">Chờ duyệt</select_1.SelectItem>
                            <select_1.SelectItem value="COMPLETED">Đã thanh toán</select_1.SelectItem>
                            <select_1.SelectItem value="REJECTED">Đã từ chối</select_1.SelectItem>
                        </select_1.SelectContent>
                    </select_1.Select>
                </div>
            </div>

            <DataTable_1.DataTable columns={columns} rows={rows} empty="Chưa có yêu cầu rút tiền nào trong hệ thống."/>

            {data?.meta && data.meta.totalPages > 1 && (<DataTable_1.PaginationBar page={page} totalPages={data.meta.totalPages} onPageChange={setPage}/>)}

            
            <ProcessWithdrawalModal_1.ProcessWithdrawalModal request={selectedRequest} onClose={() => setSelectedRequest(null)}/>
        </div>);
}
//# sourceMappingURL=AdminWithdrawalsScreen.js.map