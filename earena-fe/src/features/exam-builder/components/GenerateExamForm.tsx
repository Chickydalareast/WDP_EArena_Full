'use client';

import React from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { rhfZodResolver as zodResolver } from '@/shared/lib/rhf-zod-resolver';
import { Loader2, Plus, Trash2, Zap } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Checkbox } from '@/shared/components/ui/checkbox'; 
import { Label } from '@/shared/components/ui/label';

import { GenerateExamFormSchema, GenerateExamFormValues } from '../types/exam.schema';
import { useSession } from '@/features/auth/hooks/useSession';
import { useFoldersList } from '../hooks/useFolders';
import { useTopicsTree } from '../hooks/useTopics';
import { useGenerateExam } from '../hooks/useGenerateExam';

export function GenerateExamForm() {
  const { user } = useSession();
  const { data: folders = [] } = useFoldersList();
  const { mutate: generateExam, isPending } = useGenerateExam();

  // Khởi tạo State Form
  const form = useForm<GenerateExamFormValues>({
    resolver: zodResolver(GenerateExamFormSchema),
    defaultValues: {
      title: '',
      duration: 90,
      totalScore: 10,
      // Lấy ID của môn học đầu tiên làm mặc định
      subjectId: user?.subjects?.[0]?.id || '', 
      criteria: [
        { folderIds: [], topicId: '', difficulty: 'NB', limit: 1 },
      ],
    },
    mode: 'onTouched',
  });

  const selectedSubjectId = useWatch({ control: form.control, name: 'subjectId' });
  const { data: topics = [], isLoading: isTopicsLoading } = useTopicsTree(selectedSubjectId);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'criteria',
  });

  const onSubmit = (values: GenerateExamFormValues) => {
    const { subjectId, ...dtoPayload } = values; 
    generateExam(dtoPayload);
  };

  // Đánh chặn: Nếu chưa được phân môn
  if (!user?.subjects?.length) {
    return (
      <div className="p-8 text-center text-red-600 bg-red-50 border border-red-100 rounded-xl shadow-sm max-w-xl mx-auto">
        <h3 className="font-bold text-lg mb-2">Chưa gán bộ môn</h3>
        <p>Tài khoản của bạn chưa được thiết lập bộ môn giảng dạy. Vui lòng liên hệ Admin để cập nhật thông tin trước khi dùng tính năng Ma Trận.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          {/* BLOCK 1: THÔNG TIN CƠ BẢN */}
          <div className="p-5 bg-slate-50 border rounded-xl space-y-5">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm">1</span> 
              Thông tin Vỏ Đề
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="col-span-12 md:col-span-6">
                    <FormLabel>Tên Đề Thi</FormLabel>
                    <FormControl><Input placeholder="VD: Đề thi thử THPT Quốc Gia..." disabled={isPending} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="subjectId"
                render={({ field }) => (
                  <FormItem className="col-span-12 md:col-span-6">
                    <FormLabel>Môn học (Cố định)</FormLabel>
                    {/* KHÓA CỨNG DROPDOWN NÀY NHƯNG VẪN RENDER TÊN MÔN CHO GV THẤY */}
                    <Select onValueChange={field.onChange} value={field.value} disabled={true}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-100 opacity-100 cursor-not-allowed text-slate-700 font-medium">
                          <SelectValue placeholder="Chọn môn học" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {user.subjects?.map(subj => (
                          <SelectItem key={subj.id} value={subj.id}>{subj.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem className="col-span-6">
                    <FormLabel>Thời gian (Phút)</FormLabel>
                    <FormControl><Input type="number" disabled={isPending} {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="totalScore"
                render={({ field }) => (
                  <FormItem className="col-span-6">
                    <FormLabel>Tổng điểm</FormLabel>
                    <FormControl><Input type="number" disabled={isPending} {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* BLOCK 2: KHÔNG GIAN MA TRẬN */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
               <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm">2</span> 
                Cấu trúc Ma Trận
              </h3>
              <Button type="button" variant="outline" size="sm" disabled={isPending} onClick={() => append({ folderIds: [], topicId: '', difficulty: 'NB', limit: 1 })}>
                <Plus className="w-4 h-4 mr-2" /> Thêm Tiêu Chí
              </Button>
            </div>

            {fields.map((fieldItem, index) => (
              <div key={fieldItem.id} className="grid grid-cols-12 gap-5 items-start border p-5 rounded-xl bg-white shadow-sm relative transition-all hover:border-blue-300 group">
                
                {/* CỘT 1: THƯ MỤC NGUỒN (UX MỚI VỚI CHECKBOX) */}
                <div className="col-span-12 md:col-span-4">
                   <FormField
                    control={form.control}
                    name={`criteria.${index}.folderIds`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Thư mục nguồn</FormLabel>
                        {/* Box chứa list checkbox cuộn được */}
                        <div className="border rounded-md p-3 h-[120px] overflow-y-auto space-y-3 bg-slate-50/50 custom-scrollbar">
                          {folders.length === 0 ? (
                            <p className="text-xs text-slate-400 text-center mt-4">Không có thư mục nào</p>
                          ) : (
                            folders.map(f => (
                              <FormField
                                key={f.id}
                                control={form.control}
                                name={`criteria.${index}.folderIds`}
                                render={({ field: checkboxField }) => {
                                  return (
                                    <FormItem
                                      key={f.id}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          disabled={isPending}
                                          checked={checkboxField.value?.includes(f.id)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? checkboxField.onChange([...checkboxField.value, f.id])
                                              : checkboxField.onChange(
                                                  checkboxField.value?.filter(
                                                    (value: string) => value !== f.id
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal text-sm leading-none cursor-pointer">
                                        {f.name}
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-12 md:col-span-8 grid grid-cols-12 gap-4">
                  {/* CỘT 2: CHUYÊN ĐỀ */}
                  <div className="col-span-12 md:col-span-5">
                    <FormField
                      control={form.control}
                      name={`criteria.${index}.topicId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Chuyên đề {isTopicsLoading && <Loader2 className="inline w-3 h-3 animate-spin ml-1 text-blue-500"/>}
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} disabled={isPending}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Chọn chuyên đề" /></SelectTrigger></FormControl>
                            <SelectContent>
                              {topics.map(t => (
                                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* CỘT 3: ĐỘ KHÓ */}
                  <div className="col-span-6 md:col-span-4">
                    <FormField
                      control={form.control}
                      name={`criteria.${index}.difficulty`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mức độ</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} disabled={isPending}>
                            <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="NB">Nhận biết</SelectItem>
                              <SelectItem value="TH">Thông hiểu</SelectItem>
                              <SelectItem value="VD">Vận dụng</SelectItem>
                              <SelectItem value="VDC">Vận dụng cao</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* CỘT 4: SỐ LƯỢNG */}
                  <div className="col-span-4 md:col-span-2">
                    <FormField
                      control={form.control}
                      name={`criteria.${index}.limit`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Số câu</FormLabel>
                          <FormControl><Input type="number" min="1" disabled={isPending} {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* CỘT 5: ACTION XÓA */}
                  <div className="col-span-2 md:col-span-1 flex flex-col justify-end h-full pb-1">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="text-slate-400 hover:text-red-600 hover:bg-red-50 w-full" 
                      disabled={isPending || fields.length === 1} 
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

              </div>
            ))}
          </div>

          <Button 
            type="submit" 
            size="lg"
            className="w-full font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg text-white mt-8" 
            disabled={isPending}
          >
            {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Zap className="mr-2 h-5 w-5" />}
            {isPending ? 'Đang kích hoạt Matrix Engine...' : 'Kích hoạt Matrix Engine & Gen Đề'}
          </Button>
        </form>
      </Form>
    </div>
  );
}