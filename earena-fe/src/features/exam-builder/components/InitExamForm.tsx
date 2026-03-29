'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { InitExamSchema, InitExamDTO } from '../types/exam.schema';
import { useInitExam } from '../hooks/useInitExam';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Button } from '@/shared/components/ui/button';
import { Loader2 } from 'lucide-react';

export function InitExamForm() {
  const { mutate: initExam, isPending } = useInitExam();

  const form = useForm<InitExamDTO>({
    resolver: zodResolver(InitExamSchema),
    defaultValues: {
      title: '',
      description: '',
      duration: 15,
      totalScore: 10,
    },
    mode: 'onTouched', 
  });

  const onSubmit = (data: InitExamDTO) => {
    initExam(data);
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
      <h2 className="text-2xl font-black text-slate-800 mb-6 border-b pb-4">
        Khởi tạo Vỏ Đề Thi
      </h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tiêu đề đề thi (*)</FormLabel>
                <FormControl>
                  <Input disabled={isPending} placeholder="VD: Kiểm tra 15p Toán 12..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thời gian làm bài (Phút)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      disabled={isPending} 
                      {...field} 
                      onChange={e => field.onChange(Number(e.target.value))} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="totalScore"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tổng điểm</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      disabled={isPending} 
                      {...field} 
                      onChange={e => field.onChange(Number(e.target.value))} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mô tả thêm (Tùy chọn)</FormLabel>
                <FormControl>
                  <Textarea disabled={isPending} placeholder="Ghi chú nội bộ..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full font-bold" 
            disabled={isPending || !form.formState.isValid}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? 'Đang khởi tạo...' : 'Tạo Vỏ Đề Thi'}
          </Button>
        </form>
      </Form>
    </div>
  );
}