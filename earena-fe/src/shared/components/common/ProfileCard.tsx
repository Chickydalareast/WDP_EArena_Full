'use client';

import { useAuthStore } from '@/features/auth/stores/auth.store';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { Button } from '@/shared/components/ui/button';
import { LogOut, UserCircle2, Mail, ShieldAlert } from 'lucide-react';

export function ProfileCard() {
  const { user, isInitialized } = useAuthStore();
  const { mutate: logout, isPending } = useLogout();

  // Thêm log để bắt bệnh trực tiếp trên Console
  console.log('[ProfileCard Debug] isInitialized:', isInitialized, ' | user:', user);

  if (!user) {
    return (
      <div className="p-4 border border-red-400 bg-red-50 text-red-600 rounded-lg text-sm">
        [Debug UI] Không tìm thấy dữ liệu User Session trong RAM. <br/>
        Vui lòng kiểm tra lại AuthProvider hoặc Tab F12 Network.
      </div>
    );
  }

  return (
    <div className="w-full max-w-md p-6 bg-white border border-gray-200 rounded-xl shadow-sm dark:bg-gray-900 dark:border-gray-800">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-full dark:bg-blue-900/30 dark:text-blue-400">
          <UserCircle2 size={32} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {user.fullName || 'Người dùng hệ thống'}
          </h3>
          <p className="text-sm text-gray-500 font-mono">ID: {user.id}</p>
        </div>
      </div>

      <div className="space-y-3 mb-8">
        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
          <Mail size={16} className="text-gray-400" />
          <span>{user.email}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
          <ShieldAlert size={16} className={
            user.role === 'ADMIN' ? 'text-red-500' : 
            user.role === 'TEACHER' ? 'text-purple-500' : 'text-green-500'
          } />
          <span className="font-semibold uppercase tracking-wider">{user.role}</span>
        </div>
      </div>

      <Button 
        variant="destructive" 
        className="w-full flex items-center justify-center gap-2"
        onClick={() => logout()}
        disabled={isPending}
      >
        <LogOut size={16} />
        {isPending ? 'Đang xử lý...' : 'Đăng xuất an toàn'}
      </Button>
    </div>
  );
}