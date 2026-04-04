"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AdminQuestionsPage;
const AdminShell_1 = require("@/features/admin/components/AdminShell");
const AdminQuestionsScreen_1 = require("@/features/admin/screens/AdminQuestionsScreen");
function AdminQuestionsPage() {
    return (<AdminShell_1.AdminShell title="Ngân hàng câu hỏi" subtitle="Archive/Restore • Kiểm soát chất lượng nội dung">
      <AdminQuestionsScreen_1.AdminQuestionsScreen />
    </AdminShell_1.AdminShell>);
}
//# sourceMappingURL=page.js.map