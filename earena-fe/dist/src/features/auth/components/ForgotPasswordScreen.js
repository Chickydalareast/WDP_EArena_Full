'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForgotPasswordScreen = void 0;
const react_hook_form_1 = require("react-hook-form");
const button_1 = require("@/shared/components/ui/button");
const input_1 = require("@/shared/components/ui/input");
const label_1 = require("@/shared/components/ui/label");
const sonner_1 = require("sonner");
const auth_flow_store_1 = require("../stores/auth-flow.store");
const hooks_1 = require("../hooks");
const useResetPassword_1 = require("../hooks/useResetPassword");
const EmailStep = () => {
    const { mutate: sendOtp, isPending } = (0, hooks_1.useSendOtp)();
    const { register, handleSubmit } = (0, react_hook_form_1.useForm)();
    return (<form onSubmit={handleSubmit((data) => sendOtp({ email: data.email, type: 'FORGOT_PASSWORD' }))} className="space-y-4">
      <div className="space-y-2">
        <label_1.Label htmlFor="email">Email đã đăng ký</label_1.Label>
        <input_1.Input id="email" type="email" placeholder="hvm@earena.edu.vn" disabled={isPending} {...register('email')}/>
      </div>
      <button_1.Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Đang kiểm tra...' : 'Gửi mã khôi phục'}
      </button_1.Button>
    </form>);
};
const OtpStep = () => {
    const { email } = (0, auth_flow_store_1.useAuthFlowStore)();
    const { mutate: verifyOtp, isPending } = (0, hooks_1.useVerifyOtp)();
    const { register, handleSubmit } = (0, react_hook_form_1.useForm)();
    return (<form onSubmit={handleSubmit((data) => verifyOtp({ email, otp: data.otp, type: 'FORGOT_PASSWORD' }))} className="space-y-4">
      <label_1.Label>Nhập OTP gửi về {email}</label_1.Label>
      <input_1.Input maxLength={6} disabled={isPending} {...register('otp')} className="text-center tracking-widest text-lg"/>
      <button_1.Button type="submit" className="w-full" disabled={isPending}>Xác nhận OTP</button_1.Button>
    </form>);
};
const ResetPassStep = () => {
    const { email, ticket } = (0, auth_flow_store_1.useAuthFlowStore)();
    const { mutate: executeReset, isPending } = (0, useResetPassword_1.useResetPassword)();
    const { register, handleSubmit } = (0, react_hook_form_1.useForm)();
    const onSubmit = (data) => {
        if (!ticket)
            return sonner_1.toast.error('Lỗi phiên làm việc');
        executeReset({ email, newPassword: data.newPassword, ticket });
    };
    return (<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label_1.Label>Mật khẩu mới</label_1.Label>
        <input_1.Input type="password" disabled={isPending} {...register('newPassword')}/>
      </div>
      <button_1.Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Đang đổi mật khẩu...' : 'Xác nhận đổi mật khẩu'}
      </button_1.Button>
    </form>);
};
const ForgotPasswordScreen = () => {
    const step = (0, auth_flow_store_1.useAuthFlowStore)((state) => state.step);
    return (<div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Khôi phục mật khẩu</h2>
      </div>
      {step === 'INPUT_EMAIL' && <EmailStep />}
      {step === 'VERIFY_OTP' && <OtpStep />}
      {step === 'INPUT_DETAILS' && <ResetPassStep />}
    </div>);
};
exports.ForgotPasswordScreen = ForgotPasswordScreen;
//# sourceMappingURL=ForgotPasswordScreen.js.map