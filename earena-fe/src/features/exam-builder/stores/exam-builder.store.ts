import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// ============================================================================
// Types & Interfaces
// ============================================================================
interface BuilderSessionPayload {
  examId: string; // 24-char MongoDB ObjectId
  paperId: string; // 24-char MongoDB ObjectId
}

interface ExamBuilderState {
  // --- State ---
  examId: string | null;
  paperId: string | null;
  
  // Trạng thái cờ (Derived/Helper state) để UI biết đang trong phiên tạo đề
  isBuilding: boolean; 

  // --- Actions ---
  setBuilderSession: (payload: BuilderSessionPayload) => void;
  clearSession: () => void;
}

// ============================================================================
// Zustand Store (RAM-only, No Persist)
// ============================================================================
export const useExamBuilderStore = create<ExamBuilderState>()(
  devtools(
    (set) => ({
      // Khởi tạo state rỗng
      examId: null,
      paperId: null,
      isBuilding: false,

      // Kích hoạt phiên làm việc sau khi gọi POST /exams/manual/init thành công
      setBuilderSession: ({ examId, paperId }) => 
        set(
          { 
            examId, 
            paperId, 
            isBuilding: true 
          }, 
          false, 
          'examBuilder/setSession'
        ),

      // Dọn dẹp RAM khi giáo viên hoàn tất việc tạo đề hoặc bấm Hủy
      clearSession: () => 
        set(
          { 
            examId: null, 
            paperId: null, 
            isBuilding: false 
          }, 
          false, 
          'examBuilder/clearSession'
        ),
    }),
    { name: 'ExamBuilderStore' } // Hỗ trợ debug qua Redux DevTools extension
  )
);