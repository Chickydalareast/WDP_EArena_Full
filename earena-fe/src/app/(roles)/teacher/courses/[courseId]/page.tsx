import { Metadata } from "next";
import { BarChart2 } from "lucide-react";
import { CourseDashboardStatsView } from "@/features/courses/components/Dashboard/CourseDashboardStatsView";

export const metadata: Metadata = {
    title: "Tổng quan khóa học | EArena Teacher",
};

export default async function CourseDashboardPage({
    params,
}: {
    params: Promise<{ courseId: string }>;
}) {
    const resolvedParams = await params;
    const courseId = resolvedParams.courseId;

    return (
        <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <BarChart2 className="w-6 h-6 text-primary" />
                        Phân tích & Thống kê
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Theo dõi doanh thu, hiệu suất và tình hình học tập của học viên.
                    </p>
                </div>
            </div>

            {/* Gọi Client Component chuyên fetch data thống kê */}
            <CourseDashboardStatsView courseId={courseId} />

        </div>
    );
}