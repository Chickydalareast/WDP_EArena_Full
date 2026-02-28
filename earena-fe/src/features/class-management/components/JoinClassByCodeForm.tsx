'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LogIn, Loader2 } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/shared/components/ui/form';

import { JoinClassByCodeSchema, JoinClassByCodeDTO } from '../types/class.schema';
import { useJoinByCode } from '../hooks/useJoinByCode';

export function JoinClassByCodeForm() {
  const { mutate: joinClass, isPending } = useJoinByCode();

  const form = useForm<JoinClassByCodeDTO>({
    resolver: zodResolver(JoinClassByCodeSchema),
    defaultValues: { code: '' },
  });

  const onSubmit = (data: JoinClassByCodeDTO) => {
    joinClass(data, {
      onSuccess: () => form.reset(),
    });
  };

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-100 dark:border-blue-900 rounded-xl shadow-sm">
      <div className="mb-4 space-y-1">
        <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2">
          <LogIn className="w-5 h-5" /> Tham gia bằng Mã Lớp
        </h3>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Nhập mã code (6 ký tự) do giáo viên cung cấp để vào lớp ngay lập tức.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-3">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input 
                    placeholder="VD: MATH12" 
                    className="uppercase font-mono font-bold tracking-widest text-lg h-12" 
                    maxLength={6}
                    disabled={isPending} 
                    {...field} 
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" size="lg" className="h-12 px-8" disabled={isPending}>
            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Tham gia'}
          </Button>
        </form>
      </Form>
    </div>
  );
}