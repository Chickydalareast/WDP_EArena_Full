'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamHistoryList = ExamHistoryList;
const react_1 = __importDefault(require("react"));
const useExamHistory_1 = require("../../hooks/useExamHistory");
const ExamHistoryCard_1 = require("./ExamHistoryCard");
const skeleton_1 = require("@/shared/components/ui/skeleton");
const lucide_react_1 = require("lucide-react");
const link_1 = __importDefault(require("next/link"));
const button_1 = require("@/shared/components/ui/button");
const routes_1 = require("@/config/routes");
function ExamHistoryList() {
    const { data: overviews, isLoading, isError } = (0, useExamHistory_1.useHistoryOverview)();
    if (isLoading) {
        return (<div className="space-y-6">
                {[1, 2, 3].map((i) => (<skeleton_1.Skeleton key={i} className="w-full h-[140px] rounded-[2rem]"/>))}
            </div>);
    }
    if (isError) {
        return (<div className="p-12 text-center text-destructive bg-destructive/5 rounded-3xl border border-destructive/20 font-medium">
                Không thể tải lịch sử làm bài. Vui lòng thử lại sau.
            </div>);
    }
    if (!overviews || overviews.length === 0) {
        return (<div className="bg-card rounded-[2.5rem] border border-border/50 p-16 text-center shadow-sm">
                <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                    <lucide_react_1.Clock className="w-12 h-12"/>
                </div>
                <h3 className="text-3xl font-black text-foreground mb-4 tracking-tight">Chưa có lịch sử làm bài</h3>
                <p className="text-muted-foreground mb-10 max-w-lg mx-auto font-medium">
                    Bạn chưa tham gia bài kiểm tra nào. Hãy quay lại lớp học và bắt đầu bài thi đầu tiên của bạn.
                </p>
                <link_1.default href={routes_1.ROUTES.STUDENT.MY_COURSES}>
                    <button_1.Button size="lg" className="font-bold h-14 px-8 rounded-full shadow-lg shadow-primary/25 hover:scale-105 transition-transform">
                        <lucide_react_1.BookOpenCheck className="w-5 h-5 mr-2"/> Vào lớp học ngay
                    </button_1.Button>
                </link_1.default>
            </div>);
    }
    return (<div className="space-y-6 animate-in fade-in duration-500">
            {overviews.map((overview) => (<ExamHistoryCard_1.ExamHistoryCard key={overview.lessonId} overview={overview}/>))}
        </div>);
}
//# sourceMappingURL=ExamHistoryList.js.map