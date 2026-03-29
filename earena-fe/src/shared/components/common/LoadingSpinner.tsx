import { Loader2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner = ({ 
  size = 'md', 
  className, 
  fullScreen = false 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const spinner = (
    <Loader2 
      className={cn("animate-spin text-primary", sizeClasses[size], className)} 
      aria-label="Đang xử lý dữ liệu..."
      role="status" 
    />
  );

  // Chế độ khóa toàn màn hình (Dùng khi Submit bài thi)
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-50">
        {spinner}
      </div>
    );
  }

  // Chế độ hiển thị cục bộ (Dùng cho Suspense hoặc loding một danh sách)
  return <div className="flex justify-center items-center p-4">{spinner}</div>;
};  