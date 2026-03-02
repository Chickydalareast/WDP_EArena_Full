import { RegisterScreen } from '@/features/auth/components/RegisterScreen';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <RegisterScreen />

        <div className="text-center text-sm text-muted-foreground">
          Đã có tài khoản?{' '}
          <Link href="/login" className="font-medium text-primary hover:opacity-90">
            Quay lại Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
