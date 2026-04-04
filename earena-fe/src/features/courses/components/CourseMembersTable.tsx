'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTrackingMembers } from '../hooks/useTrackingMembers';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Search, History, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { StudentTrackingSheet } from './StudentTrackingSheet';

interface CourseMembersTableProps {
    courseId: string;
}

export function CourseMembersTable({ courseId }: CourseMembersTableProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // 1. Lấy param từ URL (Source of Truth)
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;
    const urlSearch = searchParams.get('search') || '';
    const sortBy = (searchParams.get('sortBy') as 'progress' | 'createdAt') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

    // 2. Local state cho ô Input + Debounce
    const [localSearch, setLocalSearch] = useState(urlSearch);
    const debouncedSearch = useDebounce(localSearch, 500);

    // 3. State quản lý Sheet (Modal) chi tiết học viên
    const [selectedStudent, setSelectedStudent] = useState<{ id: string; name: string } | null>(null);

    // 4. Hàm đồng bộ URL chung
    const updateQueryParams = useCallback((updates: Record<string, string | number | null>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === '') {
                params.delete(key);
            } else {
                params.set(key, String(value));
            }
        });
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, [searchParams, pathname, router]);

    // 5. Lắng nghe debounce để đẩy lên URL
    useEffect(() => {
        if (debouncedSearch !== urlSearch) {
            updateQueryParams({ search: debouncedSearch, page: 1 }); // Reset về trang 1 khi search
        }
    }, [debouncedSearch, urlSearch, updateQueryParams]);

    // 6. Fetch Data (Tanstack Query)
    const { data, isLoading, isFetching, isError } = useTrackingMembers(courseId, {
        page, limit, search: urlSearch, sortBy, sortOrder
    });

    // 7. Handlers
    const handleSort = (field: 'progress' | 'createdAt') => {
        const newOrder = sortBy === field && sortOrder === 'desc' ? 'asc' : 'desc';
        updateQueryParams({ sortBy: field, sortOrder: newOrder, page: 1 });
    };

    const handleViewExams = (studentId: string, studentName: string) => {
        setSelectedStudent({ id: studentId, name: studentName });
    };

    if (isError) {
        return (
            <div className="p-8 text-center border rounded-xl bg-destructive/10 text-destructive">
                <p>Đã xảy ra lỗi khi lấy danh sách học viên. Vui lòng thử lại sau.</p>
            </div>
        );
    }

    const members = data?.data || [];
    const meta = data?.meta;

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            {/* Thanh công cụ */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm theo tên hoặc email..."
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            {/* Bảng Dữ liệu */}
            <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground bg-muted/50 uppercase border-b border-border">
                            <tr>
                                <th className="px-6 py-4 font-medium">Học viên</th>
                                <th className="px-6 py-4 font-medium cursor-pointer hover:bg-muted transition-colors" onClick={() => handleSort('progress')}>
                                    <div className="flex items-center gap-2">
                                        Tiến độ học
                                        <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                </th>
                                <th className="px-6 py-4 font-medium text-center">Đã hoàn thành</th>
                                <th className="px-6 py-4 font-medium cursor-pointer hover:bg-muted transition-colors" onClick={() => handleSort('createdAt')}>
                                    <div className="flex items-center gap-2">
                                        Ngày tham gia
                                        <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                </th>
                                <th className="px-6 py-4 font-medium text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, idx) => (
                                    <tr key={idx}>
                                        <td className="px-6 py-4"><Skeleton className="h-10 w-48" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-12 mx-auto" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-8 w-28 ml-auto" /></td>
                                    </tr>
                                ))
                            ) : members.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                        Không tìm thấy học viên nào phù hợp.
                                    </td>
                                </tr>
                            ) : (
                                members.map((member) => (
                                    <tr key={member.userId} className={`hover:bg-muted/30 transition-colors ${isFetching ? 'opacity-50' : ''}`}>
                                        <td className="px-6 py-4 flex items-center gap-3">
                                            {member.avatar ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={member.avatar} alt={member.fullName} className="w-10 h-10 rounded-full object-cover border border-border" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold border border-primary/20">
                                                    {member.fullName.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-semibold text-foreground">{member.fullName}</div>
                                                <div className="text-xs text-muted-foreground">{member.email}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-full bg-secondary rounded-full h-2.5 max-w-[120px] overflow-hidden border border-border/50">
                                                    <div className="bg-primary h-2.5 rounded-full transition-all duration-500" style={{ width: `${member.progress}%` }}></div>
                                                </div>
                                                <span className="text-xs font-medium text-muted-foreground">{member.progress.toFixed(1)}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center font-medium">
                                            {member.completedLessonsCount} bài
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {format(new Date(member.enrolledAt), 'dd/MM/yyyy HH:mm')}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleViewExams(member.userId, member.fullName)}
                                                className="border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                                            >
                                                <History className="h-4 w-4 mr-2" />
                                                Lịch sử thi
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Phân trang */}
            {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                    <p className="text-sm text-muted-foreground">
                        Hiển thị <span className="font-medium text-foreground">{members.length}</span> / <span className="font-medium text-foreground">{meta.total}</span> học viên
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page <= 1}
                            onClick={() => updateQueryParams({ page: page - 1 })}
                        >
                            Trang trước
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page >= meta.totalPages}
                            onClick={() => updateQueryParams({ page: page + 1 })}
                        >
                            Trang sau
                        </Button>
                    </div>
                </div>
            )}

            <StudentTrackingSheet
                courseId={courseId}
                student={selectedStudent}
                onClose={() => setSelectedStudent(null)}
            />
        </div>
    );
}