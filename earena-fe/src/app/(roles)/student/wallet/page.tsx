import { Metadata } from 'next';
import { WalletScreen } from '@/features/billing/screens/WalletScreen';

export const metadata: Metadata = {
  title: 'Ví của tôi | EArena',
  description: 'Quản lý số dư và lịch sử giao dịch',
};

export default function StudentWalletPage() {
  // Server Component thuần túy, không có state hay hook
  // Chỉ dùng để cấu hình SEO và bọc Client Component chứa logic
  return <WalletScreen />;
}