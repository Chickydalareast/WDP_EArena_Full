"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AdminTeachersVerificationPage;
const AdminShell_1 = require("@/features/admin/components/AdminShell");
const AdminTeacherVerificationScreen_1 = require("@/features/admin/screens/AdminTeacherVerificationScreen");
function AdminTeachersVerificationPage() {
    return (<AdminShell_1.AdminShell title="Duyệt giáo viên" subtitle="Xác minh hồ sơ giáo viên (tick xanh uy tín) – chống spam & nâng chất lượng hệ thống">
      <AdminTeacherVerificationScreen_1.AdminTeacherVerificationScreen />
    </AdminShell_1.AdminShell>);
}
//# sourceMappingURL=page.js.map