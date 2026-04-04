"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AdminUsersPage;
const AdminShell_1 = require("@/features/admin/components/AdminShell");
const AdminUsersScreen_1 = require("@/features/admin/screens/AdminUsersScreen");
function AdminUsersPage() {
    return (<AdminShell_1.AdminShell title="Quản trị người dùng" subtitle="RBAC • Khóa/Ban • Reset mật khẩu • Quản lý role">
      <AdminUsersScreen_1.AdminUsersScreen />
    </AdminShell_1.AdminShell>);
}
//# sourceMappingURL=page.js.map