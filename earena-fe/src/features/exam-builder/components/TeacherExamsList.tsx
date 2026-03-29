'use client';

import React, { useState } from 'react'; 
import Link from 'next/link';
import { useTeacherExams } from '../hooks/useTeacherExams';
import { LoadingSpinner } from '@/shared/components/common';
import { Button } from '@/shared/components/ui/button';
import { Plus, Edit3, Clock, FileText, CheckCircle, XCircle, Send, Eye } from 'lucide-react'; 
import { AssignExamModal } from './AssignExamModal';

// [CTO FIX]: Interface chuẩn hóa dựa trên API Response
interface ExamListItem {
  id?: string;
  _id?: string;
  title: string;
  duration: number;
  totalScore: number;
  isPublished: boolean;
  defaultPaperId?: string;
  paperId?: string;
}

export function TeacherExamsList() {
  const { data: examsData, isLoading, isError } = useTeacherExams();

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState<string | undefined>(undefined);

  const exams = Array.isArray(examsData) 
  ? examsData 
  : examsData?.items || examsData?.data || [];

  const handleOpenAssign = (examId: string) => {
    setSelectedExamId(examId);
    setIsAssignModalOpen(true);
  };

  if (isLoading) return <LoadingSpinner />;
  
  if (isError) {
    return <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl">Lỗi khi tải danh sách đề thi.</div>;
  }

  if (exams.length === 0) {
    return (
      <div className="bg-white rounded-2xl border p-8 text-center shadow-sm">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-700">Chưa có đề thi nào</h3>
          <p className="text-slate-500">
            Bạn chưa tạo đề thi nào. Hãy bắt đầu bằng cách khởi tạo một vỏ đề trống.
          </p>
          <Link href="/teacher/exams/create">
            <Button variant="outline" className="mt-4 font-bold border-blue-200 text-blue-600 hover:bg-blue-50">
              Bắt đầu tạo đề ngay
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* [CTO FIX]: Xóa 'any', thay bằng ExamListItem */}
        {exams.map((exam: ExamListItem) => (
          <div key={exam._id || exam.id} className="bg-white border rounded-xl shadow-sm hover:shadow-md transition p-5 flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-lg text-slate-800 line-clamp-2">{exam.title}</h3>
              {exam.isPublished ? (
                <span title="Đã xuất bản" className="text-green-500"><CheckCircle className="w-5 h-5"/></span>
              ) : (
                <span title="Bản nháp" className="text-slate-300"><XCircle className="w-5 h-5"/></span>
              )}
            </div>
            
            <div className="space-y-2 mb-6 flex-1">
              <div className="flex items-center text-sm text-slate-600">
                <Clock className="w-4 h-4 mr-2 text-slate-400" />
                Thời gian: <span className="font-semibold ml-1">{exam.duration} phút</span>
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <FileText className="w-4 h-4 mr-2 text-slate-400" />
                Tổng điểm: <span className="font-semibold ml-1">{exam.totalScore}</span>
              </div>
            </div>

            <div className="pt-4 border-t flex gap-2">
              {/* [CTO FIX]: Kẹp thêm isPublished vào URL để truyền state sang trang Builder */}
              <Link 
                href={`/teacher/exams/${exam._id || exam.id}/builder?paperId=${exam.defaultPaperId || exam.paperId}&isPublished=${exam.isPublished}`} 
                className="flex-1"
              >
                {/* [CTO FIX]: Đổi UI Button dựa trên cờ isPublished */}
                <Button variant="outline" className={`w-full ${exam.isPublished ? 'text-slate-600 border-slate-300 hover:bg-slate-50' : 'text-blue-600 border-blue-200 hover:bg-blue-50'}`}>
                  {exam.isPublished ? (
                    <><Eye className="w-4 h-4 mr-2" /> Xem đề</>
                  ) : (
                    <><Edit3 className="w-4 h-4 mr-2" /> Soạn đề</>
                  )}
                </Button>
              </Link>
              <Button 
                onClick={() => handleOpenAssign((exam._id || exam.id) as string)} 
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold"
              >
                <Send className="w-4 h-4 mr-2" /> Giao đề
              </Button>
            </div>
          </div>
        ))}
      </div>

      <AssignExamModal 
        isOpen={isAssignModalOpen} 
        onClose={() => {
          setIsAssignModalOpen(false);
          setSelectedExamId(undefined);
        }} 
        initialExamId={selectedExamId}
      />
    </>
  );
}