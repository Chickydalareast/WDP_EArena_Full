'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LoginPage;
const link_1 = __importDefault(require("next/link"));
const LoginForm_1 = require("@/features/auth/components/LoginForm");
const google_1 = require("@react-oauth/google");
const hooks_1 = require("@/features/auth/hooks");
const sonner_1 = require("sonner");
function LoginPage() {
    const { mutate: loginWithGoogle, isPending: isGooglePending } = (0, hooks_1.useGoogleAuth)();
    return (<div className="bg-background text-foreground antialiased min-h-screen overflow-hidden flex flex-col lg:flex-row transition-colors duration-200">

      <div className="hidden lg:flex lg:w-1/2 bg-primary relative flex-col justify-center items-center text-primary-foreground p-12 overflow-hidden">
        <div className="relative z-10 max-w-lg text-center flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-8 leading-tight">
            Tham gia cùng <br />
            <span className="text-white">10,000+ học sinh</span>
          </h1>
          <p className="text-xl text-primary-foreground/90 font-medium mb-12 leading-relaxed">
            Hệ thống luyện thi thông minh, kho đề thi khổng lồ và cộng đồng học tập sôi nổi đang chờ đón bạn.
          </p>
          <div className="flex justify-center gap-3">
            <button className="w-10 h-2 bg-white rounded-full transition-all duration-300 hover:bg-white/90 shadow-sm"></button>
            <button className="w-2 h-2 bg-white/40 rounded-full transition-all duration-300 hover:bg-white/70"></button>
            <button className="w-2 h-2 bg-white/40 rounded-full transition-all duration-300 hover:bg-white/70"></button>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 h-full bg-card overflow-y-auto relative flex flex-col">

        <div className="lg:hidden p-4 flex items-center gap-2 border-b border-border">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
            <span className="material-symbols-outlined text-lg">school</span>
          </div>
          <span className="font-bold text-lg text-primary">EArena</span>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 md:px-24 py-12">
          <div className="w-full max-w-md space-y-8">

            <div className="hidden lg:flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/30">
                <span className="material-symbols-outlined text-xl">school</span>
              </div>
              <span className="font-bold text-2xl text-primary tracking-tight">EArena</span>
            </div>

            <div className="flex items-center gap-8 border-b border-border">
              <div className="pb-3 text-lg font-bold text-primary border-b-2 border-primary transition-all">
                Đăng nhập
              </div>
              <link_1.default href="/register" className="pb-3 text-lg font-medium text-muted-foreground hover:text-foreground transition-colors">
                Đăng ký
              </link_1.default>
            </div>

            <LoginForm_1.LoginForm />

            <div className="relative pt-2">
              <div className="absolute inset-0 flex items-center pt-2">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm pt-2">
                <span className="px-4 bg-card text-muted-foreground font-medium">Hoặc tiếp tục với</span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="w-full overflow-hidden rounded-xl border border-border shadow-sm pointer-events-auto">
                {isGooglePending ? (<div className="py-2.5 text-center text-sm font-medium text-muted-foreground bg-muted/50">
                    Đang kết nối Google...
                  </div>) : (<google_1.GoogleLogin onSuccess={(credentialResponse) => {
                if (credentialResponse.credential) {
                    loginWithGoogle(credentialResponse.credential);
                }
            }} onError={() => {
                sonner_1.toast.error('Giao tiếp với máy chủ Google thất bại', {
                    description: 'Không thể lấy được chứng chỉ từ Google. Vui lòng thử lại.'
                });
            }} useOneTap={process.env.NODE_ENV === 'production'} theme="outline" size="large" width="100%" text="continue_with"/>)}
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground pt-4">
              Bạn chưa có tài khoản? <link_1.default href="/register" className="font-bold text-primary hover:text-primary/80 transition-colors">Đăng ký ngay</link_1.default>
            </p>

          </div>
        </div>

        <div className="py-6 text-center text-xs text-muted-foreground border-t lg:border-none border-border">
          © {new Date().getFullYear()} EArena Inc. All rights reserved.
        </div>
      </div>
    </div>);
}
//# sourceMappingURL=page.js.map