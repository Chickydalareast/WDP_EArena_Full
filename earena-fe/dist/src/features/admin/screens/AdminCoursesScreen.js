'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminCoursesScreen = AdminCoursesScreen;
const react_1 = require("react");
const useAdminCourses_1 = require("../hooks/useAdminCourses");
const useDebounce_1 = require("@/shared/hooks/useDebounce");
const DataTable_1 = require("../components/DataTable");
const utils_1 = require("@/shared/lib/utils");
const date_fns_1 = require("date-fns");
const button_1 = require("@/shared/components/ui/button");
const input_1 = require("@/shared/components/ui/input");
const select_1 = require("@/shared/components/ui/select");
const lucide_react_1 = require("lucide-react");
const RejectCourseModal_1 = require("../components/RejectCourseModal");
const AdminCoursePreviewModal_1 = require("../components/AdminCoursePreviewModal");
const ForceTakedownModal_1 = require("../components/ForceTakedownModal");
const skeleton_1 = require("@/shared/components/ui/skeleton");
const columns = [
    { key: 'title', header: 'Tên khóa học', className: 'w-[25%]' },
    { key: 'teacherName', header: 'Giáo viên', className: 'w-[15%]' },
    { key: 'price', header: 'Giá bán', className: 'w-[15%]' },
    { key: 'status', header: 'Trạng thái', className: 'w-[15%]' },
    { key: 'submittedAt', header: 'Ngày gửi duyệt', className: 'w-[15%]' },
    { key: 'actions', header: 'Thao tác', className: 'w-[15%] text-right' },
];
function AdminCoursesScreen() {
    const [page, setPage] = (0, react_1.useState)(1);
    const [searchTerm, setSearchTerm] = (0, react_1.useState)('');
    const debouncedSearch = (0, useDebounce_1.useDebounce)(searchTerm, 500);
    const [statusFilter, setStatusFilter] = (0, react_1.useState)('PENDING_REVIEW');
    const [rejectId, setRejectId] = (0, react_1.useState)(null);
    const [previewCourseId, setPreviewCourseId] = (0, react_1.useState)(null);
    const [takedownCourse, setTakedownCourse] = (0, react_1.useState)(null);
    const validStatus = statusFilter === 'ALL' ? undefined : statusFilter;
    const { data, isLoading } = (0, useAdminCourses_1.useAdminCoursesMasterList)({
        page,
        limit: 10,
        search: debouncedSearch || undefined,
        status: validStatus
    });
    const { mutate: approveCourse, isPending: isApproving } = (0, useAdminCourses_1.useApproveCourse)();
    const rows = (0, react_1.useMemo)(() => {
        const courseList = data?.data || [];
        if (!courseList || courseList.length === 0)
            return [];
        return courseList.map((course) => {
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
                price: <span className="text-primary font-medium">{(0, utils_1.formatCurrency)(course.price)}</span>,
                status: statusBadge,
                submittedAt: <span className="text-xs text-muted-foreground">
                    {course.submittedAt ? (0, date_fns_1.format)(new Date(course.submittedAt), 'dd/MM/yyyy HH:mm') : '—'}
                </span>,
                actions: (<div className="flex items-center justify-end gap-2">
                        
                        <button_1.Button variant="outline" size="sm" className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200" onClick={() => setPreviewCourseId(course.id)} disabled={isApproving}>
                            <lucide_react_1.Eye className="w-4 h-4"/>
                        </button_1.Button>

                        
                        {course.status === 'PENDING_REVIEW' && (<>
                                <button_1.Button variant="outline" size="sm" className="h-8 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200" onClick={() => approveCourse(course.id)} disabled={isApproving}>
                                    {isApproving ? <lucide_react_1.Loader2 className="w-4 h-4 animate-spin"/> : <lucide_react_1.CheckCircle className="w-4 h-4"/>}
                                </button_1.Button>
                                <button_1.Button variant="outline" size="sm" className="h-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-200" onClick={() => setRejectId(course.id)} disabled={isApproving}>
                                    <lucide_react_1.XCircle className="w-4 h-4"/>
                                </button_1.Button>
                            </>)}

                        
                        {course.status === 'PUBLISHED' && (<button_1.Button variant="destructive" size="sm" className="h-8 bg-red-600 hover:bg-red-700 text-white font-semibold" onClick={() => setTakedownCourse({ id: course.id, title: course.title })} disabled={isApproving}>
                                <lucide_react_1.AlertOctagon className="w-4 h-4 mr-1"/> Gỡ khẩn cấp
                            </button_1.Button>)}
                    </div>),
            };
        });
    }, [data, approveCourse, isApproving]);
    const metaInfo = data?.meta;
    return (<div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Quản Trị Tổng Khóa Học</h2>
                <p className="text-muted-foreground text-sm mt-1">Tìm kiếm, phê duyệt, từ chối hoặc gỡ bỏ khóa học vi phạm khỏi hệ thống.</p>
            </div>

            
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-2xl border border-border shadow-sm">
                <div className="relative w-full sm:max-w-md">
                    <lucide_react_1.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                    <input_1.Input placeholder="Tìm theo tên khóa học..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }} className="pl-9 bg-background"/>
                </div>
                <div className="w-full sm:w-[200px]">
                    <select_1.Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1); }}>
                        <select_1.SelectTrigger className="bg-background">
                            <select_1.SelectValue placeholder="Lọc trạng thái"/>
                        </select_1.SelectTrigger>
                        <select_1.SelectContent>
                            <select_1.SelectItem value="ALL">Tất cả (Trừ Nháp)</select_1.SelectItem>
                            <select_1.SelectItem value="PENDING_REVIEW">Đang chờ duyệt</select_1.SelectItem>
                            <select_1.SelectItem value="PUBLISHED">Đang On-air</select_1.SelectItem>
                            <select_1.SelectItem value="REJECTED">Bị từ chối</select_1.SelectItem>
                            <select_1.SelectItem value="ARCHIVED">Đã lưu trữ</select_1.SelectItem>
                        </select_1.SelectContent>
                    </select_1.Select>
                </div>
            </div>

            {isLoading ? (<div className="space-y-4">
                    <skeleton_1.Skeleton className="h-12 w-full rounded-xl"/>
                    <skeleton_1.Skeleton className="h-[400px] w-full rounded-2xl"/>
                </div>) : (<div className="space-y-4">
                    <DataTable_1.DataTable columns={columns} rows={rows} empty="Không tìm thấy khóa học nào phù hợp."/>

                    {metaInfo && metaInfo.totalPages > 1 && (<DataTable_1.PaginationBar page={metaInfo.page} totalPages={metaInfo.totalPages} onPageChange={setPage}/>)}
                </div>)}

            
            <RejectCourseModal_1.RejectCourseModal courseId={rejectId} isOpen={!!rejectId} onClose={() => setRejectId(null)}/>
            <AdminCoursePreviewModal_1.AdminCoursePreviewModal courseId={previewCourseId} isOpen={!!previewCourseId} onClose={() => setPreviewCourseId(null)}/>
            <ForceTakedownModal_1.ForceTakedownModal courseId={takedownCourse?.id || null} courseTitle={takedownCourse?.title} isOpen={!!takedownCourse} onClose={() => setTakedownCourse(null)}/>
        </div>);
}
//# sourceMappingURL=AdminCoursesScreen.js.map