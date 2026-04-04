'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminShell = AdminShell;
const link_1 = __importDefault(require("next/link"));
const navigation_1 = require("next/navigation");
const lucide_react_1 = require("lucide-react");
const auth_store_1 = require("@/features/auth/stores/auth.store");
const useLogout_1 = require("@/features/auth/hooks/useLogout");
const button_1 = require("@/shared/components/ui/button");
const routes_1 = require("@/config/routes");
const nav = [
    { href: '/admin', label: 'Tổng quan', icon: lucide_react_1.LayoutDashboard },
    { href: routes_1.ROUTES.ADMIN.TEACHERS, label: 'Duyệt hồ sơ', icon: lucide_react_1.ClipboardCheck },
    { href: '/admin/users', label: 'Người dùng', icon: lucide_react_1.Users },
    { href: '/admin/exams', label: 'Đề thi', icon: lucide_react_1.GraduationCap },
    { href: '/admin/courses', label: 'Khóa học', icon: lucide_react_1.BookOpen },
    { href: '/admin/questions', label: 'Ngân hàng câu hỏi', icon: lucide_react_1.Layers },
    { href: '/admin/pricing', label: 'Gói dịch vụ', icon: lucide_react_1.CreditCard },
    { href: routes_1.ROUTES.ADMIN.WITHDRAWALS, label: 'Duyệt rút tiền', icon: lucide_react_1.Banknote },
    { href: '/admin/business', label: 'Business', icon: lucide_react_1.LineChart },
    { href: '/admin/community', label: 'Community', icon: lucide_react_1.MessagesSquare },
    { href: '/admin/taxonomy', label: 'Danh mục kiến thức', icon: lucide_react_1.Shield },
];
function AdminShell({ title, subtitle, children, }) {
    const pathname = (0, navigation_1.usePathname)();
    const user = (0, auth_store_1.useAuthStore)((s) => s.user);
    const { mutate: logout, isPending } = (0, useLogout_1.useLogout)();
    return (<div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/40 text-foreground">
      <div className="flex">
        <aside className="w-[280px] min-h-screen border-r border-border bg-card/70 backdrop-blur flex flex-col">
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <lucide_react_1.Shield className="size-5 text-primary"/>
              </div>
              <div>
                <div className="text-lg font-extrabold tracking-tight">EArena Admin</div>
                <div className="text-xs text-muted-foreground">Enterprise Console</div>
              </div>
            </div>
          </div>

          <nav className="p-4 space-y-1 overflow-y-auto">
            {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            return (<link_1.default key={item.href} href={item.href} className={'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition border ' +
                    (active
                        ? 'bg-primary/10 border-primary/20 text-primary'
                        : 'border-transparent text-muted-foreground hover:bg-accent hover:text-foreground')}>
                  <Icon className={'size-4 ' + (active ? 'text-primary' : 'text-muted-foreground')}/>
                  <span className="font-medium">{item.label}</span>
                </link_1.default>);
        })}
          </nav>

          
          <div className="mt-auto p-4 border-t border-border/50">
            <div className="rounded-2xl border border-border bg-card/60 p-4">
              <div className="text-xs text-muted-foreground">Đang đăng nhập</div>
              <div className="mt-1 text-sm font-semibold truncate" title={user?.email}>
                {user?.email || '—'}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="inline-flex items-center gap-2 text-xs text-primary bg-primary/10 px-2 py-1 rounded-md">
                  <lucide_react_1.Shield className="size-3"/>
                  <span className="font-semibold">{user?.role || 'ADMIN'}</span>
                </div>
                
                <button_1.Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors" onClick={() => logout()} disabled={isPending} title="Đăng xuất">
                  <lucide_react_1.LogOut className="size-4"/>
                </button_1.Button>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur shrink-0">
            <div className="px-8 py-6 flex items-start justify-between gap-6">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
                {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
              </div>
              <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
                <div className="rounded-full border border-border bg-card/60 px-3 py-1">Secure Cookie Auth</div>
                <div className="rounded-full border border-border bg-card/60 px-3 py-1">RBAC: ADMIN</div>
              </div>
            </div>
          </header>

          <div className="px-8 py-8 flex-1 overflow-y-auto">{children}</div>
        </main>
      </div>
    </div>);
}
//# sourceMappingURL=AdminShell.js.map