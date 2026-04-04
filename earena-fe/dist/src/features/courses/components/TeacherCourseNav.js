'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeacherCourseNav = TeacherCourseNav;
const link_1 = __importDefault(require("next/link"));
const navigation_1 = require("next/navigation");
const routes_1 = require("@/config/routes");
const utils_1 = require("@/shared/lib/utils");
const lucide_react_1 = require("lucide-react");
function TeacherCourseNav({ courseId }) {
    const pathname = (0, navigation_1.usePathname)();
    const navItems = [
        {
            name: 'Tổng quan',
            href: routes_1.ROUTES.TEACHER.COURSE_DETAIL(courseId),
            icon: lucide_react_1.LayoutDashboard,
            isActive: pathname === routes_1.ROUTES.TEACHER.COURSE_DETAIL(courseId),
        },
        {
            name: 'Giáo án (Curriculum)',
            href: routes_1.ROUTES.TEACHER.COURSE_CURRICULUM(courseId),
            icon: lucide_react_1.BookOpen,
            isActive: pathname.includes('/curriculum'),
        },
        {
            name: 'Cài đặt (Settings)',
            href: routes_1.ROUTES.TEACHER.COURSE_SETTINGS(courseId),
            icon: lucide_react_1.Settings,
            isActive: pathname.includes('/settings'),
        },
        {
            name: 'Học viên',
            href: '#',
            icon: lucide_react_1.Users,
            isActive: false,
            disabled: true,
        },
        {
            name: 'Q&A',
            href: '#',
            icon: lucide_react_1.MessageSquare,
            isActive: false,
            disabled: true,
        },
    ];
    return (<div className="flex items-center gap-1 border-b border-border bg-card px-4 pt-2 overflow-x-auto scrollbar-hide">
            {navItems.map((item) => {
            const Icon = item.icon;
            return item.disabled ? (<div key={item.name} className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-muted-foreground/50 cursor-not-allowed whitespace-nowrap relative" title="Tính năng đang phát triển">
                        <Icon className="w-4 h-4"/>
                        {item.name}
                        <span className="absolute top-1 right-1 text-[8px] bg-muted px-1 rounded uppercase font-bold text-muted-foreground/50">Sắp ra mắt</span>
                    </div>) : (<link_1.default key={item.name} href={item.href} className={(0, utils_1.cn)("flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap border-b-2", item.isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border")}>
                        <Icon className="w-4 h-4"/>
                        {item.name}
                    </link_1.default>);
        })}
        </div>);
}
//# sourceMappingURL=TeacherCourseNav.js.map