'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppNavbar = AppNavbar;
const react_1 = require("react");
const link_1 = __importDefault(require("next/link"));
const navigation_1 = require("next/navigation");
const auth_store_1 = require("@/features/auth/stores/auth.store");
const useLogout_1 = require("@/features/auth/hooks/useLogout");
const billing_ui_store_1 = require("@/features/billing/stores/billing-ui.store");
const useBillingFlows_1 = require("@/features/billing/hooks/useBillingFlows");
const NotificationDropdown_1 = require("@/features/notifications/components/NotificationDropdown");
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/shared/lib/utils");
const dropdown_menu_1 = require("@/shared/components/ui/dropdown-menu");
const skeleton_1 = require("@/shared/components/ui/skeleton");
const sheet_1 = require("@/shared/components/ui/sheet");
const navigation_2 = require("@/config/navigation");
const routes_1 = require("@/config/routes");
function AppNavbar() {
    const { user, isInitialized } = (0, auth_store_1.useAuthStore)();
    const { mutate: logout, isPending } = (0, useLogout_1.useLogout)();
    const pathname = (0, navigation_1.usePathname)();
    const [imageError, setImageError] = (0, react_1.useState)(false);
    const openDepositModal = (0, billing_ui_store_1.useBillingUIStore)((state) => state.openDepositModal);
    const role = user?.role === 'TEACHER' ? 'TEACHER' : 'STUDENT';
    const homeRoute = role === 'TEACHER' ? routes_1.ROUTES.TEACHER.DASHBOARD : routes_1.ROUTES.STUDENT.DASHBOARD;
    const navItems = navigation_2.NAV_CONFIG[role] || navigation_2.NAV_CONFIG.STUDENT;
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };
    const DesktopNav = () => (<nav className="hidden md:flex items-center gap-1 mx-8">
      {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== homeRoute);
            const Icon = item.icon;
            return (<link_1.default key={item.href} href={item.href} className={(0, utils_1.cn)("flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all outline-none", isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:bg-primary/10 hover:text-primary")}>
            <Icon size={16}/>
            <span>{item.title}</span>
          </link_1.default>);
        })}
    </nav>);
    const MobileNav = () => (<sheet_1.Sheet>
      <sheet_1.SheetTrigger asChild>
        <button className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-primary transition outline-none">
          <lucide_react_1.Menu size={24}/>
        </button>
      </sheet_1.SheetTrigger>
      <sheet_1.SheetContent side="left" className="w-[280px] sm:w-[320px] p-0 flex flex-col border-r-border">
        <sheet_1.SheetHeader className="p-6 border-b border-border text-left">
          <sheet_1.SheetTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
              <lucide_react_1.School size={18}/>
            </div>
            <span className="font-bold text-xl text-primary tracking-tight">EArena</span>
          </sheet_1.SheetTitle>
        </sheet_1.SheetHeader>
        <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== homeRoute);
            const Icon = item.icon;
            return (<link_1.default key={item.href} href={item.href} className={(0, utils_1.cn)("flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all", isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:bg-primary/5 hover:text-primary")}>
                <Icon size={18}/>
                <span>{item.title}</span>
              </link_1.default>);
        })}
        </div>
      </sheet_1.SheetContent>
    </sheet_1.Sheet>);
    const NavbarWalletBadge = () => {
        const { data: walletData, isLoading } = (0, useBillingFlows_1.useSyncWallet)();
        const balance = walletData?.balance ?? 0;
        if (!isInitialized || !user || user.role === 'ADMIN')
            return null;
        if (role === 'STUDENT') {
            return (<div onClick={() => openDepositModal()} className="hidden sm:flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-full cursor-pointer transition-colors border border-primary/20" title="Nạp thêm tiền">
          <lucide_react_1.Wallet className="w-4 h-4"/>
          {isLoading ? (<skeleton_1.Skeleton className="w-16 h-4 bg-primary/20"/>) : (<span className="font-bold text-sm">{formatCurrency(balance)}</span>)}
          <lucide_react_1.PlusCircle className="w-4 h-4 ml-1 opacity-70"/>
        </div>);
        }
        if (role === 'TEACHER') {
            return (<link_1.default href={routes_1.ROUTES.TEACHER.WALLET} className="hidden sm:flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/30 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-400 px-3 py-1.5 rounded-full cursor-pointer transition-colors border border-indigo-200 dark:border-indigo-800" title="Ví doanh thu">
          <lucide_react_1.Wallet className="w-4 h-4"/>
          {isLoading ? (<skeleton_1.Skeleton className="w-16 h-4 bg-indigo-200/50"/>) : (<span className="font-bold text-sm">{formatCurrency(balance)}</span>)}
        </link_1.default>);
        }
        return null;
    };
    const UserDropdown = () => {
        const { data: walletData, isLoading } = (0, useBillingFlows_1.useSyncWallet)();
        const balance = walletData?.balance ?? 0;
        if (!isInitialized) {
            return (<div className="flex items-center gap-3 p-1">
          <skeleton_1.Skeleton className="w-9 h-9 rounded-full"/>
          <div className="hidden lg:flex flex-col gap-1">
            <skeleton_1.Skeleton className="h-4 w-24"/>
            <skeleton_1.Skeleton className="h-3 w-16"/>
          </div>
        </div>);
        }
        return (<dropdown_menu_1.DropdownMenu>
        <dropdown_menu_1.DropdownMenuTrigger asChild>
          <div className="flex items-center gap-3 cursor-pointer hover:bg-muted p-1 rounded-full pr-3 transition outline-none group">
            {user?.avatar && !imageError ? (<img src={user.avatar} alt={user?.fullName || 'Avatar'} referrerPolicy="no-referrer" onError={() => setImageError(true)} className="w-9 h-9 rounded-full object-cover border border-primary/20 group-hover:ring-2 group-hover:ring-primary/50 transition-all shadow-sm"/>) : (<div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20 group-hover:ring-2 group-hover:ring-primary/50 transition-all overflow-hidden">
                {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
              </div>)}
            <div className="hidden lg:block text-left">
              <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate max-w-[120px]">
                {user?.fullName || 'Đang tải...'}
              </p>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                {role === 'STUDENT' ? 'Học sinh' : 'Giáo viên'}
              </p>
            </div>
          </div>
        </dropdown_menu_1.DropdownMenuTrigger>
        <dropdown_menu_1.DropdownMenuContent align="end" className="w-64 mt-2">
          <dropdown_menu_1.DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none truncate">{user?.fullName}</p>
              <p className="text-xs leading-none text-muted-foreground truncate">{user?.email}</p>
            </div>
          </dropdown_menu_1.DropdownMenuLabel>
          
          <dropdown_menu_1.DropdownMenuSeparator />
          
          {user?.role !== 'ADMIN' && (<div className="p-3 mb-1 mx-1 rounded-xl bg-muted/40 border border-border">
              <div className="flex justify-between items-center mb-2">
                <span className={`text-xs font-semibold flex items-center gap-1.5 ${role === 'TEACHER' ? 'text-indigo-600' : 'text-muted-foreground'}`}>
                  <lucide_react_1.Wallet className="w-3.5 h-3.5"/> 
                  {role === 'TEACHER' ? 'Ví doanh thu' : 'Số dư ví'}
                </span>
                {isLoading ? (<skeleton_1.Skeleton className="w-16 h-4"/>) : (<span className={`font-bold text-sm ${role === 'TEACHER' ? 'text-indigo-700' : 'text-primary'}`}>
                    {formatCurrency(balance)}
                  </span>)}
              </div>
              {role === 'STUDENT' ? (<button onClick={(e) => { e.preventDefault(); openDepositModal(); }} className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold py-2 rounded-lg transition-colors">
                  <lucide_react_1.PlusCircle className="w-3.5 h-3.5"/> Nạp thêm tiền
                </button>) : (<div className="flex gap-2 mt-1">
                  <button onClick={(e) => { e.preventDefault(); openDepositModal(); }} className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-800 text-xs font-bold py-2 rounded-lg transition-colors">
                    <lucide_react_1.PlusCircle className="w-3.5 h-3.5"/> Nạp
                  </button>
                  <link_1.default href={routes_1.ROUTES.TEACHER.WALLET} className="flex-1 flex items-center justify-center bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold py-2 rounded-lg transition-colors">
                    Quản lý ví
                  </link_1.default>
                </div>)}
            </div>)}

          <link_1.default href={`${homeRoute}/profile`}>
            <dropdown_menu_1.DropdownMenuItem className="cursor-pointer">
              <lucide_react_1.UserCircle className="mr-2 h-4 w-4"/>
              <span>Hồ sơ cá nhân</span>
            </dropdown_menu_1.DropdownMenuItem>
          </link_1.default>
          {role === 'STUDENT' && (<link_1.default href={routes_1.ROUTES.STUDENT.WALLET}>
              <dropdown_menu_1.DropdownMenuItem className="cursor-pointer">
                <lucide_react_1.History className="mr-2 h-4 w-4"/>
                <span>Lịch sử giao dịch</span>
              </dropdown_menu_1.DropdownMenuItem>
            </link_1.default>)}

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
      </dropdown_menu_1.DropdownMenu>);
    };
    return (<nav className="fixed w-full z-50 top-0 bg-card/95 backdrop-blur-md border-b border-border shadow-sm transition-colors duration-200">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          
          <div className="flex items-center gap-4">
            <MobileNav />
            <link_1.default href={homeRoute} className="flex-shrink-0 flex items-center gap-2 cursor-pointer outline-none group">
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">
                <lucide_react_1.School size={20}/>
              </div>
              <span className="font-bold text-xl text-primary tracking-tight hidden sm:block">EArena</span>
              {role === 'TEACHER' && (<span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-muted-foreground uppercase tracking-wide border border-border ml-1">
                  Teacher
                </span>)}
            </link_1.default>
          </div>

          <DesktopNav />

          <div className="flex items-center space-x-2 sm:space-x-4">
            <NavbarWalletBadge />

            <NotificationDropdown_1.NotificationDropdown />
            
            <div className="h-8 w-px bg-border mx-1 hidden sm:block"></div>
            <UserDropdown />
          </div>

        </div>
      </div>
    </nav>);
}
//# sourceMappingURL=AppNavbar.js.map