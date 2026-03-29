import { Metadata } from 'next';
import { TeacherSubscriptionScreen } from '@/features/subscriptions/screens/TeacherSubscriptionScreen';

export const metadata: Metadata = {
    title: 'Quản lý Gói cước | EArena Teacher Console',
    description: 'Quản lý, gia hạn và nâng cấp gói cước giảng dạy của bạn.',
};

export default function TeacherSubscriptionPage() {
    return <TeacherSubscriptionScreen />;
}