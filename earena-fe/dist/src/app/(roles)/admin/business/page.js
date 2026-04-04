"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AdminBusinessPage;
const AdminShell_1 = require("@/features/admin/components/AdminShell");
const AdminBusinessDashboardScreen_1 = require("@/features/admin/screens/AdminBusinessDashboardScreen");
function AdminBusinessPage() {
    return (<AdminShell_1.AdminShell title="Business Dashboard" subtitle="Theo dõi doanh thu & chỉ số vận hành (dành cho chủ hệ thống)">
      <AdminBusinessDashboardScreen_1.AdminBusinessDashboardScreen />
    </AdminShell_1.AdminShell>);
}
//# sourceMappingURL=page.js.map