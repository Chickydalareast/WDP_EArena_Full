"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = StudentDashboardPage;
const react_1 = __importDefault(require("react"));
const StudentWelcomeBento_1 = require("@/features/dashboard/components/StudentWelcomeBento");
const StudentOngoingBento_1 = require("@/features/dashboard/components/StudentOngoingBento");
const StudentExploreBento_1 = require("@/features/dashboard/components/StudentExploreBento");
const lucide_react_1 = require("lucide-react");
const link_1 = __importDefault(require("next/link"));
const routes_1 = require("@/config/routes");
exports.metadata = {
    title: 'Dashboard Học Tập | E-Arena',
    description: 'Trung tâm điều khiển tiến trình học tập của bạn.',
};
function StudentDashboardPage() {
    return (<div className="flex flex-col gap-8 w-full pb-10">
      
      <section className="grid grid-cols-1 gap-6 items-stretch">
        
        <div className="w-full flex">
          <StudentWelcomeBento_1.StudentWelcomeBento />
        </div>
      </section>

      
      <section className="flex flex-col gap-6 mt-2">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl md:text-3xl font-black flex items-center gap-3 tracking-tight text-foreground">
            <lucide_react_1.Sparkles className="text-primary w-8 h-8 shrink-0"/>
            Tiếp tục hành trình
          </h2>
          <link_1.default href={routes_1.ROUTES.STUDENT.MY_COURSES} className="text-primary font-bold text-sm hover:underline shrink-0">
            Xem tất cả khóa học
          </link_1.default>
        </div>
        <StudentOngoingBento_1.StudentOngoingBento />
      </section>

      
      <section className="flex flex-col gap-6 mt-6 pt-6 border-t border-border/60">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold flex items-center gap-2 tracking-tight text-foreground">
            <lucide_react_1.Compass className="text-primary w-7 h-7 shrink-0"/>
            Khám phá khóa học mới
          </h2>
          <link_1.default href={routes_1.ROUTES.PUBLIC.COURSES} className="text-primary font-bold text-sm hover:underline shrink-0">
            Đến kho khóa học
          </link_1.default>
        </div>
        <StudentExploreBento_1.StudentExploreBento />
      </section>
    </div>);
}
//# sourceMappingURL=page.js.map