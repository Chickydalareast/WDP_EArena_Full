'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentWelcomeBento = StudentWelcomeBento;
const react_1 = __importDefault(require("react"));
const auth_store_1 = require("@/features/auth/stores/auth.store");
const utils_1 = require("@/shared/lib/utils");
const lucide_react_1 = require("lucide-react");
const link_1 = __importDefault(require("next/link"));
const routes_1 = require("@/config/routes");
const skeleton_1 = require("@/shared/components/ui/skeleton");
function StudentWelcomeBento() {
    const { user, isInitialized } = (0, auth_store_1.useAuthStore)();
    if (!isInitialized) {
        return <skeleton_1.Skeleton className="w-full h-full min-h-[220px] rounded-3xl"/>;
    }
    const firstName = user?.fullName?.split(' ').pop() || 'Học viên';
    return (<div className="w-full bg-primary relative rounded-3xl overflow-hidden shadow-sm flex flex-col md:flex-row p-8 md:p-10 gap-8 justify-between items-stretch">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none"/>

            <div className="relative z-10 flex flex-col gap-6 w-full md:w-auto flex-1 justify-between items-start">
                <div>
                    <h1 className="text-primary-foreground text-3xl md:text-4xl font-black tracking-tight leading-tight">
                        Chào buổi sáng, {firstName}! ☀️
                    </h1>
                    <p className="text-primary-foreground/90 font-medium text-lg mt-1 max-w-lg">
                        Sẵn sàng bứt phá điểm số THPT Quốc gia cùng E-Arena ngay hôm nay chứ?
                    </p>
                </div>

                <link_1.default href={routes_1.ROUTES.STUDENT.MY_COURSES} className="group flex w-full max-w-sm items-center justify-between gap-4 h-14 pl-6 pr-5 rounded-2xl bg-background hover:bg-muted text-foreground shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center gap-3 font-extrabold text-base">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <lucide_react_1.BookOpenCheck className="w-4 h-4"/>
                        </div>
                        Vào lớp học của tôi
                    </div>
                    <lucide_react_1.MoveRight className="w-6 h-6 text-primary group-hover:translate-x-2 transition-transform duration-300"/>
                </link_1.default>
            </div>

            <div className="relative z-10 bg-background/95 backdrop-blur-md border border-background/20 p-6 rounded-2xl w-full md:w-auto min-w-[250px] flex flex-col gap-4 shadow-xl shrink-0">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-primary font-bold text-sm">
                        <lucide_react_1.Wallet className="w-4 h-4"/> Số dư ví (coin)
                    </div>
                </div>
                <div className="text-4xl font-black text-foreground tracking-tight drop-shadow-sm">
                    {(0, utils_1.formatCurrency)(user?.balance || 0)}
                </div>
                <link_1.default href={routes_1.ROUTES.STUDENT.WALLET} className="flex items-center justify-center gap-1.5 w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-3 rounded-xl transition-colors text-sm shadow-md shadow-primary/20">
                    <lucide_react_1.Plus className="w-4 h-4"/> Nạp coin nhanh
                </link_1.default>
            </div>
        </div>);
}
//# sourceMappingURL=StudentWelcomeBento.js.map