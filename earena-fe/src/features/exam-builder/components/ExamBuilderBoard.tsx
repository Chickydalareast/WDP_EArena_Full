// src/features/exam-builder/components/ExamBuilderBoard.tsx
'use client';

import { useExamBuilderStore } from '../stores/exam-builder.store';
import { useUpdatePaper } from '../hooks/useUpdatePaper';

export function ExamBuilderBoard() {
  // CTO Push-back: Rút paperId từ RAM ra. Nếu user F5, chỗ này sẽ là null.
  const { paperId, examId, clearSession } = useExamBuilderStore();
  
  // Ném paperId vào hook mutation để xử lý
  const { mutate: updatePaper, isPending } = useUpdatePaper(paperId);

  // [BẪY EDGE CASE TỬ HUYỆT]: Mất RAM Session do F5
  if (!paperId || !examId) {
    return (
      <div className="p-8 text-center bg-red-50 border border-red-200 rounded-xl max-w-2xl mx-auto mt-10">
        <h3 className="text-red-700 font-bold text-xl mb-2">Phiên làm việc đã hết hạn hoặc bị gián đoạn!</h3>
        <p className="text-red-600 mb-4">
          Hệ thống không tìm thấy mã Đề thi trong bộ nhớ đệm (RAM). Có thể bạn đã tải lại trang.
        </p>
        <button 
          onClick={() => window.location.href = '/teacher/exams'} 
          className="bg-red-600 text-white px-6 py-2 rounded font-medium hover:bg-red-700"
        >
          Quay lại danh sách Đề thi
        </button>
      </div>
    );
  }

  // Action Helpers
  const handleAddMockQuestion = () => {
    // Trong thực tế, ID này sẽ lấy từ Modal Ngân hàng câu hỏi
    const mockQuestionId = '65d1a2b3c4d5e6f7a8b9c0d1'; 
    updatePaper({ action: 'ADD', questionId: mockQuestionId });
  };

  const handleRemoveMockQuestion = () => {
    const mockQuestionId = '65d1a2b3c4d5e6f7a8b9c0d1'; 
    updatePaper({ action: 'REMOVE', questionId: mockQuestionId });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6 bg-slate-50 border rounded-xl shadow-sm">
      <header className="flex justify-between items-center border-b pb-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Không gian Soạn Đề</h2>
          <p className="text-sm text-slate-500 font-mono mt-1">
            Exam ID: {examId} | Paper ID: {paperId}
          </p>
        </div>
        <button 
          onClick={clearSession}
          className="text-slate-500 hover:text-red-600 text-sm font-medium transition-colors"
        >
          Đóng phiên làm việc (Xóa RAM)
        </button>
      </header>

      {/* Vùng thao tác Builder - UI Giả lập luồng chọn câu hỏi */}
      <div className="grid grid-cols-2 gap-6">
        <div className="p-6 border-2 border-dashed border-slate-300 rounded-xl bg-white text-center">
          <p className="text-slate-500 mb-4 text-sm">
            Mô phỏng: Giáo viên mở Modal Ngân hàng và chọn 1 câu hỏi có sẵn.
          </p>
          <button
            disabled={isPending}
            onClick={handleAddMockQuestion}
            className="bg-green-600 text-white px-4 py-2 rounded font-medium w-full disabled:opacity-50"
          >
            {isPending ? 'Đang xử lý...' : '+ Thêm câu hỏi mẫu vào Đề'}
          </button>
        </div>

        <div className="p-6 border border-slate-200 rounded-xl bg-white text-center">
          <p className="text-slate-500 mb-4 text-sm">
            Mô phỏng: Giáo viên xóa 1 câu hỏi đang có trong danh sách Đề.
          </p>
          <button
            disabled={isPending}
            onClick={handleRemoveMockQuestion}
            className="bg-red-50 text-red-600 px-4 py-2 rounded font-medium w-full border border-red-200 hover:bg-red-100 disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Đang xử lý...' : '- Xóa câu hỏi mẫu khỏi Đề'}
          </button>
        </div>
      </div>
      
      {/* Nơi đây sau này sẽ gọi `useQuery` để map ra danh sách câu hỏi đã được add */}
      <div className="p-4 bg-slate-200 rounded text-center text-slate-500 text-sm font-medium">
        [Khối UI: Danh sách chi tiết các câu hỏi hiện có trong Paper]
      </div>
    </div>
  );
}