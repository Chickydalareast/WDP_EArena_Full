'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { rhfZodResolver as zodResolver } from '@/shared/lib/rhf-zod-resolver';
import * as z from 'zod';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { Input } from '@/shared/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/shared/components/ui/form';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

const ManualQuestionSchema = z.object({
  content: z.string().min(5, 'Nội dung câu hỏi quá ngắn'),
  answers: z.array(
    z.object({
      id: z.string(),
      content: z.string().min(1, 'Đáp án không được trống'),
    })
  ).length(4),
  correctAnswerId: z.string().min(1, 'Bắt buộc chọn 1 đáp án đúng'),
});

export type OmitFolderIdDTO = z.infer<typeof ManualQuestionSchema>;

interface ManualQuestionFormProps {
  onSave: (data: OmitFolderIdDTO) => void;
  isPending?: boolean;
  onCancel: () => void;
}

export function ManualQuestionForm({ onSave, isPending, onCancel }: ManualQuestionFormProps) {
  const form = useForm<OmitFolderIdDTO>({
    resolver: zodResolver(ManualQuestionSchema),
    defaultValues: {
      content: '',
      answers: [
        { id: 'A', content: '' }, { id: 'B', content: '' },
        { id: 'C', content: '' }, { id: 'D', content: '' },
      ],
      correctAnswerId: '',
    },
  });

  const { fields } = useFieldArray({ control: form.control, name: 'answers' });

  return (
    <div className="bg-white border-2 border-blue-200 shadow-md rounded-2xl p-6 relative">
      <div className="mb-4 pb-4 border-b">
        <h3 className="text-lg font-bold text-slate-800">Tạo câu hỏi thủ công</h3>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea placeholder="Nội dung câu hỏi..." className="min-h-[100px]" disabled={isPending} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-3">
            {fields.map((field, index) => {
              // ÉP CỨNG: Dùng index để lấy A, B, C, D thay vì dùng field.id của thư viện
              const letter = ['A', 'B', 'C', 'D'][index]; 
              const isCorrect = form.watch('correctAnswerId') === letter;

              return (
                <div key={field.id} className="flex items-start gap-3">
                  <button
                    type="button"
                    disabled={isPending}
                    // Lưu thẳng chữ A, B, C, D vào state
                    onClick={() => form.setValue('correctAnswerId', letter, { shouldValidate: true })}
                    className={`mt-1 flex-shrink-0 ${isCorrect ? 'text-green-500' : 'text-slate-300'}`}
                  >
                    {isCorrect ? <CheckCircle2 className="w-8 h-8" /> : <Circle className="w-8 h-8" />}
                  </button>
                  <div className="flex-1">
                    <FormField
                      control={form.control}
                      name={`answers.${index}.content`}
                      render={({ field: inputField }) => (
                        <FormItem>
                          <FormControl>
                            {/* Ép cứng placeholder */}
                            <Input placeholder={`Phương án ${letter}...`} disabled={isPending} {...inputField} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>Hủy</Button>
            <Button type="submit" className="bg-blue-600 font-bold hover:bg-blue-700" disabled={isPending}>
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Lưu & Thêm vào đề
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}