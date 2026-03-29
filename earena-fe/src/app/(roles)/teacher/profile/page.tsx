import { Metadata } from 'next';
import ProfileLayout from '@/features/profile/components/ProfileLayout';

export const metadata: Metadata = {
  title: 'Hồ sơ Giáo viên | EArena',
  description: 'Quản lý thông tin hồ sơ giáo viên của bạn trên hệ thống EArena',
};

export default function TeacherProfilePage() {
  return <ProfileLayout />;
}