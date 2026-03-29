'use client';

import { useState, useMemo } from 'react';
import { useAdminCoursesMasterList, useApproveCourse } from '../hooks/useAdminCourses';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { DataTable, PaginationBar } from '../components/DataTable';
import { formatCurrency } from '@/shared/lib/utils';
import { format } from 'date-fns';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { CheckCircle, XCircle, Loader2, Eye, Search, AlertOctagon } from 'lucide-react';
import { RejectCourseModal } from '../components/RejectCourseModal';
import { AdminCoursePreviewModal } from '../components/AdminCoursePreviewModal';
import { ForceTakedownModal } from '../components/ForceTakedownModal';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { MasterListCourseStatus } from '../types/admin.types';

const columns = [
    { key: 'title', header: 'Tên khóa học', className: 'w-[25%]' },
    { key: 'teacherName', header: 'Giáo viên', className: 'w-[15%]' },
    { key: 'price', header: 'Giá bán', className: 'w-[15%]' },
    { key: 'status', header: 'Trạng thái', className: 'w-[15%]' },
    { key: 'submittedAt', header: 'Ngày gửi duyệt', className: 'w-[15%]' },
    { key: 'actions', header: 'Thao tác', className: 'w-[15%] text-right' },
];

export function AdminCoursesScreen() {
    const [page, setPage] = useState(1);
    
    // States cho Filter & Search
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);
    const [statusFilter, setStatusFilter] = useState<MasterListCourseStatus | 'ALL'>('PENDING_REVIEW'); // Mặc định mở lên là chờ duyệt cho tiện

    // States điều khiển Modals
    const [rejectId, setRejectId] = useState<string | null>(null);
    const [previewCourseId, setPreviewCourseId] = useState<string | null>(null);
    const [takedownCourse, setTakedownCourse] = useState<{ id: string, title: string } | null>(null);

    // Xử lý param an toàn trước khi gọi API (tránh truyền 'ALL' xuống BE)
    const validStatus = statusFilter === 'ALL' ? undefined : statusFilter;

    const { data, isLoading } = useAdminCoursesMasterList({ 
        page, 
        limit: 10, 
        search: debouncedSearch || undefined,
        status: validStatus
    });

    const { mutate: approveCourse, isPending: isApproving } = useApproveCourse();

    const rows = useMemo(() => {
        const courseList = (data as any)?.data || [];
        if (!courseList || courseList.length === 0) return [];

        return courseList.map((course: any) => {
            // Chuẩn bị Badge Trạng thái
            let statusBadge;
            switch (course.status) {
                case 'PENDING_REVIEW':
                    statusBadge = <span className="inline-flex px-2 py-1 rounded-md text-xs font-bold bg-yellow-500/10 text-yellow-600 border border-yellow-500/20">Chờ duyệt</span>;
                    break;
                case 'PUBLISHED':
                    statusBadge = <span className="inline-flex px-2 py-1 rounded-md text-xs font-bold bg-green-500/10 text-green-600 border border-green-500/20">Đang On-air</span>;
                    break;
                case 'REJECTED':
                    statusBadge = <span className="inline-flex px-2 py-1 rounded-md text-xs font-bold bg-red-500/10 text-red-600 border border-red-500/20">Bị từ chối</span>;
                    break;
                case 'ARCHIVED':
                    statusBadge = <span className="inline-flex px-2 py-1 rounded-md text-xs font-bold bg-gray-500/10 text-gray-600 border border-gray-500/20">Lưu trữ</span>;
                    break;
                default:
                    statusBadge = <span>{course.status}</span>;
            }

            return {
                title: <span className="font-semibold text-foreground line-clamp-2" title={course.title}>{course.title}</span>,
                teacherName: <span className="text-sm">{course.teacher?.fullName || 'Không rõ'}</span>,
                price: <span className="text-primary font-medium">{formatCurrency(course.price)}</span>,
                status: statusBadge,
                submittedAt: <span className="text-xs text-muted-foreground">
                    {course.submittedAt ? format(new Date(course.submittedAt), 'dd/MM/yyyy HH:mm') : '—'}
                </span>,
                actions: (
                    <div className="flex items-center justify-end gap-2">
                        {/* Nút Xem chi tiết luôn hiển thị */}
                        <Button variant="outline" size="sm" className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200" onClick={() => setPreviewCourseId(course.id)} disabled={isApproving}>
                            <Eye className="w-4 h-4" />
                        </Button>

                        {/* Thao tác cho khóa học CHỜ DUYỆT */}
                        {course.status === 'PENDING_REVIEW' && (
                            <>
                                <Button variant="outline" size="sm" className="h-8 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200" onClick={() => approveCourse(course.id)} disabled={isApproving}>
                                    {isApproving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                </Button>
                                <Button variant="outline" size="sm" className="h-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-200" onClick={() => setRejectId(course.id)} disabled={isApproving}>
                                    <XCircle className="w-4 h-4" />
                                </Button>
                            </>
                        )}

                        {/* Thao tác quyền lực tối thượng cho khóa học PUBLISHED */}
                        {course.status === 'PUBLISHED' && (
                            <Button variant="destructive" size="sm" className="h-8 bg-red-600 hover:bg-red-700 text-white font-semibold" onClick={() => setTakedownCourse({ id: course.id, title: course.title })} disabled={isApproving}>
                                <AlertOctagon className="w-4 h-4 mr-1" /> Gỡ khẩn cấp
                            </Button>
                        )}
                    </div>
                ),
            };
        });
    }, [data, approveCourse, isApproving]);

    const metaInfo = (data as any)?.meta;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Quản Trị Tổng Khóa Học</h2>
                <p className="text-muted-foreground text-sm mt-1">Tìm kiếm, phê duyệt, từ chối hoặc gỡ bỏ khóa học vi phạm khỏi hệ thống.</p>
            </div>

            {/* Toolbar: Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-2xl border border-border shadow-sm">
                <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                        placeholder="Tìm theo tên khóa học..." 
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                        className="pl-9 bg-background"
                    />
                </div>
                <div className="w-full sm:w-[200px]">
                    <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val as any); setPage(1); }}>
                        <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Lọc trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Tất cả (Trừ Nháp)</SelectItem>
                            <SelectItem value="PENDING_REVIEW">Đang chờ duyệt</SelectItem>
                            <SelectItem value="PUBLISHED">Đang On-air</SelectItem>
                            <SelectItem value="REJECTED">Bị từ chối</SelectItem>
                            <SelectItem value="ARCHIVED">Đã lưu trữ</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-12 w-full rounded-xl" />
                    <Skeleton className="h-[400px] w-full rounded-2xl" />
                </div>
            ) : (
                <div className="space-y-4">
                    <DataTable columns={columns} rows={rows} empty="Không tìm thấy khóa học nào phù hợp." />

                    {metaInfo && metaInfo.totalPages > 1 && (
                        <PaginationBar
                            page={metaInfo.page}
                            totalPages={metaInfo.totalPages}
                            onPageChange={setPage}
                        />
                    )}
                </div>
            )}

            {/* Modals Layer */}
            <RejectCourseModal courseId={rejectId} isOpen={!!rejectId} onClose={() => setRejectId(null)} />
            <AdminCoursePreviewModal courseId={previewCourseId} isOpen={!!previewCourseId} onClose={() => setPreviewCourseId(null)} />
            <ForceTakedownModal 
                courseId={takedownCourse?.id || null} 
                courseTitle={takedownCourse?.title}
                isOpen={!!takedownCourse} 
                onClose={() => setTakedownCourse(null)} 
            />
        </div>
    );
}