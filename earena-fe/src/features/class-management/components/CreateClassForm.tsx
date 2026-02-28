'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Copy, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';

import { CreateClassSchema, CreateClassDTO } from '../types/class.schema';
import { useCreateClass } from '../hooks/useCreateClass';

export function CreateClassForm() {
  const { mutate: createClass, isPending } = useCreateClass();
  
  // State quản lý việc hiển thị màn hình Success chứa Mã Code
  const [createdCode, setCreatedCode] = useState<string | null>(null);

  // Khởi tạo React Hook Form với Zod Resolver
  const form = useForm<CreateClassDTO>({
    resolver: zodResolver(CreateClassSchema),
    defaultValues: {
      name: '',
      description: '',
      isPublic: true,
    },
  });

  const onSubmit = (data: CreateClassDTO) => {
    createClass(data, {
      onSuccess: (response) => {
        if (response?.code) {
          setCreatedCode(response.code);
          toast.success('Tạo lớp học thành công!');
        } else {
          toast.error('Tạo thành công nhưng Backend không trả về mã Code.');
          console.error('Missing code in response:', response);
        }
      },
    });
  };
  const copyToClipboard = async () => {
    if (!createdCode) return;
    try {
      await navigator.clipboard.writeText(createdCode);
      toast.success('Đã sao chép mã lớp vào khay nhớ tạm!');
    } catch (err) {
      toast.error('Lỗi khi sao chép mã lớp.');
    }
  };

  const handleReset = () => {
    setCreatedCode(null);
    form.reset();
  };

  // =======================================================================
  // VIEW 1: MÀN HÌNH THÀNH CÔNG (HIỂN THỊ MÃ CODE CHO GIÁO VIÊN)
  // =======================================================================
  if (createdCode) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-6 bg-green-50/50 dark:bg-green-950/20 rounded-xl border border-green-200 dark:border-green-900 animate-in fade-in zoom-in duration-300">
        <CheckCircle2 className="w-16 h-16 text-green-500" />
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-foreground">Tạo lớp học thành công!</h3>
          <p className="text-muted-foreground">
            Hãy gửi mã code này cho học sinh để các em tham gia lớp học.
          </p>
        </div>
        
        <div className="flex items-center gap-3 p-4 bg-background border rounded-lg shadow-sm">
          <span className="text-3xl font-mono font-black tracking-widest text-primary">
            {createdCode}
          </span>
          <Button onClick={copyToClipboard} variant="outline" size="icon" className="shrink-0">
            <Copy className="w-4 h-4" />
          </Button>
        </div>

        <Button onClick={handleReset} variant="default" className="w-full max-w-sm mt-4">
          Tạo thêm lớp khác
        </Button>
      </div>
    );
  }

  // =======================================================================
  // VIEW 2: MÀN HÌNH FORM NHẬP LIỆU
  // =======================================================================
  return (
    <div className="p-6 bg-card border rounded-xl shadow-sm">
      <div className="mb-6 space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Tạo lớp học mới</h2>
        <p className="text-sm text-muted-foreground">
          Điền thông tin cơ bản để khởi tạo không gian học tập.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
               <FormItem>
                 <FormLabel>Tên lớp học <span className="text-destructive">*</span></FormLabel>
                 <FormControl>
                   <Input placeholder="VD: Toán 12 - Thầy John" {...field} disabled={isPending} />
                 </FormControl>
                 <FormMessage />
               </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
               <FormItem>
                 <FormLabel>Mô tả (Tùy chọn)</FormLabel>
                 <FormControl>
                   <Input placeholder="Nhập mô tả ngắn gọn về lớp học..." {...field} disabled={isPending} />
                 </FormControl>
                 <FormMessage />
               </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isPublic"
            render={({ field }) => (
               <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                 <div className="space-y-0.5">
                   <FormLabel className="text-base">Hiển thị công khai</FormLabel>
                   <FormDescription>
                     Học sinh có thể tìm thấy lớp này qua thanh tìm kiếm.
                   </FormDescription>
                 </div>
                 <FormControl>
                   {/* Giả định bạn có component Switch/Checkbox trong thư mục ui. 
                       Nếu dùng Checkbox mặc định của HTML thì dùng: */}
                   <input 
                     type="checkbox" 
                     className="w-5 h-5 accent-primary" 
                     checked={field.value} 
                     onChange={field.onChange}
                     disabled={isPending}
                   />
                 </FormControl>
               </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang khởi tạo...
              </>
            ) : (
              'Tạo lớp học'
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}