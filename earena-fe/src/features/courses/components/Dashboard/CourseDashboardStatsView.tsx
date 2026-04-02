'use client';

import { useCourseDashboardStats } from '../../hooks/useCourseSettings';
import { Skeleton } from '@/shared/components/ui/skeleton';
import {
    Users,
    TrendingUp,
    Star,
    MessageSquareWarning,
    Wallet,
    Clock
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface CourseDashboardStatsViewProps {
    courseId: string;
}

export function CourseDashboardStatsView({ courseId }: CourseDashboardStatsViewProps) {
    const { data: stats, isLoading } = useCourseDashboardStats(courseId);

    // Format tiền tệ an toàn (Fallback nếu formatCurrency trong utils chưa hoàn thiện)
    const formatVND = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-[120px] w-full rounded-xl" />
                ))}
            </div>
        );
    }

    // Dữ liệu mặc định nếu API lỗi hoặc chưa có
    const totalStudents = stats?.totalStudents || 0;
    const averageProgress = stats?.averageProgress || 0;
    const averageRating = stats?.averageRating || 0;
    const totalReviews = stats?.totalReviews || 0;
    const pendingReviews = stats?.pendingReviews || 0;
    const totalRevenue = stats?.totalRevenue || 0;

    const kpis = [
        {
            title: 'Doanh thu thực nhận',
            value: formatVND(totalRevenue),
            icon: Wallet,
            colorClass: 'text-green-600 dark:text-green-400',
            bgClass: 'bg-green-100 dark:bg-green-900/30',
            description: 'Tổng tiền từ khóa học này',
        },
        {
            title: 'Học viên ghi danh',
            value: totalStudents.toLocaleString('vi-VN'),
            icon: Users,
            colorClass: 'text-blue-600 dark:text-blue-400',
            bgClass: 'bg-blue-100 dark:bg-blue-900/30',
            description: 'Tổng số học sinh (Active)',
        },
        {
            title: 'Tiến độ trung bình',
            value: `${averageProgress.toFixed(1)}%`,
            icon: TrendingUp,
            colorClass: 'text-primary',
            bgClass: 'bg-primary/10',
            description: 'Tiến độ hoàn thành bài học',
        },
        {
            title: 'Điểm đánh giá',
            value: `${averageRating.toFixed(1)} / 5.0`,
            icon: Star,
            colorClass: 'text-yellow-600 dark:text-yellow-500',
            bgClass: 'bg-yellow-100 dark:bg-yellow-900/30',
            description: `Dựa trên ${totalReviews} lượt đánh giá`,
        },
        {
            title: 'Chờ phản hồi',
            value: pendingReviews.toString(),
            icon: MessageSquareWarning,
            colorClass: pendingReviews > 0 ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground',
            bgClass: pendingReviews > 0 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-muted',
            description: pendingReviews > 0 ? 'Cần bạn trả lời ngay!' : 'Tất cả đã được giải đáp',
            alert: pendingReviews > 0,
        },
    ];

    return (
        <div className="space-y-6">
            {/* Banner Cảnh báo Cache (Yêu cầu bắt buộc từ BE) */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 text-sm">
                <Clock className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                    <strong className="block font-semibold">Lưu ý về Dữ liệu Thống kê</strong>
                    <p>Để tối ưu hiệu suất hệ thống, các số liệu trên trang này được làm mới <strong className="font-bold">mỗi 5 phút một lần</strong>. Doanh thu và lượt mua mới nhất có thể cần vài phút để cập nhật.</p>
                </div>
            </div>

            {/* Grid KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {kpis.map((kpi, index) => (
                    <div
                        key={index}
                        className={cn(
                            "relative bg-card text-card-foreground p-5 rounded-xl border border-border shadow-sm flex flex-col justify-between overflow-hidden group transition-all",
                            kpi.alert ? "border-red-300 dark:border-red-800" : "hover:border-primary/50"
                        )}
                    >
                        {/* Nếu có alert đỏ, thêm hiệu ứng ping nhẹ */}
                        {kpi.alert && (
                            <span className="absolute top-4 right-4 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                        )}

                        <div className="flex justify-between items-start mb-4">
                            <h4 className="text-sm font-semibold text-muted-foreground">{kpi.title}</h4>
                            <div className={cn("p-2 rounded-lg", kpi.bgClass, kpi.colorClass)}>
                                <kpi.icon className="w-5 h-5" />
                            </div>
                        </div>

                        <div>
                            <div className="text-2xl font-extrabold tracking-tight mb-1">{kpi.value}</div>
                            <div className="text-xs text-muted-foreground">
                                {kpi.description}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}