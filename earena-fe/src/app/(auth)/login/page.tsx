import { LoginForm } from '@/features/auth/components/LoginForm';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black p-4">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Đăng nhập EArena
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Chào mừng bạn quay trở lại hệ thống
          </p>
        </div>

        {/* Gọi Component LoginForm bạn đã có */}
        <LoginForm />

        <div className="flex flex-col space-y-2 text-center text-sm">
          <Link 
            href="/forgot-password" 
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            Quên mật khẩu?
          </Link>
          <div className="text-gray-500">
            Chưa có tài khoản?{' '}
            <Link 
              href="/register" 
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              Đăng ký ngay
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}