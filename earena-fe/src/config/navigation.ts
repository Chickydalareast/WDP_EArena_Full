import { Home, BookOpen, PenTool, LayoutGrid, FileEdit, Search, Wallet, CreditCard, Crown } from 'lucide-react';
import { ROUTES } from './routes';
import type { ElementType } from 'react';

export type NavItem = {
  title: string;
  href: string;
  icon: ElementType;
};

export const NAV_CONFIG: Record<'STUDENT' | 'TEACHER' | 'ADMIN', NavItem[]> = {
  STUDENT: [
    { title: 'Trang chủ', href: ROUTES.STUDENT.DASHBOARD, icon: Home },
    { title: 'Khóa học của tôi', href: ROUTES.STUDENT.MY_COURSES, icon: BookOpen },
    { title: 'Khám phá', href: ROUTES.PUBLIC.COURSES, icon: Search },
  ],
  TEACHER: [
    { title: 'Trang chủ', href: ROUTES.TEACHER.DASHBOARD, icon: Home },
    { title: 'Khóa học', href: ROUTES.TEACHER.COURSES, icon: LayoutGrid },
    { title: 'Kho Đề thi', href: ROUTES.TEACHER.EXAMS, icon: FileEdit },
    { title: 'Ví & Doanh thu', href: ROUTES.TEACHER.WALLET, icon: Wallet },
    { title: 'Quản lý gói', href: ROUTES.TEACHER.SUBSCRIPTION, icon: Crown },
  ],
  ADMIN: [
    { title: 'Trang chủ', href: ROUTES.ADMIN.DASHBOARD, icon: Home },
    { title: 'Duyệt rút tiền', href: ROUTES.ADMIN.WITHDRAWALS, icon: CreditCard },
  ]
};