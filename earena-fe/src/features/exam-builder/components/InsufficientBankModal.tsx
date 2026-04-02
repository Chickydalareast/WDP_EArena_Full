'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { useMatrixErrorStore } from '@/features/exam-taking/stores/matrix-error.store';

export function InsufficientBankModal() {
    const { isOpen, errorMessage, closeError } = useMatrixErrorStore();

    return (
        <Dialog open={isOpen} onOpenChange={closeError}>
            <DialogContent className="sm:max-w-md border-red-200 bg-white">
                <DialogHeader className="flex flex-col items-center text-center sm:text-center">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <DialogTitle className="text-xl font-bold text-slate-800">
                        Sinh đề thất bại
                    </DialogTitle>
                    <DialogDescription className="text-base text-slate-600 mt-2 font-medium">
                        {errorMessage || 'Ngân hàng không đủ dữ liệu. Vui lòng kiểm tra lại số lượng hoặc cấu hình ma trận.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg mt-2 text-sm text-amber-800">
                    <strong>Gợi ý:</strong> Bạn cần bổ sung thêm câu hỏi vào Ngân hàng, hoặc giảm chỉ tiêu số lượng (Limit) trong cấu trúc Form vừa tạo.
                </div>

                <DialogFooter className="sm:justify-center mt-4">
                    <Button
                        type="button"
                        variant="default"
                        onClick={closeError}
                        className="bg-red-600 hover:bg-red-700 text-white px-8"
                    >
                        Đã hiểu
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}