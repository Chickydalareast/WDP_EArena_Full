import { Metadata } from 'next';
import { AdminShell } from '@/features/admin/components/AdminShell';
import { AdminWithdrawalsScreen } from '@/features/admin/screens/AdminWithdrawalsScreen';

export const metadata: Metadata = {
    title: 'Đối soát Rút tiền | Quản trị EArena',
    description: 'Hệ thống đối soát và giải ngân doanh thu cho giáo viên.',
};

export default function AdminWithdrawalsPage() {
    return (
        <AdminShell
            title="Đối soát & Giải ngân"
            subtitle="Kiểm duyệt và thanh toán các yêu cầu rút doanh thu từ Giáo viên"
        >
            <AdminWithdrawalsScreen />
        </AdminShell>
    );
}