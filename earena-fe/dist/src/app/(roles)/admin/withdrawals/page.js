"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = AdminWithdrawalsPage;
const AdminShell_1 = require("@/features/admin/components/AdminShell");
const AdminWithdrawalsScreen_1 = require("@/features/admin/screens/AdminWithdrawalsScreen");
exports.metadata = {
    title: 'Đối soát Rút tiền | Quản trị EArena',
    description: 'Hệ thống đối soát và giải ngân doanh thu cho giáo viên.',
};
function AdminWithdrawalsPage() {
    return (<AdminShell_1.AdminShell title="Đối soát & Giải ngân" subtitle="Kiểm duyệt và thanh toán các yêu cầu rút doanh thu từ Giáo viên">
            <AdminWithdrawalsScreen_1.AdminWithdrawalsScreen />
        </AdminShell_1.AdminShell>);
}
//# sourceMappingURL=page.js.map