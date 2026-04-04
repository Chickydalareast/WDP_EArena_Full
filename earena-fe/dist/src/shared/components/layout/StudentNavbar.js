'use client';
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentNavbar = StudentNavbar;
const react_1 = __importStar(require("react"));
const link_1 = __importDefault(require("next/link"));
const navigation_1 = require("next/navigation");
const auth_store_1 = require("@/features/auth/stores/auth.store");
const useLogout_1 = require("@/features/auth/hooks/useLogout");
const useDebounce_1 = require("@/shared/hooks/useDebounce");
const lucide_react_1 = require("lucide-react");
const dropdown_menu_1 = require("@/shared/components/ui/dropdown-menu");
const routes_1 = require("@/config/routes");
const MessagesNavIcon_1 = require("@/features/messaging/components/MessagesNavIcon");
function HeaderSearch() {
    const router = (0, navigation_1.useRouter)();
    const pathname = (0, navigation_1.usePathname)();
    const searchParams = (0, navigation_1.useSearchParams)();
    const initialQuery = searchParams.get('q') || '';
    const [searchValue, setSearchValue] = (0, react_1.useState)(initialQuery);
    const debouncedSearch = (0, useDebounce_1.useDebounce)(searchValue, 500);
    (0, react_1.useEffect)(() => {
        if (debouncedSearch === (searchParams.get('q') || ''))
            return;
        const params = new URLSearchParams(searchParams.toString());
        if (debouncedSearch) {
            params.set('q', debouncedSearch);
        }
        else {
            params.delete('q');
        }
        if (pathname !== '/student') {
            if (debouncedSearch)
                router.push(`/student?${params.toString()}`);
        }
        else {
            router.replace(`?${params.toString()}`);
        }
    }, [debouncedSearch, pathname, router, searchParams]);
    return (<div className="hidden md:flex flex-1 max-w-xl relative group">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <lucide_react_1.Search size={18} className="text-muted-foreground"/>
      </div>
      <input type="text" value={searchValue} onChange={(e) => setSearchValue(e.target.value)} placeholder="Tìm lớp học, bài giảng, giáo viên..." className="block w-full pl-10 pr-3 py-2 border border-border rounded-full leading-5 bg-muted/50 text-foreground placeholder-muted-foreground focus:outline-none focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm transition-all shadow-sm"/>
    </div>);
}
function StudentNavbar() {
    const { user } = (0, auth_store_1.useAuthStore)();
    const { mutate: logout, isPending } = (0, useLogout_1.useLogout)();
    const [imageError, setImageError] = (0, react_1.useState)(false);
    console.log("Current User in Store:", user);
    return (<nav className="fixed w-full z-50 top-0 bg-card/95 backdrop-blur-md border-b border-border shadow-sm transition-colors duration-200">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-8">

          
          <link_1.default href="/student" className="flex-shrink-0 flex items-center gap-2 cursor-pointer outline-none">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/30">
              <lucide_react_1.School size={20}/>
            </div>
            <span className="font-bold text-xl text-primary tracking-tight">EArena</span>
          </link_1.default>

          <react_1.Suspense fallback={<div className="hidden md:flex flex-1 max-w-xl bg-muted/50 rounded-full h-9 animate-pulse"></div>}>
            <HeaderSearch />
          </react_1.Suspense>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <MessagesNavIcon_1.MessagesNavIcon href={routes_1.ROUTES.STUDENT.MESSAGES} role="STUDENT"/>
            <button className="p-2 text-muted-foreground hover:text-primary transition rounded-full hover:bg-muted relative outline-none">
              <lucide_react_1.Bell size={20}/>
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-background"></span>
            </button>

            <div className="h-8 w-px bg-border mx-2 hidden sm:block"></div>

            <dropdown_menu_1.DropdownMenu>
              <dropdown_menu_1.DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 cursor-pointer hover:bg-muted p-1 rounded-full pr-3 transition outline-none group">
                  {user?.avatar && !imageError ? (<img src={user.avatar} alt={user?.fullName || 'User Avatar'} referrerPolicy="no-referrer" onError={() => setImageError(true)} className="w-9 h-9 rounded-full object-cover border border-primary/20 group-hover:ring-2 group-hover:ring-primary/50 transition-all shadow-sm"/>) : (<div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20 group-hover:ring-2 group-hover:ring-primary/50 transition-all overflow-hidden">
                      {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>)}

                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                      {user?.fullName || 'Đang tải...'}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                      {user?.role === 'STUDENT' ? 'Học sinh' : (user?.role || 'Học sinh')}
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

                <link_1.default href={routes_1.ROUTES.STUDENT.PROFILE}>
                  <dropdown_menu_1.DropdownMenuItem className="cursor-pointer">
                    <lucide_react_1.UserCircle className="mr-2 h-4 w-4"/>
                    <span>Hồ sơ cá nhân</span>
                  </dropdown_menu_1.DropdownMenuItem>
                </link_1.default>

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
//# sourceMappingURL=StudentNavbar.js.map