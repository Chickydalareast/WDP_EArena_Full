'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTES } from '@/config/routes';
import { cn } from '@/shared/lib/utils';
import { LayoutDashboard, BookOpen, Settings, Users, MessageSquare } from 'lucide-react';

interface TeacherCourseNavProps {
    courseId: string;
}

export function TeacherCourseNav({ courseId }: TeacherCourseNavProps) {
    const pathname = usePathname();

    const navItems = [
        {
            name: 'Tổng quan',
            href: ROUTES.TEACHER.COURSE_DETAIL(courseId),
            icon: LayoutDashboard,
            isActive: pathname === ROUTES.TEACHER.COURSE_DETAIL(courseId),
        },
        {
            name: 'Giáo án (Curriculum)',
            href: ROUTES.TEACHER.COURSE_CURRICULUM(courseId),
            icon: BookOpen,
            isActive: pathname.includes('/curriculum'),
        },
        {
            name: 'Cài đặt (Settings)',
            href: ROUTES.TEACHER.COURSE_SETTINGS(courseId),
            icon: Settings,
            isActive: pathname.includes('/settings'),
        },
        {
            name: 'Học viên',
            href: ROUTES.TEACHER.COURSE_MEMBERS(courseId),
            icon: Users,
            isActive: pathname.includes('/members'),
            disabled: false,
        },
        {
            name: 'Q&A',
            href: '#',
            icon: MessageSquare,
            isActive: false,
            disabled: true,
        },
    ];

    return (
        <div className="flex items-center gap-1 border-b border-border bg-card px-4 pt-2 overflow-x-auto scrollbar-hide">
            {navItems.map((item) => {
                const Icon = item.icon;
                return item.disabled ? (
                    <div
                        key={item.name}
                        className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-muted-foreground/50 cursor-not-allowed whitespace-nowrap relative"
                        title="Tính năng đang phát triển"
                    >
                        <Icon className="w-4 h-4" />
                        {item.name}
                        <span className="absolute top-1 right-1 text-[8px] bg-muted px-1 rounded uppercase font-bold text-muted-foreground/50">Sắp ra mắt</span>
                    </div>
                ) : (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap border-b-2",
                            item.isActive
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                        )}
                    >
                        <Icon className="w-4 h-4" />
                        {item.name}
                    </Link>
                );
            })}
        </div>
    );
}