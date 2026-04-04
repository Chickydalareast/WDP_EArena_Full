'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminTeacherVerificationScreen = AdminTeacherVerificationScreen;
const react_1 = require("react");
const react_query_1 = require("@tanstack/react-query");
const sonner_1 = require("sonner");
const lucide_react_1 = require("lucide-react");
const admin_service_1 = require("../api/admin.service");
const DataTable_1 = require("../components/DataTable");
const dialog_1 = require("@/shared/components/ui/dialog");
const button_1 = require("@/shared/components/ui/button");
const input_1 = require("@/shared/components/ui/input");
const TEACHER_VERIFICATION_COLUMNS = [
    { key: 'teacher', header: 'Giáo viên' },
    { key: 'phone', header: 'Số điện thoại' },
    { key: 'status', header: 'Trạng thái' },
    { key: 'qualifications', header: 'Bằng cấp' },
    { key: 'actions', header: 'Thao tác' },
];
function AdminTeacherVerificationScreen() {
    const qc = (0, react_query_1.useQueryClient)();
    const [page, setPage] = (0, react_1.useState)(1);
    const [search, setSearch] = (0, react_1.useState)('');
    const [status, setStatus] = (0, react_1.useState)('PENDING');
    const [selectedTeacher, setSelectedTeacher] = (0, react_1.useState)(null);
    const [rejectNote, setRejectNote] = (0, react_1.useState)('');
    const [lightboxImage, setLightboxImage] = (0, react_1.useState)(null);
    const params = (0, react_1.useMemo)(() => ({ page, limit: 20, search: search || undefined, status }), [page, search, status]);
    const { data, isLoading } = (0, react_query_1.useQuery)({
        queryKey: ['admin', 'teacher-verifications', params],
        queryFn: () => admin_service_1.adminService.listTeacherVerifications(params),
        staleTime: 0,
    });
    const updateVerificationMut = (0, react_query_1.useMutation)({
        mutationFn: ({ id, status, note }) => admin_service_1.adminService.updateTeacherVerification(id, { status, note }),
        onSuccess: () => {
            sonner_1.toast.success('Cập nhật trạng thái thành công');
            qc.invalidateQueries({ queryKey: ['admin', 'teacher-verifications'] });
            setSelectedTeacher(null);
            setRejectNote('');
        },
        onError: (e) => sonner_1.toast.error('Cập nhật thất bại', { description: e?.message }),
    });
    const handleApprove = (teacher) => {
        updateVerificationMut.mutate({ id: teacher._id, status: 'VERIFIED' });
    };
    const handleReject = () => {
        if (!selectedTeacher)
            return;
        updateVerificationMut.mutate({ id: selectedTeacher._id, status: 'REJECTED', note: rejectNote });
        setRejectNote('');
    };
    const getStatusBadge = (status) => {
        switch (status) {
            case 'VERIFIED':
                return (<span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
            <lucide_react_1.CheckCircle className="w-3 h-3"/> Đã duyệt
          </span>);
            case 'REJECTED':
                return (<span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
            <lucide_react_1.XCircle className="w-3 h-3"/> Từ chối
          </span>);
            default:
                return (<span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">
            <lucide_react_1.Loader2 className="w-3 h-3 animate-spin"/> Chờ duyệt
          </span>);
        }
    };
    const rows = (data?.items || []).map((teacher) => ({
        teacher: (<div className="flex items-center gap-3">
        <img src={teacher.avatar || '/default-avatar.png'} alt={teacher.fullName} className="w-10 h-10 rounded-full object-cover bg-muted"/>
        <div>
          <div className="font-semibold text-foreground">{teacher.fullName}</div>
          <div className="text-xs text-muted-foreground">{teacher.email}</div>
        </div>
      </div>),
        phone: teacher.phone || '-',
        status: getStatusBadge(teacher.teacherVerificationStatus),
        qualifications: (<div className="flex items-center gap-2">
        <span className="text-sm">
          {teacher.qualifications?.length || 0} file(s)
        </span>
        {teacher.hasUploadedQualifications && (<span className="text-xs px-2 py-0.5 rounded bg-green-50 text-green-600">Đã upload</span>)}
      </div>),
        actions: (<div className="flex items-center gap-2">
        <button_1.Button variant="outline" size="sm" onClick={() => setSelectedTeacher(teacher)}>
          <lucide_react_1.Eye className="w-4 h-4 mr-1"/> Chi tiết
        </button_1.Button>
        {teacher.teacherVerificationStatus === 'PENDING' && (<>
            <button_1.Button variant="outline" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleApprove(teacher)} disabled={updateVerificationMut.isPending}>
              <lucide_react_1.CheckCircle className="w-4 h-4 mr-1"/> Duyệt
            </button_1.Button>
            <button_1.Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => setSelectedTeacher(teacher)} disabled={updateVerificationMut.isPending}>
              <lucide_react_1.XCircle className="w-4 h-4 mr-1"/> Từ chối
            </button_1.Button>
          </>)}
      </div>),
    }));
    return (<div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <lucide_react_1.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
          <input_1.Input placeholder="Tìm kiếm theo email, tên..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9"/>
        </div>
        <select className="bg-background/60 border border-border rounded-xl px-3 py-2 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="PENDING">Chờ duyệt</option>
          <option value="VERIFIED">Đã duyệt</option>
          <option value="REJECTED">Từ chối</option>
          <option value="">Tất cả</option>
        </select>
      </div>

      <DataTable_1.DataTable columns={[...TEACHER_VERIFICATION_COLUMNS]} rows={rows} isLoading={isLoading} emptyMessage="Không có giáo viên nào"/>

      {data?.meta && (<DataTable_1.PaginationBar page={data.meta.page} totalPages={data.meta.totalPages} onPageChange={setPage}/>)}

      
      <dialog_1.Dialog open={!!selectedTeacher} onOpenChange={(open) => !open && setSelectedTeacher(null)}>
        <dialog_1.DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>Chi tiết hồ sơ giáo viên</dialog_1.DialogTitle>
            <dialog_1.DialogDescription>
              Xem thông tin và quyết định phê duyệt tài khoản giáo viên
            </dialog_1.DialogDescription>
          </dialog_1.DialogHeader>

          {selectedTeacher && (<div className="space-y-4">
              <div className="flex items-center gap-4">
                <img src={selectedTeacher.avatar || '/default-avatar.png'} alt={selectedTeacher.fullName} className="w-20 h-20 rounded-full object-cover bg-muted"/>
                <div>
                  <h3 className="text-lg font-semibold">{selectedTeacher.fullName}</h3>
                  <p className="text-muted-foreground">{selectedTeacher.email}</p>
                  <p className="text-sm text-muted-foreground">{selectedTeacher.phone || 'Chưa cung cấp'}</p>
                  <div className="mt-2">{getStatusBadge(selectedTeacher.teacherVerificationStatus)}</div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Bằng cấp / Chứng chỉ</h4>
                {selectedTeacher.qualifications && selectedTeacher.qualifications.length > 0 ? (<div className="space-y-2">
                    {selectedTeacher.qualifications.map((q, index) => (<div key={index} className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div className="flex-1">
                          <div className="font-medium">{q.name}</div>
                          <div className="text-xs text-muted-foreground">
                            Upload: {new Date(q.uploadedAt).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                        {q.url && (<button type="button" onClick={() => setLightboxImage(q.url)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm text-primary hover:bg-primary/5 transition-colors">
                            <lucide_react_1.Eye className="w-4 h-4"/>
                            Xem ảnh
                          </button>)}
                        {q.url && (<a href={q.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm text-muted-foreground hover:text-foreground transition-colors">
                            <lucide_react_1.ExternalLink className="w-4 h-4"/>
                          </a>)}
                      </div>))}
                  </div>) : (<p className="text-muted-foreground text-sm">Chưa upload bằng cấp nào</p>)}
              </div>

              {selectedTeacher.teacherVerificationStatus === 'PENDING' && (<div className="border-t pt-4 space-y-3">
                  <h4 className="font-medium">Ghi chú (khi từ chối)</h4>
                  <textarea className="w-full min-h-[80px] p-3 rounded-lg border bg-background" placeholder="Nhập lý do từ chối (sẽ được gửi qua email cho giáo viên, có thể bỏ trống)..." value={rejectNote} onChange={(e) => setRejectNote(e.target.value)}/>
                  <div className="flex gap-3">
                    <button_1.Button variant="default" className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => {
                    updateVerificationMut.mutate({ id: selectedTeacher._id, status: 'VERIFIED' });
                }} disabled={updateVerificationMut.isPending}>
                      <lucide_react_1.CheckCircle className="w-4 h-4 mr-2"/> Duyệt tài khoản
                    </button_1.Button>
                    <button_1.Button variant="destructive" className="flex-1" onClick={() => {
                    handleReject();
                    setSelectedTeacher(null);
                }} disabled={updateVerificationMut.isPending}>
                      <lucide_react_1.XCircle className="w-4 h-4 mr-2"/> Từ chối
                    </button_1.Button>
                  </div>
                </div>)}

              {selectedTeacher.teacherVerificationNote && (<div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Ghi chú từ Admin</h4>
                  <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    {selectedTeacher.teacherVerificationNote}
                  </p>
                </div>)}
            </div>)}
        </dialog_1.DialogContent>
      </dialog_1.Dialog>

      
      <dialog_1.Dialog open={!!lightboxImage} onOpenChange={(open) => !open && setLightboxImage(null)}>
        <dialog_1.DialogContent className="max-w-4xl p-0 border-0 bg-transparent shadow-none">
          <div className="relative flex justify-center items-center">
            {lightboxImage && (<img src={lightboxImage} alt="Bằng cấp" className="max-w-full max-h-[80vh] rounded-xl shadow-2xl object-contain" onError={(e) => {
                e.target.style.display = 'none';
            }}/>)}
          </div>
          <div className="flex justify-center mt-4">
            <a href={lightboxImage || '#'} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-background/90 text-foreground text-sm font-medium hover:bg-background transition-colors">
              <lucide_react_1.ExternalLink className="w-4 h-4"/>
              Mở trong tab mới
            </a>
          </div>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>
    </div>);
}
//# sourceMappingURL=AdminTeacherVerificationScreen.js.map