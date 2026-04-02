'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { InitExamSchema, InitExamDTO } from '../types/exam.schema';
import { useInitExam } from '../hooks/useInitExam';
import { useSession } from '@/features/auth/hooks/useSession';

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Loader2, AlertTriangle } from 'lucide-react';

export function InitExamForm() {
  const { user } = useSession();
  const { mutate: initExam, isPending } = useInitExam();

  const form = useForm<InitExamDTO>({
    resolver: zodResolver(InitExamSchema),
    defaultValues: {
      title: '',
      description: '',
      totalScore: 10,
      subjectId: '',
    },
    mode: 'onTouched',
  });

  useEffect(() => {
    if (user?.subjects && user.subjects.length > 0) {
      form.setValue('subjectId', user.subjects[0].id, { shouldValidate: true });
    }
  }, [user?.subjects, form]);

  const onSubmit = (data: InitExamDTO) => {
    initExam(data);
  };

  if (user && (!user.subjects || user.subjects.length === 0)) {
    return (
      <div className="max-w-xl mx-auto p-8 text-center text-amber-800 bg-amber-50 border border-amber-200 rounded-xl shadow-sm">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-amber-500" />
        <h3 className="font-bold text-lg mb-2">Tài khoản chưa được gán bộ môn</h3>
        <p className="text-sm">Bạn cần được Admin cấp quyền giảng dạy một môn học cụ thể (Toán, Lý, Hóa...) trước khi có thể khởi tạo đề thi. Vui lòng liên hệ Quản trị viên.</p>
      </div>
    );
  }

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
              name="subjectId"
              render={({ field }) => {
                const selectedSubjectName = user?.subjects?.find(s => s.id === field.value)?.name || 'Đang tải môn học...';

                return (
                  <FormItem>
                    <FormLabel>Môn học (Cố định)</FormLabel>
                    <FormControl>
                      <Input
                        value={selectedSubjectName}
                        disabled
                        className="bg-slate-100 opacity-100 font-bold text-blue-700 border-slate-200 cursor-not-allowed"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
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
            className="w-full font-bold bg-blue-600 hover:bg-blue-700 text-white"
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