'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TeacherQualificationsPage;
const react_1 = require("react");
const react_query_1 = require("@tanstack/react-query");
const sonner_1 = require("sonner");
const lucide_react_1 = require("lucide-react");
const teacher_service_1 = require("@/features/teacher/api/teacher.service");
const button_1 = require("@/shared/components/ui/button");
const input_1 = require("@/shared/components/ui/input");
const card_1 = require("@/shared/components/ui/card");
function TeacherQualificationsPage() {
    const qc = (0, react_query_1.useQueryClient)();
    const [newFileName, setNewFileName] = (0, react_1.useState)('');
    const [newFileUrl, setNewFileUrl] = (0, react_1.useState)('');
    const { data, isLoading } = (0, react_query_1.useQuery)({
        queryKey: ['teacher', 'qualifications'],
        queryFn: teacher_service_1.teacherService.getQualifications,
        staleTime: 0,
    });
    const uploadMut = (0, react_query_1.useMutation)({
        mutationFn: (payload) => teacher_service_1.teacherService.uploadQualification(payload),
        onSuccess: () => {
            sonner_1.toast.success('Tải lên bằng cấp thành công');
            qc.invalidateQueries({ queryKey: ['teacher', 'qualifications'] });
            setNewFileName('');
            setNewFileUrl('');
        },
        onError: (e) => sonner_1.toast.error('Tải lên thất bại', { description: e?.message }),
    });
    const deleteMut = (0, react_query_1.useMutation)({
        mutationFn: (index) => teacher_service_1.teacherService.deleteQualification(index),
        onSuccess: () => {
            sonner_1.toast.success('Xóa bằng cấp thành công');
            qc.invalidateQueries({ queryKey: ['teacher', 'qualifications'] });
        },
        onError: (e) => sonner_1.toast.error('Xóa thất bại', { description: e?.message }),
    });
    const submitReviewMut = (0, react_query_1.useMutation)({
        mutationFn: () => teacher_service_1.teacherService.submitForVerification(),
        onSuccess: (res) => {
            sonner_1.toast.success(res.message || 'Đã gửi hồ sơ xét duyệt');
            qc.invalidateQueries({ queryKey: ['teacher', 'qualifications'] });
        },
        onError: (e) => sonner_1.toast.error('Gửi thất bại', { description: e?.message }),
    });
    const handleAddQualification = () => {
        if (!newFileName.trim() || !newFileUrl.trim()) {
            sonner_1.toast.error('Vui lòng nhập đầy đủ thông tin');
            return;
        }
        uploadMut.mutate({ name: newFileName.trim(), url: newFileUrl.trim() });
    };
    const getStatusDisplay = (status) => {
        switch (status) {
            case 'VERIFIED':
                return (<div className="flex items-center gap-2 text-green-600">
            <lucide_react_1.CheckCircle className="w-5 h-5"/>
            <span className="font-medium">Đã xác minh</span>
          </div>);
            case 'REJECTED':
                return (<div className="flex items-center gap-2 text-red-600">
            <lucide_react_1.XCircle className="w-5 h-5"/>
            <span className="font-medium">Bị từ chối</span>
          </div>);
            default:
                return (<div className="flex items-center gap-2 text-yellow-600">
            <lucide_react_1.Clock className="w-5 h-5"/>
            <span className="font-medium">Đang chờ xét duyệt</span>
          </div>);
        }
    };
    const canEdit = data?.verificationStatus !== 'VERIFIED';
    return (<div className="container max-w-4xl py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Hồ sơ bằng cấp</h1>
        <p className="text-muted-foreground">
          Tải lên bằng cấp và chứng chỉ để hoàn tất hồ sơ giáo viên
        </p>
      </div>

      
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="text-lg">Trạng thái xác minh</card_1.CardTitle>
          <card_1.CardDescription>Tình trạng hồ sơ của bạn trong hệ thống</card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          {data?.verificationStatus ? (getStatusDisplay(data.verificationStatus)) : (<div className="text-muted-foreground">Đang tải...</div>)}
        </card_1.CardContent>
      </card_1.Card>

      
      {canEdit && (<card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="text-lg flex items-center gap-2">
              <lucide_react_1.Upload className="w-5 h-5"/>
              Thêm bằng cấp mới
            </card_1.CardTitle>
            <card_1.CardDescription>
              Nhập đường dẫn (URL) của file bằng cấp đã upload lên cloud storage
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tên file / Mô tả</label>
                <input_1.Input placeholder="VD: Bằng cử nhân Sư phạm Toán" value={newFileName} onChange={(e) => setNewFileName(e.target.value)}/>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Đường dẫn (URL)</label>
                <input_1.Input placeholder="https://..." value={newFileUrl} onChange={(e) => setNewFileUrl(e.target.value)}/>
              </div>
            </div>
            <button_1.Button onClick={handleAddQualification} disabled={uploadMut.isPending || !newFileName.trim() || !newFileUrl.trim()} className="w-full sm:w-auto">
              <lucide_react_1.Upload className="w-4 h-4 mr-2"/>
              Tải lên
            </button_1.Button>
          </card_1.CardContent>
        </card_1.Card>)}

      
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="text-lg flex items-center gap-2">
            <lucide_react_1.FileText className="w-5 h-5"/>
            Danh sách bằng cấp ({data?.qualifications?.length || 0})
          </card_1.CardTitle>
          <card_1.CardDescription>
            Các file bằng cấp bạn đã tải lên
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          {isLoading ? (<div className="text-center py-8 text-muted-foreground">Đang tải...</div>) : data?.qualifications && data.qualifications.length > 0 ? (<div className="space-y-3">
              {data.qualifications.map((q, index) => (<div key={index} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <lucide_react_1.Image className="w-5 h-5 text-primary"/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <a href={q.url} target="_blank" rel="noopener noreferrer" className="font-medium text-foreground hover:underline truncate block">
                        {q.name}
                      </a>
                      <p className="text-xs text-muted-foreground">
                        Upload: {new Date(q.uploadedAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  {canEdit && (<button_1.Button variant="ghost" size="icon" onClick={() => deleteMut.mutate(index)} disabled={deleteMut.isPending} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                      <lucide_react_1.Trash2 className="w-4 h-4"/>
                    </button_1.Button>)}
                </div>))}
            </div>) : (<div className="text-center py-8 text-muted-foreground">
              <lucide_react_1.Image className="w-12 h-12 mx-auto mb-3 opacity-50"/>
              <p>Chưa có bằng cấp nào được tải lên</p>
              <p className="text-sm">Hãy thêm bằng cấp ở phần trên</p>
            </div>)}
        </card_1.CardContent>
      </card_1.Card>

      
      {canEdit && data?.qualifications && data.qualifications.length > 0 && (<div className="flex justify-end">
          <button_1.Button size="lg" onClick={() => submitReviewMut.mutate()} disabled={submitReviewMut.isPending || data.verificationStatus === 'PENDING'} className="bg-primary hover:bg-primary/90">
            <lucide_react_1.Send className="w-4 h-4 mr-2"/>
            {data.verificationStatus === 'PENDING'
                ? 'Đã gửi xét duyệt'
                : 'Gửi hồ sơ xét duyệt'}
          </button_1.Button>
        </div>)}
    </div>);
}
//# sourceMappingURL=page.js.map