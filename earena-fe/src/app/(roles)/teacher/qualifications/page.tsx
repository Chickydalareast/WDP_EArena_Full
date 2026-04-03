'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Upload, Trash2, FileText, Send, CheckCircle, Clock, XCircle, Image as ImageIcon, X } from 'lucide-react';
import { teacherService } from '@/features/teacher/api/teacher.service';
import type { Qualification, TeacherVerificationStatus } from '@/features/admin/types/admin.types';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';

export default function TeacherQualificationsPage() {
  const qc = useQueryClient();
  const [newFileName, setNewFileName] = useState('');
  const [newFileUrl, setNewFileUrl] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['teacher', 'qualifications'],
    queryFn: teacherService.getQualifications,
    staleTime: 0,
  });

  const uploadMut = useMutation({
    mutationFn: (payload: { url: string; name: string }) => teacherService.uploadQualification(payload),
    onSuccess: () => {
      toast.success('Tải lên bằng cấp thành công');
      qc.invalidateQueries({ queryKey: ['teacher', 'qualifications'] });
      setNewFileName('');
      setNewFileUrl('');
    },
    onError: (e: any) => toast.error('Tải lên thất bại', { description: e?.message }),
  });

  const deleteMut = useMutation({
    mutationFn: (index: number) => teacherService.deleteQualification(index),
    onSuccess: () => {
      toast.success('Xóa bằng cấp thành công');
      qc.invalidateQueries({ queryKey: ['teacher', 'qualifications'] });
    },
    onError: (e: any) => toast.error('Xóa thất bại', { description: e?.message }),
  });

  const submitReviewMut = useMutation({
    mutationFn: () => teacherService.submitForVerification(),
    onSuccess: (res) => {
      toast.success(res.message || 'Đã gửi hồ sơ xét duyệt');
      qc.invalidateQueries({ queryKey: ['teacher', 'qualifications'] });
    },
    onError: (e: any) => toast.error('Gửi thất bại', { description: e?.message }),
  });

  const handleAddQualification = () => {
    if (!newFileName.trim() || !newFileUrl.trim()) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    uploadMut.mutate({ name: newFileName.trim(), url: newFileUrl.trim() });
  };

  const getStatusDisplay = (status: TeacherVerificationStatus) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Đã xác minh</span>
          </div>
        );
      case 'REJECTED':
        return (
          <div className="flex items-center gap-2 text-red-600">
            <XCircle className="w-5 h-5" />
            <span className="font-medium">Bị từ chối</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 text-yellow-600">
            <Clock className="w-5 h-5" />
            <span className="font-medium">Đang chờ xét duyệt</span>
          </div>
        );
    }
  };

  const canEdit = data?.verificationStatus !== 'VERIFIED';

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Hồ sơ bằng cấp</h1>
        <p className="text-muted-foreground">
          Tải lên bằng cấp và chứng chỉ để hoàn tất hồ sơ giáo viên
        </p>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Trạng thái xác minh</CardTitle>
          <CardDescription>Tình trạng hồ sơ của bạn trong hệ thống</CardDescription>
        </CardHeader>
        <CardContent>
          {data?.verificationStatus ? (
            getStatusDisplay(data.verificationStatus)
          ) : (
            <div className="text-muted-foreground">Đang tải...</div>
          )}
        </CardContent>
      </Card>

      {/* Upload Section */}
      {canEdit && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Thêm bằng cấp mới
            </CardTitle>
            <CardDescription>
              Nhập đường dẫn (URL) của file bằng cấp đã upload lên cloud storage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tên file / Mô tả</label>
                <Input
                  placeholder="VD: Bằng cử nhân Sư phạm Toán"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Đường dẫn (URL)</label>
                <Input
                  placeholder="https://..."
                  value={newFileUrl}
                  onChange={(e) => setNewFileUrl(e.target.value)}
                />
              </div>
            </div>
            <Button
              onClick={handleAddQualification}
              disabled={uploadMut.isPending || !newFileName.trim() || !newFileUrl.trim()}
              className="w-full sm:w-auto"
            >
              <Upload className="w-4 h-4 mr-2" />
              Tải lên
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Qualifications List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Danh sách bằng cấp ({data?.qualifications?.length || 0})
          </CardTitle>
          <CardDescription>
            Các file bằng cấp bạn đã tải lên
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Đang tải...</div>
          ) : data?.qualifications && data.qualifications.length > 0 ? (
            <div className="space-y-3">
              {data.qualifications.map((q, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <ImageIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <a
                        href={q.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-foreground hover:underline truncate block"
                      >
                        {q.name}
                      </a>
                      <p className="text-xs text-muted-foreground">
                        Upload: {new Date(q.uploadedAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMut.mutate(index)}
                      disabled={deleteMut.isPending}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Chưa có bằng cấp nào được tải lên</p>
              <p className="text-sm">Hãy thêm bằng cấp ở phần trên</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit for Review */}
      {canEdit && data?.qualifications && data.qualifications.length > 0 && (
        <div className="flex justify-end">
          <Button
            size="lg"
            onClick={() => submitReviewMut.mutate()}
            disabled={submitReviewMut.isPending || data.verificationStatus === 'PENDING'}
            className="bg-primary hover:bg-primary/90"
          >
            <Send className="w-4 h-4 mr-2" />
            {data.verificationStatus === 'PENDING'
              ? 'Đã gửi xét duyệt'
              : 'Gửi hồ sơ xét duyệt'}
          </Button>
        </div>
      )}
    </div>
  );
}
