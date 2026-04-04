"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AdminExamsPage;
const AdminShell_1 = require("@/features/admin/components/AdminShell");
const AdminExamsScreen_1 = require("@/features/admin/screens/AdminExamsScreen");
function AdminExamsPage() {
    return (<AdminShell_1.AdminShell title="Quản trị đề thi" subtitle="Publish/Unpublish • Quản trị chuẩn enterprise">
      <AdminExamsScreen_1.AdminExamsScreen />
    </AdminShell_1.AdminShell>);
}
//# sourceMappingURL=page.js.map