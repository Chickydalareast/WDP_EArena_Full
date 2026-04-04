'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { courseService } from '../api/course.service';
import { courseQueryKeys } from '../api/course-keys';
import { axiosClient } from '@/shared/lib/axios-client';
import { API_ENDPOINTS } from '@/config/api-endpoints';
import { formatCurrency } from '@/shared/lib/utils';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const OPTIONS: { days: 7 | 14 | 30; label: string }[] = [
  { days: 7, label: '7 ngày' },
  { days: 14, label: '14 ngày' },
  { days: 30, label: '30 ngày' },
];

export function PromoteCourseModal({
  open,
  onOpenChange,
  courseId,
  courseTitle,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  courseId: string;
  courseTitle: string;
}) {
  const qc = useQueryClient();
  const [days, setDays] = useState<7 | 14 | 30>(7);

  const { data: featured } = useQuery({
    queryKey: courseQueryKeys.featuredCarousel(),
    queryFn: () => courseService.getFeaturedCarousel(),
    enabled: open,
    staleTime: 60_000,
  });
  const pricePerDay = featured?.promoPricePerDay ?? 50_000;

  const { data: wallet } = useQuery({
    queryKey: courseQueryKeys.walletBalance(),
    queryFn: async () => {
      return axiosClient.get(API_ENDPOINTS.WALLETS.ME) as Promise<{ balance: number }>;
    },
    enabled: open,
  });

  const total = pricePerDay * days;

  const promote = useMutation({
    mutationFn: () => courseService.promoteCourse(courseId, days),
    onSuccess: () => {
      toast.success('Đã kích hoạt quảng cáo — khóa học sẽ hiện trên slider.');
      qc.invalidateQueries({ queryKey: courseQueryKeys.featuredCarousel() });
      qc.invalidateQueries({ queryKey: courseQueryKeys.teacherCourses() });
      qc.invalidateQueries({ queryKey: courseQueryKeys.walletBalance() });
      onOpenChange(false);
    },
    onError: (e: unknown) => {
      const msg = e instanceof Error ? e.message : 'Không thực hiện được';
      toast.error(msg);
    },
  });

  const balance = wallet?.balance ?? 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Quảng cáo khóa học</DialogTitle>
          <DialogDescription className="line-clamp-2">
            {courseTitle}
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Trừ Coin trong ví. Khóa đã xuất bản sẽ xuất hiện trên slider &quot;Khóa học nổi bật&quot; ở trang danh
          sách khóa học công khai.
        </p>
        <div className="flex flex-wrap gap-2 py-2">
          {OPTIONS.map((o) => (
            <Button
              key={o.days}
              type="button"
              variant={days === o.days ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDays(o.days)}
            >
              {o.label}
            </Button>
          ))}
        </div>
        <div className="rounded-lg border bg-muted/40 p-3 text-sm space-y-1">
          <div className="flex justify-between">
            <span>Giá ước tính / ngày</span>
            <span className="font-medium">{formatCurrency(pricePerDay)}</span>
          </div>
          <div className="flex justify-between font-bold text-primary">
            <span>Tổng thanh toán</span>
            <span>{formatCurrency(total)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Số dư ví</span>
            <span>{formatCurrency(balance)}</span>
          </div>
        </div>
        <Button
          className="w-full"
          disabled={promote.isPending || balance < total}
          onClick={() => promote.mutate()}
        >
          {promote.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Xác nhận & thanh toán'
          )}
        </Button>
        {balance < total && (
          <p className="text-xs text-destructive text-center">Số dư ví không đủ.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
