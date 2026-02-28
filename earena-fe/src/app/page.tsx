import Link from "next/link";
import { Button } from "@/shared/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-black p-4">
      <main className="max-w-3xl text-center space-y-8">
        
        <div className="space-y-4">
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Hệ thống thi trực tuyến <span className="text-blue-600">EArena</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Nền tảng tổ chức thi và kiểm tra năng lực toàn diện, bảo mật cao. 
            Dành cho Học viên, Giáo viên và Quản trị viên.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 pt-8">
          <Link href="/login">
            <Button size="lg" className="px-8">
              Đăng nhập hệ thống
            </Button>
          </Link>
          <Link href="/register">
            <Button size="lg" variant="outline" className="px-8">
              Đăng ký tài khoản
            </Button>
          </Link>
        </div>

      </main>
    </div>
  );
}