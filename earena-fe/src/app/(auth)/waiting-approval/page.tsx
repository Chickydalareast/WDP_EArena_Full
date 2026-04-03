'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { authKeys, authService } from '@/features/auth/api/auth.service';
import { env } from '@/config/env';
import { API_ENDPOINTS } from '@/config/api-endpoints';
import { ROUTES } from '@/config/routes';
import { Clock, LogOut } from 'lucide-react';

export default function WaitingApprovalPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const refreshedJwt = useRef(false);

  const { data: user } = useQuery({
    queryKey: authKeys.session(),
    queryFn: authService.getProfile,
    staleTime: 0,
    refetchInterval: 12_000,
    retry: false,
  });

  useEffect(() => {
    if (!user || user.role !== 'TEACHER') return;
    if (user.teacherVerificationStatus !== 'VERIFIED') return;

    (async () => {
      if (!refreshedJwt.current) {
        refreshedJwt.current = true;
        try {
          await axios.post(
            `${env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
            {},
            { withCredentials: true },
          );
        } catch {
          /* vẫn cho phép chuyển trang; middleware có thể cập nhật sau lần tải tiếp theo */
        }
      }
      queryClient.setQueryData(authKeys.session(), user);
      router.replace(ROUTES.TEACHER.DASHBOARD);
    })();
  }, [user, router, queryClient]);

  return (
    <div className="bg-background text-foreground antialiased min-h-screen flex flex-col lg:flex-row transition-colors duration-200">

      {/* Left panel - same as login */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative flex-col justify-center items-center text-primary-foreground p-12 overflow-hidden">
        <div className="relative z-10 max-w-lg text-center flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-8 leading-tight">
            Chào mừng bạn <br />
            <span className="text-white">đến với EArena</span>
          </h1>
          <p className="text-xl text-primary-foreground/90 font-medium mb-12 leading-relaxed">
            Hệ thống đang chờ Admin xác minh tài khoản giáo viên của bạn.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-md space-y-8 text-center">

          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full bg-yellow-100 flex items-center justify-center shadow-lg">
              <Clock className="w-12 h-12 text-yellow-600" />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Đang chờ xác minh
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed">
              Tài khoản của bạn đang được Admin kiểm tra.
              <br />
              Vui lòng quay lại sau khi được duyệt.
            </p>
          </div>

          {/* Info card */}
          <div className="bg-muted/40 rounded-2xl p-5 text-left space-y-3 border border-border">
            <p className="text-sm font-semibold text-foreground">Quy trình xác minh:</p>
            <ol className="text-sm text-muted-foreground space-y-2">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">1</span>
                <span>Bạn đã đăng ký và upload bằng cấp</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">2</span>
                <span>Admin sẽ xem xét hồ sơ trong vòng 24h</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">3</span>
                <span>Bạn sẽ nhận email thông báo kết quả</span>
              </li>
            </ol>
          </div>

          {/* Logout button */}
          <button
            onClick={() => logout()}
            disabled={isLoggingOut}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" />
            {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
          </button>
        </div>
      </div>
    </div>
  );
}
