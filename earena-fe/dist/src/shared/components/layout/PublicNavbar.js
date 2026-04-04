"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PublicNavbar;
const link_1 = __importDefault(require("next/link"));
const button_1 = require("@/shared/components/ui/button");
const lucide_react_1 = require("lucide-react");
const routes_1 = require("@/config/routes");
function PublicNavbar() {
    return (<nav className="fixed w-full z-50 top-0 bg-background/95 backdrop-blur-md border-b border-border transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 gap-8">
          
          
          <link_1.default href="/" className="flex-shrink-0 flex items-center gap-2 cursor-pointer group outline-none">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground group-hover:bg-primary/90 transition-colors shadow-sm">
              <lucide_react_1.School size={24}/>
            </div>
            <span className="font-bold text-2xl text-primary tracking-tight">EArena</span>
          </link_1.default>

          

          
          <div className="flex items-center space-x-4 ml-auto">
            <link_1.default href={routes_1.ROUTES.PUBLIC.COMMUNITY} className="hidden md:flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition">
              <lucide_react_1.MessagesSquare size={18}/>
              Cộng đồng
            </link_1.default>
            <link_1.default href="/roles/teacher" className="hidden md:block text-sm font-medium text-muted-foreground hover:text-primary transition">
              Dành cho Giáo viên
            </link_1.default>
            
            <div className="h-6 w-px bg-border hidden md:block mx-1"></div>
            
            <link_1.default href="/register" className="hidden md:block text-sm font-medium text-muted-foreground hover:text-primary transition">
              Đăng ký
            </link_1.default>
            
            <button_1.Button asChild variant="outline" className="hidden md:inline-flex rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground shadow-sm transition-all">
              <link_1.default href="/login">Đăng nhập</link_1.default>
            </button_1.Button>

            
            <button className="md:hidden text-muted-foreground hover:text-primary focus:outline-none p-2 -mr-2">
              <lucide_react_1.Menu size={28}/>
            </button>
          </div>

        </div>
      </div>
    </nav>);
}
//# sourceMappingURL=PublicNavbar.js.map