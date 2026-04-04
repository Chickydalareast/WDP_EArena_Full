"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = TeacherExamsListPage;
const link_1 = __importDefault(require("next/link"));
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/shared/components/ui/button");
const TeacherExamsList_1 = require("@/features/exam-builder/components/TeacherExamsList");
exports.metadata = {
    title: 'Quản lý Đề thi | E-Arena',
};
function TeacherExamsListPage() {
    return (<div className="max-w-[1600px] w-full mx-auto space-y-8 pb-20 px-4 md:px-6 lg:px-8">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/60 pb-6 mt-8">
        <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                <lucide_react_1.BookOpen className="w-7 h-7 text-primary-foreground"/>
            </div>
            <div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
                    Kho Đề Thi Của Tôi
                </h1>
                <p className="text-muted-foreground font-medium mt-1.5 text-sm md:text-base">
                    Quản lý, chỉnh sửa và tạo mới các đề kiểm tra, bài tập cho học viên.
                </p>
            </div>
        </div>

        <link_1.default href="/teacher/exams/create" className="shrink-0">
          <button_1.Button className="font-bold shadow-md shadow-primary/20 h-12 px-6 rounded-xl w-full md:w-auto">
            <lucide_react_1.Plus className="w-5 h-5 mr-2"/>
            Tạo Đề Mới
          </button_1.Button>
        </link_1.default>
      </div>

      <TeacherExamsList_1.TeacherExamsList />
    </div>);
}
//# sourceMappingURL=page.js.map