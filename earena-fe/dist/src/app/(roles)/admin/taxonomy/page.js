"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AdminTaxonomyPage;
const AdminShell_1 = require("@/features/admin/components/AdminShell");
const AdminTaxonomyScreen_1 = require("@/features/admin/screens/AdminTaxonomyScreen");
function AdminTaxonomyPage() {
    return (<AdminShell_1.AdminShell title="Danh mục kiến thức" subtitle="Môn học • Cây kiến thức • Chuẩn hóa taxonomy">
      <AdminTaxonomyScreen_1.AdminTaxonomyScreen />
    </AdminShell_1.AdminShell>);
}
//# sourceMappingURL=page.js.map