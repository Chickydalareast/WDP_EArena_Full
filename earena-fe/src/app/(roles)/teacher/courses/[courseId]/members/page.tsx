import { CourseMembersTable } from '@/features/courses/components/CourseMembersTable';
import { Users } from 'lucide-react';

export default async function CourseMembersPage({
    params
}: {
    params: Promise<{ courseId: string }>
}) {
    const resolvedParams = await params;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
                <div>
                    <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                        <Users className="w-6 h-6 text-primary" />
                        Quản lý Học viên
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Theo dõi tiến độ học tập và kiểm tra lịch sử làm bài thi của các học viên đã đăng ký.
                    </p>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <CourseMembersTable courseId={resolvedParams.courseId} />
            </div>
        </div>
    );
}