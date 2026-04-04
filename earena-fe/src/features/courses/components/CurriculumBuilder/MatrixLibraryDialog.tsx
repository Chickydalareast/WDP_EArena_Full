'use client';

import React, { useState } from 'react';
import { Search, Loader2, Library, CopyCheck, AlertCircle, Box } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { useQuizMatricesList } from '../../hooks/useQuizQueries';
import { courseService } from '../../api/course.service';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { toast } from 'sonner';

interface MatrixLibraryDialogProps {
    isOpen: boolean;
    onClose: () => void;
    courseId: string;
    onApply: (sections: any[]) => void;
}

export function MatrixLibraryDialog({ isOpen, onClose, courseId, onApply }: MatrixLibraryDialogProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isFetchingDetail, setIsFetchingDetail] = useState(false);
    const debouncedSearch = useDebounce(searchTerm, 500);

    const { data: response, isFetching: isLoadingList, isError } = useQuizMatricesList({
        courseId, page: 1, limit: 10, search: debouncedSearch
    });

    const rawData = response as any;
    const items = Array.isArray(rawData) 
        ? rawData 
        : Array.isArray(rawData?.data) 
            ? rawData.data 
            : Array.isArray(rawData?.data?.data) 
                ? rawData.data.data 
                : [];

    const handleSelect = async (matrixId: string) => {
        setIsFetchingDetail(true);
        try {
            const res = await courseService.getExamMatrixDetail(matrixId);
            
            const rawDetail = res as any;
            const fullMatrix = rawDetail?.data?.data || rawDetail?.data || rawDetail;
            
            if (!fullMatrix?.sections || fullMatrix.sections.length === 0) {
                throw new Error("Khuôn mẫu này không có dữ liệu cấu trúc đề.");
            }

            // [CTO FIX]: Whitelist Sanitization (Lọc Trắng)
            // Tuyệt đối không dùng spread (...r) để tránh mang theo null và _id rác vào RHF
            const cleanedSections = fullMatrix.sections.map((s: any, sIndex: number) => ({
                name: s.name || `Phần ${sIndex + 1}`,
                orderIndex: s.orderIndex || sIndex,
                rules: s.rules.map((r: any) => {
                    const questionType = r.questionType || 'FLAT';
                    
                    const cleanRule: any = {
                        questionType,
                        limit: typeof r.limit === 'number' ? r.limit : 1,
                        // Đảm bảo các mảng không bao giờ là null
                        folderIds: Array.isArray(r.folderIds) ? r.folderIds : [],
                        topicIds: Array.isArray(r.topicIds) ? r.topicIds : [],
                        difficulties: Array.isArray(r.difficulties) ? r.difficulties : [],
                        tags: Array.isArray(r.tags) ? r.tags : [],
                    };

                    // Diệt tận gốc lỗi subQuestionLimit: null
                    if (questionType === 'PASSAGE' && typeof r.subQuestionLimit === 'number') {
                        cleanRule.subQuestionLimit = r.subQuestionLimit;
                    }
                    // Nếu là FLAT hoặc BE trả null, field này đơn giản là bị bỏ qua (tương đương undefined trong Zod)

                    return cleanRule;
                })
            }));

            onApply(cleanedSections);
            toast.success("Đã tải cấu trúc từ Khuôn mẫu!");
            onClose();
        } catch (error: any) {
            toast.error("Lỗi khi tải chi tiết khuôn mẫu", { description: error.message });
        } finally {
            setIsFetchingDetail(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !isFetchingDetail && onClose()}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col p-0 border-none shadow-xl">
                <DialogHeader className="px-6 py-4 border-b bg-white">
                    <DialogTitle className="flex items-center gap-2 text-slate-900 font-extrabold tracking-tight">
                        <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                            <Library className="w-5 h-5" />
                        </div>
                        Thư viện Khuôn mẫu bốc đề
                    </DialogTitle>
                </DialogHeader>

                <div className="p-4 space-y-4 flex-1 overflow-hidden flex flex-col bg-slate-50/50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                            placeholder="Tìm kiếm theo tên khuôn mẫu..." 
                            className="pl-9 bg-white border-slate-200 focus-visible:ring-primary/50" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 relative">
                        {isError ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-red-500 bg-red-50/50 rounded-xl border border-red-100">
                                <AlertCircle className="w-10 h-10 mb-2 opacity-50" />
                                <p className="text-sm font-medium">Lỗi kết nối. Không thể tải danh sách.</p>
                            </div>
                        ) : isLoadingList && items.length === 0 ? (
                            <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                        ) : items.length === 0 ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-slate-50/50 rounded-xl border border-dashed">
                                <Box className="w-10 h-10 mb-2 opacity-50" />
                                <p className="text-sm font-medium">Không tìm thấy khuôn mẫu nào</p>
                            </div>
                        ) : (
                            items.map((item: any) => (
                                <div 
                                    key={item._id || item.id}
                                    className="p-4 rounded-xl border bg-white hover:border-primary/40 hover:bg-primary/5 transition-all group cursor-pointer flex justify-between items-center shadow-sm"
                                    onClick={() => !isFetchingDetail && handleSelect(item._id || item.id)}
                                >
                                    <div className="space-y-1">
                                        <h4 className="font-bold text-slate-800 group-hover:text-primary transition-colors">{item.title}</h4>
                                        <p className="text-xs text-muted-foreground line-clamp-1">{item.description || 'Không có mô tả'}</p>
                                    </div>
                                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 text-primary font-bold text-xs bg-primary/10 hover:bg-primary/20">
                                        Sử dụng <CopyCheck className="w-3 h-3 ml-1" />
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {isFetchingDetail && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 rounded-lg">
                        <Loader2 className="w-10 h-10 animate-spin text-primary mb-2" />
                        <p className="text-sm font-bold text-slate-800">Đang bóc tách cấu trúc Khuôn mẫu...</p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}