import { Metadata } from 'next';
import { QuestionBankScreen } from '@/features/question-bank/screens/QuestionBankScreen';

export const metadata: Metadata = {
  title: 'Ngân hàng Câu hỏi | EArena Teacher',
  description: 'Quản lý kho câu hỏi và thư mục tài nguyên dành cho Giáo viên.',
};

export default async function TeacherQuestionBankPage() {
  
  return (
    <main className="w-full h-full">
      <QuestionBankScreen />
    </main>
  );
}