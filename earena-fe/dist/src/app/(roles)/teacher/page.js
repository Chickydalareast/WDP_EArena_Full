'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TeacherDashboard;
const link_1 = __importDefault(require("next/link"));
const TeacherDashboardSidebar_1 = require("@/features/teacher/components/TeacherDashboardSidebar");
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/shared/components/ui/button");
const routes_1 = require("@/config/routes");
function TeacherDashboard() {
    return (<div className="flex flex-col lg:flex-row gap-8 h-full">
      
      <main className="w-full lg:w-3/4 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-black text-foreground flex items-center gap-3 tracking-tight">
            <lucide_react_1.LayoutGrid className="text-primary w-8 h-8"/>
            Bảng điều khiển
          </h1>
        </div>

        
        <div className="bg-primary rounded-[2rem] p-8 md:p-10 text-primary-foreground shadow-sm relative overflow-hidden flex flex-col justify-center">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none"/>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-background/20 backdrop-blur-md px-3 py-1.5 rounded-full text-sm font-bold mb-6 shadow-sm border border-white/10">
              <lucide_react_1.Sparkles className="w-4 h-4 text-yellow-300"/>
              Hệ thống quản lý mới
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tight drop-shadow-sm">
              Chào mừng trở lại, Giảng viên!
            </h2>
            <p className="text-primary-foreground/90 font-medium text-lg max-w-2xl mb-8 leading-relaxed">
              Tính năng quản lý lớp học đã được nâng cấp thành hệ thống Khóa học (Courses) chuyên nghiệp. Khám phá ngay các công cụ mới để xây dựng và phân phối bài giảng của bạn.
            </p>
            <div className="flex flex-wrap gap-4">
              <link_1.default href={routes_1.ROUTES.TEACHER.COURSES}>
                <button_1.Button size="lg" className="bg-background text-primary hover:bg-secondary font-bold h-14 px-8 rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95 text-base">
                  <lucide_react_1.BookOpen className="w-5 h-5 mr-2"/>
                  Quản lý Khóa học
                </button_1.Button>
              </link_1.default>
              <link_1.default href={routes_1.ROUTES.TEACHER.CREATE_EXAM}>
                <button_1.Button size="lg" variant="outline" className="bg-primary hover:bg-primary/90 text-primary-foreground border-primary-foreground/30 font-bold h-14 px-8 rounded-xl transition-colors text-base hover:border-white">
                  <lucide_react_1.PlusCircle className="w-5 h-5 mr-2"/>
                  Tạo đề thi mới
                </button_1.Button>
              </link_1.default>
            </div>
          </div>
        </div>

        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <link_1.default href={routes_1.ROUTES.TEACHER.COURSES} className="group">
            <div className="bg-card rounded-[2rem] p-6 border border-border/60 shadow-sm hover:shadow-xl hover:border-primary/40 transition-all h-full flex flex-col">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-5 group-hover:scale-110 transition-transform">
                <lucide_react_1.BookOpen className="w-6 h-6"/>
              </div>
              <h3 className="font-bold text-foreground text-lg mb-2">Khoá học của tôi</h3>
              <p className="text-sm text-muted-foreground font-medium mb-6 flex-1">
                Quản lý lộ trình, học viên và cập nhật nội dung bài giảng.
              </p>
              <div className="flex items-center text-sm font-bold text-primary">
                Truy cập ngay <lucide_react_1.ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"/>
              </div>
            </div>
          </link_1.default>

          
          <link_1.default href={routes_1.ROUTES.TEACHER.EXAMS} className="group">
            <div className="bg-card rounded-[2rem] p-6 border border-border/60 shadow-sm hover:shadow-xl hover:border-primary/40 transition-all h-full flex flex-col">
              <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500 mb-5 group-hover:scale-110 transition-transform">
                <lucide_react_1.FileText className="w-6 h-6"/>
              </div>
              <h3 className="font-bold text-foreground text-lg mb-2">Kho đề thi</h3>
              <p className="text-sm text-muted-foreground font-medium mb-6 flex-1">
                Soạn thảo, quản lý ngân hàng câu hỏi và tạo ma trận đề.
              </p>
              <div className="flex items-center text-sm font-bold text-orange-500">
                Truy cập ngay <lucide_react_1.ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"/>
              </div>
            </div>
          </link_1.default>

          
          <link_1.default href={routes_1.ROUTES.TEACHER.WALLET} className="group">
            <div className="bg-card rounded-[2rem] p-6 border border-border/60 shadow-sm hover:shadow-xl hover:border-primary/40 transition-all h-full flex flex-col">
              <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-600 mb-5 group-hover:scale-110 transition-transform">
                <lucide_react_1.Wallet className="w-6 h-6"/>
              </div>
              <h3 className="font-bold text-foreground text-lg mb-2">Ví doanh thu</h3>
              <p className="text-sm text-muted-foreground font-medium mb-6 flex-1">
                Theo dõi thu nhập từ học viên và yêu cầu rút tiền.
              </p>
              <div className="flex items-center text-sm font-bold text-green-600">
                Truy cập ngay <lucide_react_1.ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"/>
              </div>
            </div>
          </link_1.default>
        </div>
      </main>

      <div className="w-full lg:w-1/4">
        <TeacherDashboardSidebar_1.TeacherDashboardSidebar />
      </div>

    </div>);
}
//# sourceMappingURL=page.js.map