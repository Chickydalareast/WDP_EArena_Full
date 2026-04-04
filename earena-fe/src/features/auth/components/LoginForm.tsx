'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { rhfZodResolver as zodResolver } from '@/shared/lib/rhf-zod-resolver';
import { z } from 'zod';
import { loginSchema, LoginDTO } from '../types/auth.schema';
import { useLogin } from '../hooks/useLogin';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'; 

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Checkbox } from '@/shared/components/ui/checkbox';

// Đã bỏ .default(false) để sửa lỗi mismatch type của Resolver
const loginFormSchema = loginSchema.extend({
  rememberMe: z.boolean(), 
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export const LoginForm = () => {
  const { mutate: executeLogin, isPending, isError, error } = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: '', password: '', rememberMe: false }, 
  });

  const onSubmit = (data: LoginFormValues) => {
    const { rememberMe, ...apiPayload } = data;
    executeLogin(apiPayload as LoginDTO); 
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
        
        {/* Email Field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold text-foreground">Email hoặc Số điện thoại</FormLabel>
              <FormControl>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input 
                    placeholder="Nhập email/SĐT của bạn" 
                    className="pl-11 py-6 bg-muted/30 rounded-xl"
                    disabled={isPending}
                    {...field} 
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password Field */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-center">
                <FormLabel className="font-semibold text-foreground">Mật khẩu</FormLabel>
                <Link href="/forgot-password" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                  Quên mật khẩu?
                </Link>
              </div>
              <FormControl>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input 
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••" 
                    className="pl-11 pr-12 py-6 bg-muted/30 rounded-xl"
                    disabled={isPending}
                    {...field} 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Real Remember Me Checkbox */}
        <FormField
          control={form.control}
          name="rememberMe"
          render={({ field }) => (
             <FormItem className="flex flex-row items-start space-x-2 space-y-0 mt-2">
              <FormControl>
                <Checkbox 
                  checked={field.value} 
                  onCheckedChange={field.onChange}
                  disabled={isPending}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-sm text-muted-foreground cursor-pointer">
                  Duy trì đăng nhập
                </FormLabel>
              </div>
            </FormItem>
          )}
        />

        {/* Error Handling */}
        {isError && (
          <div className="p-3 text-sm font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-xl">
            {error?.message || 'Thông tin đăng nhập không chính xác.'}
          </div>
        )}

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full py-6 rounded-full shadow-lg shadow-primary/25 text-base font-bold transition-transform hover:-translate-y-0.5" 
          disabled={isPending}
        >
          {isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
          {isPending ? 'Đang xác thực...' : 'Đăng nhập'}
        </Button>
      </form>
    </Form>
  );
};