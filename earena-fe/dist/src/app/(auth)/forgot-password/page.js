"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ForgotPasswordPage;
const ForgotPasswordScreen_1 = require("@/features/auth/components/ForgotPasswordScreen");
const link_1 = __importDefault(require("next/link"));
function ForgotPasswordPage() {
    return (<div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black p-4">
      <div className="w-full max-w-md space-y-6">
        <ForgotPasswordScreen_1.ForgotPasswordScreen />
        <div className="text-center text-sm text-gray-500">
          Nhớ mật khẩu rồi?{' '}
          <link_1.default href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Quay lại Đăng nhập
          </link_1.default>
        </div>
      </div>
    </div>);
}
//# sourceMappingURL=page.js.map