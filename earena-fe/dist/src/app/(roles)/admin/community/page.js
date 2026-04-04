"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = AdminCommunityPage;
const AdminShell_1 = require("@/features/admin/components/AdminShell");
const AdminCommunityReportsScreen_1 = require("@/features/admin/screens/AdminCommunityReportsScreen");
exports.metadata = {
    title: 'Community — Quản trị EArena',
};
function AdminCommunityPage() {
    return (<AdminShell_1.AdminShell title="Báo cáo Community" subtitle="Duyệt nội dung bị báo cáo từ cộng đồng học tập">
      <AdminCommunityReportsScreen_1.AdminCommunityReportsScreen />
    </AdminShell_1.AdminShell>);
}
//# sourceMappingURL=page.js.map