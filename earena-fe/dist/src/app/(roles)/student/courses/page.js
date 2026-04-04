"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = MyCoursesPage;
const react_1 = __importDefault(require("react"));
const MyCoursesList_1 = require("@/features/courses/components/MyCoursesList");
const lucide_react_1 = require("lucide-react");
exports.metadata = {
    title: 'Khóa học của tôi | E-Arena',
    description: 'Tiến trình học tập và danh sách khóa học bạn đã ghi danh.',
};
function MyCoursesPage() {
    return (<div className="max-w-[1600px] w-full mx-auto space-y-8 pb-20 px-4 md:px-6 lg:px-8">
            <div className="flex items-center gap-5 border-b border-border/60 pb-6 mt-8">
                <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                    <lucide_react_1.BookOpenCheck className="w-7 h-7 text-primary-foreground"/>
                </div>
                <div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
                        Khóa học của tôi
                    </h1>
                    <p className="text-muted-foreground font-medium mt-1.5 text-sm md:text-base">
                        Tiếp tục tiến trình học tập và chinh phục mục tiêu của bạn.
                    </p>
                </div>
            </div>

            <MyCoursesList_1.MyCoursesList />
        </div>);
}
//# sourceMappingURL=page.js.map