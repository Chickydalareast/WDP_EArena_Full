import { Home, BookOpen, LayoutGrid, FileEdit, Search, Wallet, CreditCard, Crown, MessagesSquare } from 'lucide-react';
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
    { title: 'Cộng đồng', href: ROUTES.PUBLIC.COMMUNITY, icon: MessagesSquare },
    { title: 'Khám phá', href: ROUTES.PUBLIC.COURSES, icon: Search },
    { title: 'Khóa học của tôi', href: ROUTES.STUDENT.MY_COURSES, icon: BookOpen },
    { title: 'Lịch sử làm bài', href: ROUTES.STUDENT.HISTORY, icon: LayoutGrid },
  ],
  TEACHER: [
    { title: 'Cộng đồng', href: ROUTES.PUBLIC.COMMUNITY, icon: MessagesSquare },
    { title: 'Khóa học', href: ROUTES.TEACHER.COURSES, icon: LayoutGrid },
    { title: 'Câu hỏi', href: '/teacher/questions', icon: Home },
    { title: 'Kho Đề thi', href: ROUTES.TEACHER.EXAMS, icon: FileEdit },
    { title: 'Ví & Doanh thu', href: ROUTES.TEACHER.WALLET, icon: Wallet },
    { title: 'Quản lý gói', href: ROUTES.TEACHER.SUBSCRIPTION, icon: Crown },
  ],
  ADMIN: [
    { title: 'Trang chủ', href: ROUTES.ADMIN.DASHBOARD, icon: Home },
    { title: 'Community', href: '/admin/community', icon: MessagesSquare },
    { title: 'Duyệt rút tiền', href: ROUTES.ADMIN.WITHDRAWALS, icon: CreditCard },
  ]
};