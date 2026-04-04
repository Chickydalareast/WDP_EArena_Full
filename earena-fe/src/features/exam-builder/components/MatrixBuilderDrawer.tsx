'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { rhfZodResolver as zodResolver } from '@/shared/lib/rhf-zod-resolver';
import { Loader2, Zap, LibrarySquare, Settings2 } from 'lucide-react';
import { toast } from 'sonner';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/shared/components/ui/sheet';
import { Form, FormField, FormItem, FormControl, FormMessage, FormLabel } from '@/shared/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Button } from '@/shared/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';

import { FillFromMatrixFormSchema, FillFromMatrixFormValues, FillFromMatrixDTO } from '../types/exam.schema';
import { useFillFromMatrix } from '../hooks/useFillFromMatrix';
import { useExamMatrices } from '../hooks/useExamMatrices';
import { useFoldersList } from '../hooks/useFolders';
import { useTopicsTree } from '../hooks/useTopics';

import { MatrixAdHocBuilder } from './MatrixAdHocBuilder';

interface MatrixBuilderDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    paperId: string;
    subjectId: string; // Truyền từ vỏ đề xuống
}

export function MatrixBuilderDrawer({ isOpen, onClose, paperId, subjectId }: MatrixBuilderDrawerProps) {
    const { mutate: fillMatrix, isPending: isSubmitting } = useFillFromMatrix(paperId);

    const form = useForm<FillFromMatrixFormValues>({
        resolver: zodResolver(FillFromMatrixFormSchema),
        defaultValues: {
            mode: 'ADHOC', // Tab mặc định
            adHocSections: [
                { name: 'Phần 1', orderIndex: 0, rules: [{ limit: 10, folderIds: [], topicIds: [], difficulties: [], tags: [] }] }
            ],
        },
    });

    // [CTO FIX]: Lấy danh sách lỗi hiện tại của form
    const { errors } = form.formState; 
    const hasErrors = Object.keys(errors).length > 0;

    const currentMode = form.watch('mode');

    const { data: matricesData, isLoading: isLoadingMatrices } = useExamMatrices(subjectId);
    const { data: folders = [] } = useFoldersList();
    const { data: topics = [] } = useTopicsTree(subjectId);

    useEffect(() => {
        form.clearErrors();
    }, [currentMode, form]);

    const onSubmit = (values: FillFromMatrixFormValues) => {
        let payload: FillFromMatrixDTO;

        if (values.mode === 'TEMPLATE') {
            payload = { matrixId: values.matrixId };
        } else {
            payload = { adHocSections: values.adHocSections };
        }

        fillMatrix(payload, {
            onSuccess: () => {
                onClose();
                // Không gọi invalidate query ở đây vì hook useFillFromMatrix đã làm việc đó In-place.
            },
            onError: (error: any) => {
                // [CTO FIX]: Bắn trực tiếp Toast lỗi để Giáo viên thấy ngay lập tức
                toast.error('Sinh đề thất bại', { 
                    description: error.message || 'Ngân hàng không đủ dữ liệu.' 
                });
            }
        });
    };

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !isSubmitting && !open && onClose()}>
            <SheetContent side="right" className="w-full sm:max-w-4xl p-0 flex flex-col bg-slate-50 sm:max-w-[80vw]">

                {/* Full-screen Loading Overlay chống Race Condition */}
                {isSubmitting && (
                    <div className="absolute inset-0 z-50 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center">
                        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
                        <h3 className="text-xl font-bold text-slate-800">Hệ thống đang bốc câu hỏi...</h3>
                        <p className="text-slate-500 font-medium">Vui lòng không tắt trình duyệt (Khoảng 2-5 giây)</p>
                    </div>
                )}

                <SheetHeader className="px-6 py-4 bg-white border-b shrink-0 shadow-sm">
                    <SheetTitle className="text-xl flex items-center"><Zap className="w-5 h-5 text-amber-500 mr-2" /> Đắp câu hỏi từ Ma trận</SheetTitle>
                    <SheetDescription>
                        Hệ thống sẽ tự động bốc câu hỏi và nhồi nối tiếp vào cuối đề thi hiện tại.
                    </SheetDescription>
                </SheetHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 overflow-hidden flex flex-col">

                        <div className="flex-1 overflow-y-auto p-6">
                            <Tabs
                                value={currentMode}
                                onValueChange={(val) => form.setValue('mode', val as 'TEMPLATE' | 'ADHOC')}
                                className="w-full"
                            >
                                <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
                                    <TabsTrigger value="TEMPLATE" disabled={isSubmitting} className="font-bold"><LibrarySquare className="w-4 h-4 mr-2" /> Khuôn mẫu lưu sẵn</TabsTrigger>
                                    <TabsTrigger value="ADHOC" disabled={isSubmitting} className="font-bold"><Settings2 className="w-4 h-4 mr-2" /> Tự cấu hình nhanh</TabsTrigger>
                                </TabsList>

                                <TabsContent value="TEMPLATE" className="mt-0 space-y-4">
                                    <div className="bg-white p-6 border rounded-xl shadow-sm">
                                        <FormField
                                            control={form.control}
                                            name="matrixId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="font-bold">Chọn Khuôn mẫu Ma trận</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value || ''} disabled={isSubmitting || isLoadingMatrices}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-12">
                                                                <SelectValue placeholder={isLoadingMatrices ? "Đang tải khuôn mẫu..." : "--- Vui lòng chọn ---"} />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {matricesData?.items?.map((matrix: any) => (
                                                                <SelectItem key={matrix._id} value={matrix._id}>{matrix.title}</SelectItem>
                                                            ))}
                                                            {matricesData?.items?.length === 0 && <SelectItem value="empty" disabled>Bạn chưa lưu khuôn mẫu nào</SelectItem>}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </TabsContent>

                                <TabsContent value="ADHOC" className="mt-0">
                                    {/* [CTO FIX]: Bắt buộc phải truyền paperId xuống để API Preview có ID đề thi mà chạy */}
                                    <MatrixAdHocBuilder 
                                        paperId={paperId} 
                                        folders={folders} 
                                        topics={topics} 
                                        disabled={isSubmitting} 
                                    />
                                </TabsContent>
                            </Tabs>
                        </div>

                        <div className="bg-white border-t px-6 py-4 flex justify-end gap-3 shrink-0 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
                            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>Hủy bỏ</Button>
                            {/* [CTO FIX]: Disable nút nếu API đang chạy HOẶC form đang có lỗi (bị đỏ) */}
                            <Button 
                                type="submit" 
                                className="bg-blue-600 hover:bg-blue-700 shadow-md font-bold px-8" 
                                disabled={isSubmitting || hasErrors}
                            >
                                <Zap className="w-4 h-4 mr-2" /> Thực thi đắp câu hỏi
                            </Button>
                        </div>

                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    );
}