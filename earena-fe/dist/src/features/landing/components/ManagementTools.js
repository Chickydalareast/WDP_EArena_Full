"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ManagementTools;
const link_1 = __importDefault(require("next/link"));
const button_1 = require("@/shared/components/ui/button");
function ManagementTools() {
    return (<section className="py-20 bg-background transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
            Công cụ quản lý lớp học toàn diện
          </h2>
          <p className="text-muted-foreground">
            Giải pháp công nghệ dành riêng cho Giáo viên thời đại số.
          </p>
        </div>

        
        <div className="grid md:grid-cols-3 gap-8 text-center">
          
          
          <div className="p-8 bg-card rounded-2xl shadow-lg border border-border border-b-4 border-b-primary hover:-translate-y-2 transition duration-300">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
              <span className="material-symbols-outlined text-4xl">grid_on</span>
            </div>
            <h3 className="text-xl font-bold mb-3 text-foreground">Ma trận đề thi</h3>
            <p className="text-muted-foreground text-sm">
              Tạo đề thi tự động theo cấu trúc ma trận chuẩn của Bộ Giáo Dục chỉ trong 30 giây.
            </p>
          </div>

          
          <div className="p-8 bg-card rounded-2xl shadow-lg border border-border border-b-4 border-b-blue-500 hover:-translate-y-2 transition duration-300">
            <div className="w-16 h-16 mx-auto bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
              <span className="material-symbols-outlined text-4xl">folder_open</span>
            </div>
            <h3 className="text-xl font-bold mb-3 text-foreground">Ngân hàng câu hỏi</h3>
            <p className="text-muted-foreground text-sm">
              Kho 100,000+ câu hỏi trắc nghiệm được biên soạn kỹ lưỡng và phân loại chi tiết.
            </p>
          </div>

          
          <div className="p-8 bg-card rounded-2xl shadow-lg border border-border border-b-4 border-b-green-500 hover:-translate-y-2 transition duration-300">
            <div className="w-16 h-16 mx-auto bg-green-500/10 rounded-2xl flex items-center justify-center text-green-600 dark:text-green-400 mb-6">
              <span className="material-symbols-outlined text-4xl">analytics</span>
            </div>
            <h3 className="text-xl font-bold mb-3 text-foreground">Bảng điểm lớp</h3>
            <p className="text-muted-foreground text-sm">
              Thống kê chi tiết kết quả học sinh, xuất báo cáo PDF/Excel dễ dàng quản lý.
            </p>
          </div>

        </div>

        
        <div className="mt-12 text-center">
          <button_1.Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg font-semibold rounded-xl border-border text-foreground hover:bg-muted transition-colors">
            <link_1.default href="/register?role=teacher">
              Đăng ký tài khoản Giáo viên
            </link_1.default>
          </button_1.Button>
        </div>
        
      </div>
    </section>);
}
//# sourceMappingURL=ManagementTools.js.map