import { ForgotPasswordScreen } from '@/features/auth/components/ForgotPasswordScreen';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black p-4">
      <div className="w-full max-w-md space-y-6">
        <ForgotPasswordScreen />
        <div className="text-center text-sm text-gray-500">
          Nhớ mật khẩu rồi?{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Quay lại Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}