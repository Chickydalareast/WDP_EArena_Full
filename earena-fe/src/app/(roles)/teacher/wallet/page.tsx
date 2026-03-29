import { Metadata } from 'next';
import { TeacherWalletScreen } from '@/features/billing/screens/TeacherWalletScreen';

export const metadata: Metadata = {
  title: 'Ví doanh thu | EArena Teacher Console',
  description: 'Quản lý doanh thu, lịch sử giao dịch và yêu cầu rút tiền dành cho Giáo viên.',
};

export default function TeacherWalletPage() {
  return <TeacherWalletScreen />;
}