'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { UserCircle, Settings, LogOut, Bell, Search, School } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { ROUTES } from '@/config/routes';

// --- BỘ NÃO SEARCH CHUẨN NEXT.JS ---
function HeaderSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialQuery = searchParams.get('q') || '';
  const [searchValue, setSearchValue] = useState(initialQuery);
  const debouncedSearch = useDebounce(searchValue, 500);


  useEffect(() => {
    // Không sync nếu giá trị không đổi
    if (debouncedSearch === (searchParams.get('q') || '')) return;

    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearch) {
      params.set('q', debouncedSearch);
    } else {
      params.delete('q');
    }

    // Logic định tuyến thông minh:
    // Nếu đang không ở Dashboard mà gõ search -> Đá về Dashboard kèm keyword
    if (pathname !== '/student') {
      if (debouncedSearch) router.push(`/student?${params.toString()}`);
    } else {
      // Đang ở Dashboard -> Dùng replace để update URL mà không tạo rác trong History Back
      router.replace(`?${params.toString()}`);
    }
  }, [debouncedSearch, pathname, router, searchParams]);

  return (
    <div className="hidden md:flex flex-1 max-w-xl relative group">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search size={18} className="text-muted-foreground" />
      </div>
      <input
        type="text"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder="Tìm lớp học, bài giảng, giáo viên..."
        className="block w-full pl-10 pr-3 py-2 border border-border rounded-full leading-5 bg-muted/50 text-foreground placeholder-muted-foreground focus:outline-none focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm transition-all shadow-sm"
      />
    </div>
  );
}

// --- NAVBAR CHÍNH ---
export function StudentNavbar() {
  const { user } = useAuthStore();
  const { mutate: logout, isPending } = useLogout();


  const [imageError, setImageError] = useState(false);
  console.log("Current User in Store:", user)

  return (
    <nav className="fixed w-full z-50 top-0 bg-card/95 backdrop-blur-md border-b border-border shadow-sm transition-colors duration-200">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-8">

          {/* Logo */}
          <Link href="/student" className="flex-shrink-0 flex items-center gap-2 cursor-pointer outline-none">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/30">
              <School size={20} />
            </div>
            <span className="font-bold text-xl text-primary tracking-tight">EArena</span>
          </Link>

          <Suspense fallback={<div className="hidden md:flex flex-1 max-w-xl bg-muted/50 rounded-full h-9 animate-pulse"></div>}>
            <HeaderSearch />
          </Suspense>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <button className="p-2 text-muted-foreground hover:text-primary transition rounded-full hover:bg-muted relative outline-none">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-background"></span>
            </button>

            <div className="h-8 w-px bg-border mx-2 hidden sm:block"></div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 cursor-pointer hover:bg-muted p-1 rounded-full pr-3 transition outline-none group">
                  {user?.avatar && !imageError ? (
                    <img
                      src={user.avatar}
                      alt={user?.fullName || 'User Avatar'}
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
                    <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                      {user?.fullName || 'Đang tải...'}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                      {user?.role === 'STUDENT' ? 'Học sinh' : (user?.role || 'Học sinh')}
                    </p>
                  </div>
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56 mt-2">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.fullName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <Link href={ROUTES.STUDENT.PROFILE}>
                  <DropdownMenuItem className="cursor-pointer">
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>Hồ sơ cá nhân</span>
                  </DropdownMenuItem>
                </Link>

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

          </div>
        </div>
      </div>
    </nav>
  );
}