"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = StudentHistoryPage;
const react_1 = __importDefault(require("react"));
const ExamHistoryList_1 = require("@/features/exam-taking/components/history/ExamHistoryList");
const lucide_react_1 = require("lucide-react");
exports.metadata = {
    title: 'Lịch sử làm bài | E-Arena',
    description: 'Xem lại lịch sử, điểm số và chi tiết các bài kiểm tra đã thực hiện.',
};
function StudentHistoryPage() {
    return (<div className="max-w-[1200px] w-full mx-auto space-y-8 pb-20 px-4 md:px-6 lg:px-8">
            <div className="flex items-center gap-5 border-b border-border/60 pb-6 mt-8">
                <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                    <lucide_react_1.History className="w-7 h-7 text-primary-foreground"/>
                </div>
                <div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
                        Lịch sử làm bài
                    </h1>
                    <p className="text-muted-foreground font-medium mt-1.5 text-sm md:text-base">
                        Theo dõi tiến độ, xem lại kết quả và rút kinh nghiệm từ các lần thi trước.
                    </p>
                </div>
            </div>

            <ExamHistoryList_1.ExamHistoryList />
        </div>);
}
//# sourceMappingURL=page.js.map