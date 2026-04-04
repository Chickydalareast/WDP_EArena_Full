"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NAV_CONFIG = void 0;
const lucide_react_1 = require("lucide-react");
const routes_1 = require("./routes");
exports.NAV_CONFIG = {
    STUDENT: [
        { title: 'Trang chủ', href: routes_1.ROUTES.STUDENT.DASHBOARD, icon: lucide_react_1.Home },
        { title: 'Cộng đồng', href: routes_1.ROUTES.PUBLIC.COMMUNITY, icon: lucide_react_1.MessagesSquare },
        { title: 'Khám phá', href: routes_1.ROUTES.PUBLIC.COURSES, icon: lucide_react_1.Search },
        { title: 'Khóa học của tôi', href: routes_1.ROUTES.STUDENT.MY_COURSES, icon: lucide_react_1.BookOpen },
        { title: 'Lịch sử làm bài', href: routes_1.ROUTES.STUDENT.HISTORY, icon: lucide_react_1.LayoutGrid },
    ],
    TEACHER: [
        { title: 'Cộng đồng', href: routes_1.ROUTES.PUBLIC.COMMUNITY, icon: lucide_react_1.MessagesSquare },
        { title: 'Khóa học', href: routes_1.ROUTES.TEACHER.COURSES, icon: lucide_react_1.LayoutGrid },
        { title: 'Câu hỏi', href: '/teacher/questions', icon: lucide_react_1.Home },
        { title: 'Kho Đề thi', href: routes_1.ROUTES.TEACHER.EXAMS, icon: lucide_react_1.FileEdit },
        { title: 'Ví & Doanh thu', href: routes_1.ROUTES.TEACHER.WALLET, icon: lucide_react_1.Wallet },
        { title: 'Quản lý gói', href: routes_1.ROUTES.TEACHER.SUBSCRIPTION, icon: lucide_react_1.Crown },
    ],
    ADMIN: [
        { title: 'Trang chủ', href: routes_1.ROUTES.ADMIN.DASHBOARD, icon: lucide_react_1.Home },
        { title: 'Community', href: '/admin/community', icon: lucide_react_1.MessagesSquare },
        { title: 'Duyệt rút tiền', href: routes_1.ROUTES.ADMIN.WITHDRAWALS, icon: lucide_react_1.CreditCard },
    ]
};
//# sourceMappingURL=navigation.js.map