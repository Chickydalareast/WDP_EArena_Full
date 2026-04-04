"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = AdminCoursesPage;
const AdminShell_1 = require("@/features/admin/components/AdminShell");
const AdminCoursesScreen_1 = require("@/features/admin/screens/AdminCoursesScreen");
exports.metadata = {
    title: 'Duyệt Khóa Học | EArena Admin Console',
    description: 'Quản lý và kiểm duyệt khóa học trên nền tảng EArena',
};
function AdminCoursesPage() {
    return (<AdminShell_1.AdminShell title="Quản lý Khóa học" subtitle="Thẩm định, phê duyệt hoặc từ chối nội dung do giáo viên đăng tải">
      <AdminCoursesScreen_1.AdminCoursesScreen />
    </AdminShell_1.AdminShell>);
}
//# sourceMappingURL=page.js.map