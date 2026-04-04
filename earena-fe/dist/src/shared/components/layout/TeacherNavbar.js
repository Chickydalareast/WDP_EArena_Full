'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeacherNavbar = TeacherNavbar;
const link_1 = __importDefault(require("next/link"));
const auth_store_1 = require("@/features/auth/stores/auth.store");
const useLogout_1 = require("@/features/auth/hooks/useLogout");
const routes_1 = require("@/config/routes");
const MessagesNavIcon_1 = require("@/features/messaging/components/MessagesNavIcon");
const lucide_react_1 = require("lucide-react");
const dropdown_menu_1 = require("@/shared/components/ui/dropdown-menu");
function TeacherNavbar() {
    const { user } = (0, auth_store_1.useAuthStore)();
    const { mutate: logout, isPending } = (0, useLogout_1.useLogout)();
    return (<nav className="fixed w-full z-50 top-0 bg-card border-b border-border shadow-sm transition-colors duration-200">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-8">
          
          
          <link_1.default href="/teacher" className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/30">
              <lucide_react_1.School size={20}/>
            </div>
            <span className="font-bold text-xl text-primary tracking-tight">EArena</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-muted-foreground uppercase tracking-wide border border-border ml-1">
              Teacher
            </span>
          </link_1.default>

          
          <div className="hidden md:flex flex-1 max-w-xl relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <lucide_react_1.Search size={18} className="text-muted-foreground"/>
            </div>
            <input type="text" placeholder="Tìm lớp học, học sinh, đề thi..." className="block w-full pl-10 pr-3 py-2 border border-border rounded-full leading-5 bg-muted/50 text-foreground placeholder-muted-foreground focus:outline-none focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm transition-all"/>
          </div>

          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <MessagesNavIcon_1.MessagesNavIcon href={routes_1.ROUTES.TEACHER.MESSAGES} role="TEACHER"/>
            <button className="p-2 text-muted-foreground hover:text-primary transition rounded-full hover:bg-muted relative">
              <lucide_react_1.Bell size={20}/>
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-background"></span>
            </button>
            
            <div className="h-8 w-px bg-border mx-2 hidden sm:block"></div>
            
            
            <dropdown_menu_1.DropdownMenu>
              <dropdown_menu_1.DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 cursor-pointer hover:bg-muted p-1 rounded-full pr-3 transition outline-none">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
                    {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-bold text-foreground">
                      {user?.fullName || 'Đang tải...'}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                      {user?.role === 'TEACHER' ? 'Giáo viên' : (user?.role || 'Giáo viên')}
                    </p>
                  </div>
                </div>
              </dropdown_menu_1.DropdownMenuTrigger>
              
              <dropdown_menu_1.DropdownMenuContent align="end" className="w-56 mt-2">
                <dropdown_menu_1.DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.fullName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </dropdown_menu_1.DropdownMenuLabel>
                <dropdown_menu_1.DropdownMenuSeparator />
                
                <dropdown_menu_1.DropdownMenuItem className="cursor-pointer">
                  <lucide_react_1.UserCircle className="mr-2 h-4 w-4"/>
                  <span>Hồ sơ cá nhân</span>
                </dropdown_menu_1.DropdownMenuItem>
                
                <dropdown_menu_1.DropdownMenuItem className="cursor-pointer">
                  <lucide_react_1.Settings className="mr-2 h-4 w-4"/>
                  <span>Cài đặt hệ thống</span>
                </dropdown_menu_1.DropdownMenuItem>
                
                <dropdown_menu_1.DropdownMenuSeparator />
                
                <dropdown_menu_1.DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50" onClick={() => logout()} disabled={isPending}>
                  <lucide_react_1.LogOut className="mr-2 h-4 w-4"/>
                  <span>{isPending ? 'Đang đăng xuất...' : 'Đăng xuất'}</span>
                </dropdown_menu_1.DropdownMenuItem>
              </dropdown_menu_1.DropdownMenuContent>
            </dropdown_menu_1.DropdownMenu>

          </div>
        </div>
      </div>
    </nav>);
}
//# sourceMappingURL=TeacherNavbar.js.map