"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterScreen = void 0;
const react_1 = require("react");
const react_hook_form_1 = require("react-hook-form");
const rhf_zod_resolver_1 = require("@/shared/lib/rhf-zod-resolver");
const button_1 = require("@/shared/components/ui/button");
const input_1 = require("@/shared/components/ui/input");
const label_1 = require("@/shared/components/ui/label");
const sonner_1 = require("sonner");
const lucide_react_1 = require("lucide-react");
const useSubjects_1 = require("../hooks/useSubjects");
const auth_flow_store_1 = require("../stores/auth-flow.store");
const hooks_1 = require("../hooks");
const auth_service_1 = require("../api/auth.service");
const auth_schema_1 = require("../types/auth.schema");
const EmailStep = () => {
    const { mutate: sendOtp, isPending } = (0, hooks_1.useSendOtp)();
    const { mutate: loginWithGoogle, isPending: isGooglePending } = (0, hooks_1.useGoogleAuth)();
    const setEmailAndRole = (0, auth_flow_store_1.useAuthFlowStore)((state) => state.setEmailAndRole);
    const { register, handleSubmit, watch, formState: { errors }, } = (0, react_hook_form_1.useForm)({
        resolver: (0, rhf_zod_resolver_1.rhfZodResolver)(auth_schema_1.registerEmailSchema),
        defaultValues: {
            role: "STUDENT",
        },
    });
    const selectedRole = watch("role");
    return (<div className="space-y-6">
      
      

      
      <form onSubmit={handleSubmit((data) => {
            setEmailAndRole(data.email, data.role);
            sendOtp({ email: data.email, type: "REGISTER" });
        })} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          
          <div className="relative cursor-pointer group">
            <input id="role_student" type="radio" value="STUDENT" {...register("role")} className="peer sr-only" disabled={isGooglePending || isPending}/>
            <label htmlFor="role_student" className="flex flex-col items-center justify-center p-4 border-2 border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-muted/50 peer-checked:border-primary peer-checked:bg-primary/5 transition-all h-full">
              <span className="material-symbols-outlined text-3xl mb-2 text-muted-foreground peer-checked:text-primary transition-colors">
                school
              </span>
              <span className="font-semibold text-sm sm:text-base text-muted-foreground peer-checked:text-foreground transition-colors">
                Học sinh
              </span>
            </label>
            <div className="absolute top-2 right-2 opacity-0 peer-checked:opacity-100 text-primary transition-all duration-200 transform scale-50 peer-checked:scale-100 pointer-events-none">
              <span className="material-symbols-outlined text-xl">
                check_circle
              </span>
            </div>
          </div>

          
          <div className="relative cursor-pointer group">
            <input id="role_teacher" type="radio" value="TEACHER" {...register("role")} className="peer sr-only" disabled={isGooglePending || isPending}/>
            <label htmlFor="role_teacher" className="flex flex-col items-center justify-center p-4 border-2 border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-muted/50 peer-checked:border-primary peer-checked:bg-primary/5 transition-all h-full">
              <span className="material-symbols-outlined text-3xl mb-2 text-muted-foreground peer-checked:text-primary transition-colors">
                work
              </span>
              <span className="font-semibold text-sm sm:text-base text-muted-foreground peer-checked:text-foreground transition-colors">
                Giáo viên
              </span>
            </label>
            <div className="absolute top-2 right-2 opacity-0 peer-checked:opacity-100 text-primary transition-all duration-200 transform scale-50 peer-checked:scale-100 pointer-events-none">
              <span className="material-symbols-outlined text-xl">
                check_circle
              </span>
            </div>
          </div>
        </div>

        <div>
          <label_1.Label htmlFor="email" className="block text-sm font-semibold text-foreground mb-1.5">
            Email của bạn
          </label_1.Label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-muted-foreground group-focus-within:text-primary transition-colors">
                mail
              </span>
            </div>
            <input_1.Input id="email" type="email" placeholder="VD: nguyenvan.a@gmail.com" disabled={isPending || isGooglePending} {...register("email")} className={`block w-full pl-11 pr-4 py-6 bg-muted/30 border-border rounded-xl text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary transition-all sm:text-sm ${errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}/>
          </div>
          {errors.email && (<p className="text-sm font-medium text-red-500 mt-1">
              {errors.email.message}
            </p>)}
        </div>

        <button_1.Button type="submit" className="w-full py-6 rounded-full shadow-lg shadow-primary/25 text-base font-bold hover:-translate-y-0.5 transition-transform" disabled={isPending || isGooglePending}>
          {isPending ? "Đang gửi mã..." : "Tiếp tục với Email"}
        </button_1.Button>
      </form>
    </div>);
};
const OtpStep = () => {
    const { email, resendAvailableAt, setStep } = (0, auth_flow_store_1.useAuthFlowStore)();
    const { mutate: verifyOtp, isPending } = (0, hooks_1.useVerifyOtp)();
    const { mutate: resendOtp, isPending: isResending } = (0, hooks_1.useSendOtp)();
    const [timeLeft, setTimeLeft] = (0, react_1.useState)(0);
    (0, react_1.useEffect)(() => {
        if (!resendAvailableAt)
            return;
        const calculateTimeLeft = () => {
            const remaining = Math.max(0, Math.floor((resendAvailableAt - Date.now()) / 1000));
            setTimeLeft(remaining);
            return remaining;
        };
        if (calculateTimeLeft() > 0) {
            const interval = setInterval(() => {
                if (calculateTimeLeft() <= 0)
                    clearInterval(interval);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [resendAvailableAt]);
    const { register, handleSubmit, formState: { errors }, } = (0, react_hook_form_1.useForm)({
        resolver: (0, rhf_zod_resolver_1.rhfZodResolver)(auth_schema_1.verifyOtpSchema),
    });
    return (<form onSubmit={handleSubmit((data) => verifyOtp({ email, otp: data.otp, type: "REGISTER" }))} className="space-y-5">
      <div className="text-center mb-6">
        <p className="text-sm text-muted-foreground">
          Mã xác nhận 6 số đã được gửi đến
        </p>
        <p className="font-bold text-primary text-lg mt-1">{email}</p>
      </div>

      <div>
        <label_1.Label htmlFor="otp" className="block text-sm font-semibold text-foreground mb-1.5">
          Mã OTP
        </label_1.Label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-muted-foreground group-focus-within:text-primary transition-colors">
              password
            </span>
          </div>
          <input_1.Input id="otp" maxLength={6} placeholder="••••••" disabled={isPending} {...register("otp")} className={`block w-full pl-11 pr-4 py-6 text-center tracking-[0.5em] text-xl font-bold bg-muted/30 border-border rounded-xl text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary transition-all ${errors.otp ? "border-red-500 focus-visible:ring-red-500" : ""}`}/>
        </div>
        {errors.otp && (<p className="text-sm font-medium text-red-500 mt-1 text-center">
            {errors.otp.message}
          </p>)}
      </div>

      <button_1.Button type="submit" className="w-full py-6 rounded-full shadow-lg shadow-primary/25 text-base font-bold hover:-translate-y-0.5 transition-transform" disabled={isPending}>
        {isPending ? "Đang xác thực..." : "Xác nhận OTP"}
      </button_1.Button>

      <div className="flex flex-col items-center gap-2 mt-4 text-sm">
        {timeLeft > 0 ? (<p className="text-muted-foreground">
            Gửi lại mã sau{" "}
            <span className="font-bold text-foreground">{timeLeft}s</span>
          </p>) : (<button type="button" onClick={() => resendOtp({ email, type: "REGISTER" })} disabled={isResending} className="font-medium text-primary hover:text-primary/80 transition-colors">
            {isResending ? "Đang gửi lại..." : "Chưa nhận được mã? Gửi lại"}
          </button>)}
        <button type="button" onClick={() => setStep("INPUT_EMAIL")} className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mt-2">
          Sai địa chỉ email? Quay lại
        </button>
      </div>
    </form>);
};
const DetailsStep = () => {
    const { email, ticket, role } = (0, auth_flow_store_1.useAuthFlowStore)();
    const { mutate: executeRegister, isPending } = (0, hooks_1.useRegister)();
    const [showPassword, setShowPassword] = (0, react_1.useState)(false);
    const [showConfirmPassword, setShowConfirmPassword] = (0, react_1.useState)(false);
    const [qualifications, setQualifications] = (0, react_1.useState)([]);
    const [newQualName, setNewQualName] = (0, react_1.useState)("");
    const [newQualFile, setNewQualFile] = (0, react_1.useState)(null);
    const [qualUploadPending, setQualUploadPending] = (0, react_1.useState)(false);
    const qualFileInputRef = (0, react_1.useRef)(null);
    const { data: subjects = [], isLoading: isLoadingSubjects } = (0, useSubjects_1.useSubjects)();
    const { register, handleSubmit, watch, formState: { errors }, } = (0, react_hook_form_1.useForm)({
        resolver: (0, rhf_zod_resolver_1.rhfZodResolver)(auth_schema_1.registerDetailsSchema),
        defaultValues: {
            role: role,
            subjectId: "",
        },
    });
    const currentPassword = watch("password", "");
    const calculateStrength = (pass) => {
        let score = 0;
        if (!pass)
            return 0;
        if (pass.length >= 8)
            score += 1;
        if (/[A-Z]/.test(pass) && /[a-z]/.test(pass))
            score += 1;
        if (/[0-9]/.test(pass))
            score += 1;
        if (/[^A-Za-z0-9]/.test(pass))
            score += 1;
        return score;
    };
    const strengthScore = calculateStrength(currentPassword);
    const getStrengthBarColor = (index) => {
        if (strengthScore === 0)
            return "bg-border";
        if (strengthScore <= 2)
            return index === 0 ? "bg-red-500" : "bg-border";
        if (strengthScore === 3)
            return index <= 1 ? "bg-yellow-500" : "bg-border";
        return "bg-green-500";
    };
    const getStrengthLabel = () => {
        if (strengthScore === 0)
            return "Chưa nhập";
        if (strengthScore <= 2)
            return "Yếu";
        if (strengthScore === 3)
            return "Trung bình";
        return "Mạnh";
    };
    const onSubmit = (data) => {
        if (!ticket) {
            sonner_1.toast.error("Dữ liệu xác thực không hợp lệ", {
                description: "Vui lòng bắt đầu lại.",
            });
            auth_flow_store_1.useAuthFlowStore.getState().resetFlow();
            return;
        }
        if (role === "TEACHER" && qualifications.length === 0) {
            sonner_1.toast.error("Vui lòng upload ít nhất một bằng cấp");
            return;
        }
        const finalSubjectIds = (role === "TEACHER" && data.subjectId)
            ? [data.subjectId]
            : undefined;
        executeRegister({
            email,
            fullName: data.fullName,
            password: data.password,
            ticket,
            role,
            subjectIds: finalSubjectIds,
            qualifications: role === "TEACHER" ? qualifications : undefined,
        });
    };
    const addQualification = async () => {
        if (!newQualName.trim() || !newQualFile) {
            sonner_1.toast.error("Vui lòng nhập tên bằng cấp và chọn file ảnh");
            return;
        }
        if (!ticket) {
            sonner_1.toast.error("Phiên đăng ký không hợp lệ", { description: "Vui lòng bắt đầu lại." });
            auth_flow_store_1.useAuthFlowStore.getState().resetFlow();
            return;
        }
        setQualUploadPending(true);
        try {
            const item = await auth_service_1.authService.uploadRegisterQualification({
                email,
                ticket,
                name: newQualName.trim(),
                file: newQualFile,
            });
            setQualifications([...qualifications, item]);
            setNewQualName("");
            setNewQualFile(null);
            if (qualFileInputRef.current)
                qualFileInputRef.current.value = "";
            sonner_1.toast.success("Đã tải ảnh bằng cấp lên");
        }
        catch (e) {
            const msg = e instanceof Error ? e.message : "Tải ảnh thất bại";
            sonner_1.toast.error(msg);
        }
        finally {
            setQualUploadPending(false);
        }
    };
    const removeQualification = (index) => {
        setQualifications(qualifications.filter((_, i) => i !== index));
    };
    return (<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label_1.Label htmlFor="fullName" className="block text-sm font-semibold text-foreground mb-1.5">
          Họ và tên hiển thị
        </label_1.Label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-muted-foreground group-focus-within:text-primary transition-colors">
              badge
            </span>
          </div>
          <input_1.Input id="fullName" disabled={isPending} placeholder="Nguyễn Văn A" {...register("fullName")} className={`block w-full pl-11 pr-4 py-6 bg-muted/30 border-border rounded-xl text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary transition-all sm:text-sm ${errors.fullName ? "border-red-500 focus-visible:ring-red-500" : ""}`}/>
        </div>
        {errors.fullName && (<p className="text-sm font-medium text-red-500 mt-1">
            {errors.fullName.message}
          </p>)}
      </div>

      <div>
        <label_1.Label htmlFor="password" className="block text-sm font-semibold text-foreground mb-1.5">
          Mật khẩu
        </label_1.Label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-muted-foreground group-focus-within:text-primary transition-colors">
              lock
            </span>
          </div>
          <input_1.Input id="password" type={showPassword ? "text" : "password"} disabled={isPending} placeholder="••••••••" {...register("password")} className={`block w-full pl-11 pr-12 py-6 bg-muted/30 border-border rounded-xl text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary transition-all sm:text-sm ${errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}/>
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground cursor-pointer">
            <span className="material-symbols-outlined text-xl">
              {showPassword ? "visibility_off" : "visibility"}
            </span>
          </button>
        </div>

        <div className="mt-2.5">
          <div className="flex gap-1.5 h-1.5">
            <div className={`flex-1 rounded-full transition-colors duration-300 ${getStrengthBarColor(0)}`}></div>
            <div className={`flex-1 rounded-full transition-colors duration-300 ${getStrengthBarColor(1)}`}></div>
            <div className={`flex-1 rounded-full transition-colors duration-300 ${getStrengthBarColor(2)}`}></div>
          </div>
          <div className="flex justify-between items-center mt-1.5">
            <span className={`text-xs font-medium transition-colors ${strengthScore > 0 ? "text-foreground" : "text-muted-foreground"}`}>
              Độ mạnh: {getStrengthLabel()}
            </span>
          </div>
        </div>
        {errors.password && (<p className="text-sm font-medium text-red-500 mt-1">
            {errors.password.message}
          </p>)}
      </div>

      <div>
        <label_1.Label htmlFor="confirmPassword" className="block text-sm font-semibold text-foreground mb-1.5">
          Nhập lại mật khẩu
        </label_1.Label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-muted-foreground group-focus-within:text-primary transition-colors">
              lock_reset
            </span>
          </div>
          <input_1.Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} disabled={isPending} placeholder="••••••••" {...register("confirmPassword")} className={`block w-full pl-11 pr-12 py-6 bg-muted/30 border-border rounded-xl text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary transition-all sm:text-sm ${errors.confirmPassword
            ? "border-red-500 focus-visible:ring-red-500"
            : ""}`}/>
          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground cursor-pointer">
            <span className="material-symbols-outlined text-xl">
              {showConfirmPassword ? "visibility_off" : "visibility"}
            </span>
          </button>
        </div>
        {errors.confirmPassword && (<p className="text-sm font-medium text-red-500 mt-1">
            {errors.confirmPassword.message}
          </p>)}
      </div>

      
      {role === "TEACHER" && (<>
          <div className="pt-2">
            <label_1.Label className="block text-sm font-semibold text-foreground mb-1.5">
              Chuyên môn giảng dạy <span className="text-red-500">*</span>
            </label_1.Label>
            <p className="text-xs text-muted-foreground mb-3">
              Vui lòng chọn môn học bạn sẽ đảm nhiệm.
            </p>

            {isLoadingSubjects ? (<div className="flex justify-center items-center py-6 border-2 border-dashed border-border rounded-xl">
                <span className="material-symbols-outlined animate-spin text-primary text-2xl">
                  progress_activity
                </span>
              </div>) : (<div className="grid grid-cols-2 gap-3 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                {subjects.map((subject) => (<label key={subject._id} className="flex items-center space-x-3 p-3 border-2 border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-all has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                    <input type="radio" value={subject._id} {...register("subjectId")} className="w-4 h-4 text-primary rounded-full border-muted focus:ring-primary focus:ring-offset-background" disabled={isPending}/>
                    <span className="text-sm font-medium text-foreground select-none line-clamp-1">
                      {subject.name}
                    </span>
                  </label>))}
              </div>)}
            {errors.subjectId && (<p className="text-sm font-medium text-red-500 mt-2">
                {errors.subjectId.message}
              </p>)}
          </div>

          
          <div className="pt-2">
            <label_1.Label className="block text-sm font-semibold text-foreground mb-1.5">
              Bằng cấp / Chứng chỉ <span className="text-red-500">*</span>
            </label_1.Label>
            <p className="text-xs text-muted-foreground mb-3">
              Tải lên ít nhất một ảnh bằng cấp / chứng chỉ (JPEG, PNG, WebP hoặc GIF, tối đa 5MB).
            </p>

            
            {qualifications.length > 0 && (<div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
                {qualifications.map((q, index) => (<div key={index} className="flex items-center justify-between gap-2 p-3 rounded-lg border bg-muted/30">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      
                      <img src={q.url} alt="" className="w-14 h-14 object-cover rounded-md border flex-shrink-0 bg-background"/>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{q.name}</div>
                        <div className="text-xs text-muted-foreground truncate">Đã tải lên</div>
                      </div>
                    </div>
                    <button type="button" onClick={() => removeQualification(index)} className="p-1 hover:bg-destructive/10 rounded text-destructive flex-shrink-0" disabled={isPending || qualUploadPending}>
                      <lucide_react_1.X className="w-4 h-4"/>
                    </button>
                  </div>))}
              </div>)}

            
            <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
              <div className="flex-1 space-y-1">
                <input_1.Input placeholder="Tên bằng cấp (VD: Bằng cử nhân)" value={newQualName} onChange={(e) => setNewQualName(e.target.value)} disabled={isPending || qualUploadPending} className="text-sm"/>
              </div>
              <div className="flex-1 space-y-1">
                <input_1.Input ref={qualFileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={isPending || qualUploadPending} className="text-sm cursor-pointer" onChange={(e) => setNewQualFile(e.target.files?.[0] ?? null)}/>
              </div>
              <button_1.Button type="button" variant="outline" size="sm" onClick={() => void addQualification()} disabled={isPending || qualUploadPending || !newQualName.trim() || !newQualFile} className="flex-shrink-0 w-full sm:w-auto">
                {qualUploadPending ? (<span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>) : (<lucide_react_1.Plus className="w-4 h-4"/>)}
              </button_1.Button>
            </div>
          </div>
        </>)}

      <button_1.Button type="submit" className="w-full py-6 rounded-full shadow-lg shadow-primary/25 text-base font-bold hover:-translate-y-0.5 transition-transform" disabled={isPending}>
        {isPending ? "Đang tạo tài khoản..." : "Tạo tài khoản mới"}
      </button_1.Button>
    </form>);
};
const RegisterScreen = () => {
    const step = (0, auth_flow_store_1.useAuthFlowStore)((state) => state.step);
    return (<div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          {step === "INPUT_EMAIL" && "Tạo Tài Khoản"}
          {step === "VERIFY_OTP" && "Xác Thực Email"}
          {step === "INPUT_DETAILS" && "Thiết Lập Mật Khẩu"}
        </h2>
        <p className="mt-1.5 text-sm font-medium text-muted-foreground">
          {step === "INPUT_EMAIL" && "Bước 1/3: Chọn phương thức đăng ký"}
          {step === "VERIFY_OTP" && "Bước 2/3: Xác minh danh tính"}
          {step === "INPUT_DETAILS" && "Bước 3/3: Hoàn tất hồ sơ"}
        </p>
      </div>

      {step === "INPUT_EMAIL" && <EmailStep />}
      {step === "VERIFY_OTP" && <OtpStep />}
      {step === "INPUT_DETAILS" && <DetailsStep />}
    </div>);
};
exports.RegisterScreen = RegisterScreen;
//# sourceMappingURL=RegisterScreen.js.map