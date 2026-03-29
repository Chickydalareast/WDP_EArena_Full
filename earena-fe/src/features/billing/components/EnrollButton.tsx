'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/components/ui/button';
import { Loader2, ShoppingCart, PlayCircle } from 'lucide-react';
import { useCheckoutFlow } from '../hooks/useBillingFlows';
import { CourseBasic } from '@/features/courses/types/course.schema';
import { ROUTES } from '@/config/routes';
import { cn } from '@/shared/lib/utils';

interface EnrollButtonProps {
  course: CourseBasic;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
}

export function EnrollButton({ course, className, variant = 'default', size = 'lg' }: EnrollButtonProps) {
  const router = useRouter();
  const { handleCheckout, isProcessing } = useCheckoutFlow();

  if (course.isEnrolled) {
    return (
      <Button 
        onClick={() => router.push(ROUTES.STUDENT.STUDY_ROOM(course.id))}
        className={cn("bg-emerald-600 hover:bg-emerald-700 text-white font-bold", className)}
        size={size}
      >
        <PlayCircle className="w-5 h-5 mr-2" /> Vào phòng học
      </Button>
    );
  }

  const finalPrice = course.discountPrice ?? course.price;
  const isFree = finalPrice === 0;

  return (
    <Button 
      onClick={() => handleCheckout(course)} 
      disabled={isProcessing}
      variant={variant}
      size={size}
      className={cn("font-bold shadow-md transition-all active:scale-95", className)}
    >
      {isProcessing ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Đang xử lý giao dịch...
        </>
      ) : (
        <>
          <ShoppingCart className="w-5 h-5 mr-2" /> 
          {isFree ? 'Đăng ký Miễn phí' : `Mua ngay - ${finalPrice.toLocaleString()}đ`}
        </>
      )}
    </Button>
  );
}