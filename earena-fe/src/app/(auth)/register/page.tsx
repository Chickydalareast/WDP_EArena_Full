import { RegisterScreen } from '@/features/auth/components/RegisterScreen';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black p-4">
      <div className="w-full max-w-md space-y-6">
        
        {/* Gọi Component RegisterScreen gồm 3 bước của bạn */}
        <RegisterScreen />

        <div className="text-center text-sm text-gray-500">
          Đã có tài khoản?{' '}
          <Link 
            href="/login" 
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            Quay lại Đăng nhập
          </Link>
        </div>

      </div>
    </div>
  );
}