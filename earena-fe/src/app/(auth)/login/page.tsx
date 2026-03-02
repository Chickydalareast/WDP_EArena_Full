import { LoginForm } from '@/features/auth/components/LoginForm';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 bg-card/80 p-8 rounded-2xl shadow-sm border border-border">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Đăng nhập EArena</h1>
          <p className="mt-2 text-sm text-muted-foreground">Chào mừng bạn quay trở lại hệ thống</p>
        </div>

        <LoginForm />

        <div className="flex flex-col space-y-2 text-center text-sm">
          <Link href="/forgot-password" className="font-medium text-primary hover:opacity-90">
            Quên mật khẩu?
          </Link>
          <div className="text-muted-foreground">
            Chưa có tài khoản?{' '}
            <Link href="/register" className="font-medium text-primary hover:opacity-90">
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
