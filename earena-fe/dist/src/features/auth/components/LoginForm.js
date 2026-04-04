'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginForm = void 0;
const react_1 = require("react");
const react_hook_form_1 = require("react-hook-form");
const rhf_zod_resolver_1 = require("@/shared/lib/rhf-zod-resolver");
const zod_1 = require("zod");
const auth_schema_1 = require("../types/auth.schema");
const useLogin_1 = require("../hooks/useLogin");
const link_1 = __importDefault(require("next/link"));
const lucide_react_1 = require("lucide-react");
const form_1 = require("@/shared/components/ui/form");
const button_1 = require("@/shared/components/ui/button");
const input_1 = require("@/shared/components/ui/input");
const checkbox_1 = require("@/shared/components/ui/checkbox");
const loginFormSchema = auth_schema_1.loginSchema.extend({
    rememberMe: zod_1.z.boolean(),
});
const LoginForm = () => {
    const { mutate: executeLogin, isPending, isError, error } = (0, useLogin_1.useLogin)();
    const [showPassword, setShowPassword] = (0, react_1.useState)(false);
    const form = (0, react_hook_form_1.useForm)({
        resolver: (0, rhf_zod_resolver_1.rhfZodResolver)(loginFormSchema),
        defaultValues: { email: '', password: '', rememberMe: false },
    });
    const onSubmit = (data) => {
        const { rememberMe, ...apiPayload } = data;
        executeLogin(apiPayload);
    };
    return (<form_1.Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
        
        
        <form_1.FormField control={form.control} name="email" render={({ field }) => (<form_1.FormItem>
              <form_1.FormLabel className="font-semibold text-foreground">Email hoặc Số điện thoại</form_1.FormLabel>
              <form_1.FormControl>
                <div className="relative group">
                  <lucide_react_1.Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors"/>
                  <input_1.Input placeholder="Nhập email/SĐT của bạn" className="pl-11 py-6 bg-muted/30 rounded-xl" disabled={isPending} {...field}/>
                </div>
              </form_1.FormControl>
              <form_1.FormMessage />
            </form_1.FormItem>)}/>

        
        <form_1.FormField control={form.control} name="password" render={({ field }) => (<form_1.FormItem>
              <div className="flex justify-between items-center">
                <form_1.FormLabel className="font-semibold text-foreground">Mật khẩu</form_1.FormLabel>
                <link_1.default href="/forgot-password" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                  Quên mật khẩu?
                </link_1.default>
              </div>
              <form_1.FormControl>
                <div className="relative group">
                  <lucide_react_1.Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors"/>
                  <input_1.Input type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="pl-11 pr-12 py-6 bg-muted/30 rounded-xl" disabled={isPending} {...field}/>
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <lucide_react_1.EyeOff className="w-5 h-5"/> : <lucide_react_1.Eye className="w-5 h-5"/>}
                  </button>
                </div>
              </form_1.FormControl>
              <form_1.FormMessage />
            </form_1.FormItem>)}/>

        
        <form_1.FormField control={form.control} name="rememberMe" render={({ field }) => (<form_1.FormItem className="flex flex-row items-start space-x-2 space-y-0 mt-2">
              <form_1.FormControl>
                <checkbox_1.Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isPending}/>
              </form_1.FormControl>
              <div className="space-y-1 leading-none">
                <form_1.FormLabel className="text-sm text-muted-foreground cursor-pointer">
                  Duy trì đăng nhập
                </form_1.FormLabel>
              </div>
            </form_1.FormItem>)}/>

        
        {isError && (<div className="p-3 text-sm font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-xl">
            {error?.message || 'Thông tin đăng nhập không chính xác.'}
          </div>)}

        
        <button_1.Button type="submit" className="w-full py-6 rounded-full shadow-lg shadow-primary/25 text-base font-bold transition-transform hover:-translate-y-0.5" disabled={isPending}>
          {isPending ? <lucide_react_1.Loader2 className="w-5 h-5 animate-spin mr-2"/> : null}
          {isPending ? 'Đang xác thực...' : 'Đăng nhập'}
        </button_1.Button>
      </form>
    </form_1.Form>);
};
exports.LoginForm = LoginForm;
//# sourceMappingURL=LoginForm.js.map