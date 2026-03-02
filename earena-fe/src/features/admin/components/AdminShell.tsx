'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Shield,
  Users,
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Layers,
  CreditCard,
  BadgeCheck,
  LineChart,
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/stores/auth.store';

const nav = [
  { href: '/admin', label: 'Tổng quan', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Người dùng', icon: Users },
  { href: '/admin/exams', label: 'Đề thi', icon: GraduationCap },
  { href: '/admin/classes', label: 'Lớp học', icon: BookOpen },
  { href: '/admin/questions', label: 'Ngân hàng câu hỏi', icon: Layers },
  { href: '/admin/teachers', label: 'Duyệt giáo viên', icon: BadgeCheck },
  { href: '/admin/pricing', label: 'Gói dịch vụ', icon: CreditCard },
  { href: '/admin/business', label: 'Business', icon: LineChart },
  { href: '/admin/taxonomy', label: 'Danh mục kiến thức', icon: Shield },
];

export function AdminShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/40 text-foreground">
      <div className="flex">
        <aside className="w-[280px] min-h-screen border-r border-border bg-card/70 backdrop-blur">
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Shield className="size-5 text-primary" />
              </div>
              <div>
                <div className="text-lg font-extrabold tracking-tight">EArena Admin</div>
                <div className="text-xs text-muted-foreground">Enterprise Console</div>
              </div>
            </div>
          </div>

          <nav className="p-4 space-y-1">
            {nav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition border ' +
                    (active
                      ? 'bg-primary/10 border-primary/20 text-primary'
                      : 'border-transparent text-muted-foreground hover:bg-accent hover:text-foreground')
                  }
                >
                  <Icon className={'size-4 ' + (active ? 'text-primary' : 'text-muted-foreground')} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto p-4">
            <div className="rounded-2xl border border-border bg-card/60 p-4">
              <div className="text-xs text-muted-foreground">Đang đăng nhập</div>
              <div className="mt-1 text-sm font-semibold truncate">{user?.email || '—'}</div>
              <div className="mt-2 inline-flex items-center gap-2 text-xs text-primary">
                <Shield className="size-3" />
                <span className="font-semibold">{user?.role || 'ADMIN'}</span>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1">
          <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
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

          <div className="px-8 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
