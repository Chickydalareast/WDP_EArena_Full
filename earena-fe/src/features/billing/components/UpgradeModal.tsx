'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useUpgradeUIStore } from '../stores/upgrade-ui.store';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Crown, Sparkles } from 'lucide-react';

export function UpgradeModal() {
    const router = useRouter();
    const { isOpen, message, closeModal } = useUpgradeUIStore();

    const handleUpgradeClick = () => {
        closeModal();
        router.push('/pricing');
    };

    return (
        <Dialog open={isOpen} onOpenChange={closeModal}>
            <DialogContent className="sm:max-w-md text-center">
                <DialogHeader className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-2">
                        <Crown className="w-8 h-8 text-yellow-600" />
                    </div>
                    <DialogTitle className="text-2xl font-bold">Nâng Cấp Gói Cước</DialogTitle>
                    <DialogDescription className="text-base text-muted-foreground">
                        {message}
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 my-4 text-left">
                    <h4 className="font-semibold text-yellow-800 flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4" /> Đặc quyền gói PRO/ENTERPRISE
                    </h4>
                    <ul className="text-sm text-yellow-700 space-y-1.5 list-disc list-inside">
                        <li>Bán khóa học có thu phí (Premium Courses).</li>
                        <li>Không giới hạn số lượng khóa học xuất bản.</li>
                        <li>Được hỗ trợ Marketing từ nền tảng.</li>
                    </ul>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button variant="outline" className="w-full sm:w-auto" onClick={closeModal}>
                        Để sau
                    </Button>
                    <Button
                        className="w-full sm:w-auto bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold border-0 shadow-md transition-transform active:scale-95"
                        onClick={handleUpgradeClick}
                    >
                        Nâng cấp ngay
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}