"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = CourseDashboardPage;
const lucide_react_1 = require("lucide-react");
const CourseDashboardStatsView_1 = require("@/features/courses/components/Dashboard/CourseDashboardStatsView");
exports.metadata = {
    title: "Tổng quan khóa học | EArena Teacher",
};
async function CourseDashboardPage({ params, }) {
    const resolvedParams = await params;
    const courseId = resolvedParams.courseId;
    return (<div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <lucide_react_1.BarChart2 className="w-6 h-6 text-primary"/>
                        Phân tích & Thống kê
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Theo dõi doanh thu, hiệu suất và tình hình học tập của học viên.
                    </p>
                </div>
            </div>

            
            <CourseDashboardStatsView_1.CourseDashboardStatsView courseId={courseId}/>

        </div>);
}
//# sourceMappingURL=page.js.map