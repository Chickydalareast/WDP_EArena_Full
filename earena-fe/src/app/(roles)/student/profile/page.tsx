import { Metadata } from 'next';
import ProfileLayout from '@/features/profile/components/ProfileLayout';

export const metadata: Metadata = {
  title: 'Hồ sơ cá nhân | EArena',
  description: 'Quản lý thông tin hồ sơ của bạn trên hệ thống EArena',
};

export default function StudentProfilePage() {
  return <ProfileLayout />;
}