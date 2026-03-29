'use client';

import React from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, Trash2 } from 'lucide-react';

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

import { GenerateExamFormSchema, GenerateExamFormValues } from '../types/exam.schema';
import { useSession } from '@/features/auth/hooks/useSession';
import { useFoldersList } from '../hooks/useFolders';
import { useTopicsTree } from '../hooks/useTopics';
import { useGenerateExam } from '../hooks/useGenerateExam';

export function GenerateExamModal({ onClose }: { onClose: () => void }) {
    const { user } = useSession();
    const { data: folders = [] } = useFoldersList();
    const { mutate: generateExam, isPending } = useGenerateExam();

    const form = useForm<GenerateExamFormValues>({
        resolver: zodResolver(GenerateExamFormSchema),
        defaultValues: {
            title: '',
            duration: 90,
            totalScore: 10,
            subjectId: user?.subjectIds?.[0] || '',
            criteria: [
                { folderIds: [], topicId: '', difficulty: 'NB', limit: 1 },
            ],
        },
    });

    const selectedSubjectId = useWatch({ control: form.control, name: 'subjectId' });
    const { data: topics = [], isLoading: isTopicsLoading } = useTopicsTree(selectedSubjectId);

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'criteria',
    });

    const onSubmit = (values: GenerateExamFormValues) => {
        const { subjectId, ...dtoPayload } = values;
        generateExam(dtoPayload, {
            onSuccess: () => onClose(),
        });
    };

    if (!user?.subjectIds?.length) {
        return (
            <div className="p-6 text-center text-red-500">
                Bạn chưa được gán bộ môn nào. Vui lòng liên hệ Admin.
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-h-[80vh] overflow-y-auto p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem className="col-span-2">
                                <FormLabel>Tên Đề Thi</FormLabel>
                                <FormControl><Input placeholder="VD: Khảo sát Toán 12..." {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Thời gian làm bài (Phút)</FormLabel>
                                <FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
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
                                <FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* CHỌN MÔN HỌC ĐỂ LỌC CHUYÊN ĐỀ */}
                <FormField
                    control={form.control}
                    name="subjectId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Môn học (Dùng để lọc chuyên đề)</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger><SelectValue placeholder="Chọn môn học" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {user.subjectIds?.map(id => (
                                        <SelectItem key={id} value={id}>Môn học {id}</SelectItem> // Tạm thời hiển thị ID nếu DB chưa lưu tên Subject trong mảng này
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* MA TRẬN ĐỀ (DYNAMIC FORM) */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                        <h3 className="font-bold text-lg text-slate-800">Cấu hình Ma trận sinh đề</h3>
                        <Button type="button" variant="outline" size="sm" onClick={() => append({ folderIds: [], topicId: '', difficulty: 'NB', limit: 1 })}>
                            <Plus className="w-4 h-4 mr-2" /> Thêm tiêu chí
                        </Button>
                    </div>

                    {fields.map((fieldItem, index) => (
                        <div key={fieldItem.id} className="grid grid-cols-12 gap-3 items-start border p-4 rounded-xl bg-slate-50 relative">

                            {/* CỘT 1: THƯ MỤC NGUỒN (MULTIPLE) */}
                            <div className="col-span-3">
                                <FormField
                                    control={form.control}
                                    name={`criteria.${index}.folderIds`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs">Thư mục nguồn</FormLabel>
                                            {/* Giả định bạn đã có Component MultiSelect cho Shadcn UI. 
                          Nếu chưa có, ta tạm dùng native select multiple hoặc 1 thẻ Select bình thường để xử lý mảng */}
                                            <FormControl>
                                                <select multiple className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    value={field.value} onChange={(e) => field.onChange(Array.from(e.target.selectedOptions, option => option.value))}
                                                >
                                                    {folders.map(f => (
                                                        <option key={f.id} value={f.id}>{f.name}</option>
                                                    ))}
                                                </select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* CỘT 2: CHUYÊN ĐỀ */}
                            <div className="col-span-4">
                                <FormField
                                    control={form.control}
                                    name={`criteria.${index}.topicId`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs">Chuyên đề {isTopicsLoading && <Loader2 className="inline w-3 h-3 animate-spin ml-1" />}</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
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
                            <div className="col-span-2">
                                <FormField
                                    control={form.control}
                                    name={`criteria.${index}.difficulty`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs">Độ khó</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
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
                            <div className="col-span-2">
                                <FormField
                                    control={form.control}
                                    name={`criteria.${index}.limit`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs">SL Câu</FormLabel>
                                            <FormControl><Input type="number" min="1" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* CỘT 5: ACTION */}
                            <div className="col-span-1 flex flex-col justify-end h-full pb-2">
                                <Button type="button" variant="destructive" size="icon" disabled={fields.length === 1} onClick={() => remove(index)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>

                        </div>
                    ))}
                </div>

                {/* FOOTER ACTIONS */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>Hủy</Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isPending}>
                        {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Tạo Đề Tự Động
                    </Button>
                </div>
            </form>
        </Form>
    );
}