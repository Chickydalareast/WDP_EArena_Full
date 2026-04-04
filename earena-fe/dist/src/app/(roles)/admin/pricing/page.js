"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AdminPricingPage;
const AdminShell_1 = require("@/features/admin/components/AdminShell");
const AdminPricingPlansScreen_1 = require("@/features/admin/screens/AdminPricingPlansScreen");
function AdminPricingPage() {
    return (<AdminShell_1.AdminShell title="Gói dịch vụ" subtitle="Quản lý pricing plans (Free/Pro/Enterprise) – phục vụ vận hành hệ thống">
      <AdminPricingPlansScreen_1.AdminPricingPlansScreen />
    </AdminShell_1.AdminShell>);
}
//# sourceMappingURL=page.js.map