'use client';

import { useForm as useRHForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginDTO } from '../types/auth.schema';
import { useLogin } from '../hooks/useLogin'; // Inject Custom Hook

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

export const LoginForm = () => {
  // 1. Kéo Logic từ Custom Hook
  const { mutate: executeLogin, isPending, isError, error } = useLogin();

  // 2. Khởi tạo Form State
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useRHForm<LoginDTO>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // 3. Render thuần túy
  return (
    <form 
      onSubmit={handleSubmit((data) => executeLogin(data))} 
      className="space-y-6 w-full max-w-md"
      noValidate // Tránh HTML5 validation đụng độ với Zod
    >
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="hvm@earena.edu.vn"
          disabled={isPending}
          autoComplete="email"
          {...register('email')}
          className={errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}
        />
        {errors.email && (
          <p className="text-sm font-medium text-red-500" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Mật khẩu</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          disabled={isPending}
          autoComplete="current-password"
          {...register('password')}
          className={errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}
        />
        {errors.password && (
          <p className="text-sm font-medium text-red-500" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>

      {isError && (
        <div 
          className="p-3 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md"
          role="alert"
        >
          {error?.message || 'Thông tin đăng nhập không chính xác.'}
        </div>
      )}

      <Button 
        type="submit" 
        className="w-full" 
        disabled={isPending}
        aria-disabled={isPending}
      >
        {isPending ? 'Đang xác thực...' : 'Đăng nhập'}
      </Button>
    </form>
  );
};