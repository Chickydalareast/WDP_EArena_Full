"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AdminDashboardPage;
const AdminShell_1 = require("@/features/admin/components/AdminShell");
const AdminDashboardScreen_1 = require("@/features/admin/screens/AdminDashboardScreen");
function AdminDashboardPage() {
    return (<AdminShell_1.AdminShell title="Bảng điều khiển" subtitle="Tổng quan vận hành hệ thống ôn thi THPTQG (Enterprise Console)">
      <AdminDashboardScreen_1.AdminDashboardScreen />
    </AdminShell_1.AdminShell>);
}
//# sourceMappingURL=page.js.map