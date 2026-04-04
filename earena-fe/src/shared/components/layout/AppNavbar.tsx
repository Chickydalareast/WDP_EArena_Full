'use client';

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { useBillingUIStore } from '@/features/billing/stores/billing-ui.store';
import { useSyncWallet } from '@/features/billing/hooks/useBillingFlows';
import { NotificationDropdown } from '@/features/notifications/components/NotificationDropdown';
import { UserCircle, Settings, LogOut, School, Menu, Wallet, PlusCircle, History } from 'lucide-react';
import { cn } from "@/shared/lib/utils";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";

import { NAV_CONFIG } from "@/config/navigation";
import { ROUTES } from "@/config/routes";

export function AppNavbar() {
  const { user, isInitialized } = useAuthStore();
  const { mutate: logout, isPending } = useLogout();
  const pathname = usePathname();
  const [imageError, setImageError] = useState(false);
  const openDepositModal = useBillingUIStore((state) => state.openDepositModal);

  const role = user?.role === 'TEACHER' ? 'TEACHER' : 'STUDENT';
  const homeRoute = role === 'TEACHER' ? ROUTES.TEACHER.DASHBOARD : ROUTES.STUDENT.DASHBOARD;
  const navItems = NAV_CONFIG[role] || NAV_CONFIG.STUDENT;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // --- COMPONENT CON: Desktop Navigation ---
  const DesktopNav = () => (
    <nav className="hidden md:flex items-center gap-1 mx-8">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== homeRoute);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all outline-none",
              isActive 
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
            )}
          >
            <Icon size={16} />
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );

  // --- COMPONENT CON: Mobile Navigation (Hamburger) ---
  const MobileNav = () => (
    <Sheet>
      <SheetTrigger asChild>
        <button className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-primary transition outline-none">
          <Menu size={24} />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0 flex flex-col border-r-border">
        <SheetHeader className="p-6 border-b border-border text-left">
          <SheetTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
              <School size={18} />
            </div>
            <span className="font-bold text-xl text-primary tracking-tight">EArena</span>
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== homeRoute);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                    : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                )}
              >
                <Icon size={18} />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );

  // --- COMPONENT CON: Navbar Wallet Badge (Hiển thị ngay trên thanh Nav) ---
  const NavbarWalletBadge = () => {
    // [CTO FIX]: Lấy data trực tiếp từ React Query, thay vì chờ Zustand sync để không bao giờ bị undefined (NaN)
    const { data: walletData, isLoading } = useSyncWallet();
    const balance = walletData?.balance ?? 0;

    if (!isInitialized || !user || user.role === 'ADMIN') return null;

    if (role === 'STUDENT') {
      return (
        <div 
          onClick={() => openDepositModal()}
          className="hidden sm:flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-full cursor-pointer transition-colors border border-primary/20"
          title="Nạp thêm tiền"
        >
          <Wallet className="w-4 h-4" />
          {isLoading ? (
            <Skeleton className="w-16 h-4 bg-primary/20" />
          ) : (
            <span className="font-bold text-sm">{formatCurrency(balance)}</span>
          )}
          <PlusCircle className="w-4 h-4 ml-1 opacity-70" />
        </div>
      );
    }

    if (role === 'TEACHER') {
      return (
        <Link 
          href={ROUTES.TEACHER.WALLET} 
          className="hidden sm:flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/30 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-400 px-3 py-1.5 rounded-full cursor-pointer transition-colors border border-indigo-200 dark:border-indigo-800"
          title="Ví doanh thu"
        >
          <Wallet className="w-4 h-4" />
          {isLoading ? (
            <Skeleton className="w-16 h-4 bg-indigo-200/50" />
          ) : (
            <span className="font-bold text-sm">{formatCurrency(balance)}</span>
          )}
        </Link>
      );
    }

    return null;
  };

  // --- COMPONENT CON: User Actions & Dropdown ---
  const UserDropdown = () => {
    // Tương tự, dùng data từ React Query cho tính nhất quán
    const { data: walletData, isLoading } = useSyncWallet();
    const balance = walletData?.balance ?? 0;

    if (!isInitialized) {
      return (
        <div className="flex items-center gap-3 p-1">
          <Skeleton className="w-9 h-9 rounded-full" />
          <div className="hidden lg:flex flex-col gap-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center gap-3 cursor-pointer hover:bg-muted p-1 rounded-full pr-3 transition outline-none group">
            {user?.avatar && !imageError ? (
              <img
                src={user.avatar}
                alt={user?.fullName || 'Avatar'}
                referrerPolicy="no-referrer"
                onError={() => setImageError(true)}
                className="w-9 h-9 rounded-full object-cover border border-primary/20 group-hover:ring-2 group-hover:ring-primary/50 transition-all shadow-sm"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20 group-hover:ring-2 group-hover:ring-primary/50 transition-all overflow-hidden">
                {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
            <div className="hidden lg:block text-left">
              <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate max-w-[120px]">
                {user?.fullName || 'Đang tải...'}
              </p>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                {role === 'STUDENT' ? 'Học sinh' : 'Giáo viên'}
              </p>
            </div>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 mt-2">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none truncate">{user?.fullName}</p>
              <p className="text-xs leading-none text-muted-foreground truncate">{user?.email}</p>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          {user?.role !== 'ADMIN' && (
            <div className="p-3 mb-1 mx-1 rounded-xl bg-muted/40 border border-border">
              <div className="flex justify-between items-center mb-2">
                <span className={`text-xs font-semibold flex items-center gap-1.5 ${role === 'TEACHER' ? 'text-indigo-600' : 'text-muted-foreground'}`}>
                  <Wallet className="w-3.5 h-3.5" /> 
                  {role === 'TEACHER' ? 'Ví doanh thu' : 'Số dư ví'}
                </span>
                {isLoading ? (
                  <Skeleton className="w-16 h-4" />
                ) : (
                  <span className={`font-bold text-sm ${role === 'TEACHER' ? 'text-indigo-700' : 'text-primary'}`}>
                    {formatCurrency(balance)}
                  </span>
                )}
              </div>
              {role === 'STUDENT' ? (
                <button
                  onClick={(e) => { e.preventDefault(); openDepositModal(); }}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold py-2 rounded-lg transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Nạp thêm tiền
                </button>
              ) : (
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={(e) => { e.preventDefault(); openDepositModal(); }}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-800 text-xs font-bold py-2 rounded-lg transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> Nạp
                  </button>
                  <Link href={ROUTES.TEACHER.WALLET} className="flex-1 flex items-center justify-center bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold py-2 rounded-lg transition-colors">
                    Quản lý ví
                  </Link>
                </div>
              )}
            </div>
          )}

          <Link href={`${homeRoute}/profile`}>
            <DropdownMenuItem className="cursor-pointer">
              <UserCircle className="mr-2 h-4 w-4" />
              <span>Hồ sơ cá nhân</span>
            </DropdownMenuItem>
          </Link>
          {role === 'STUDENT' && (
            <Link href={ROUTES.STUDENT.WALLET}>
              <DropdownMenuItem className="cursor-pointer">
                <History className="mr-2 h-4 w-4" />
                <span>Lịch sử giao dịch</span>
              </DropdownMenuItem>
            </Link>
          )}

          <DropdownMenuItem className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Cài đặt hệ thống</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50"
            onClick={() => logout()}
            disabled={isPending}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>{isPending ? 'Đang đăng xuất...' : 'Đăng xuất'}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <nav className="fixed w-full z-50 top-0 bg-card/95 backdrop-blur-md border-b border-border shadow-sm transition-colors duration-200">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          
          <div className="flex items-center gap-4">
            <MobileNav />
            <Link href={homeRoute} className="flex-shrink-0 flex items-center gap-2 cursor-pointer outline-none group">
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">
                <School size={20} />
              </div>
              <span className="font-bold text-xl text-primary tracking-tight hidden sm:block">EArena</span>
              {role === 'TEACHER' && (
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-muted-foreground uppercase tracking-wide border border-border ml-1">
                  Teacher
                </span>
              )}
            </Link>
          </div>

          <DesktopNav />

          <div className="flex items-center space-x-2 sm:space-x-4">
            <NavbarWalletBadge />

            <NotificationDropdown />
            
            <div className="h-8 w-px bg-border mx-1 hidden sm:block"></div>
            <UserDropdown />
          </div>

        </div>
      </div>
    </nav>
  );
}