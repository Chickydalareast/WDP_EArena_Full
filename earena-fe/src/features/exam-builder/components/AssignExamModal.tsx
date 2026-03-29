'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { CalendarClock, Wrench } from 'lucide-react';

interface AssignExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialExamId?: string;
  initialClassIds?: string[];
}

export function AssignExamModal({ isOpen, onClose }: AssignExamModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-border rounded-xl">
        <div className="bg-muted/30 p-6 border-b border-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-primary" />
              Giao Bài Tập / Đề Thi
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-1">
              Thông báo cập nhật hệ thống
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-8 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
            <Wrench size={32} />
          </div>
          <h3 className="font-bold text-lg text-foreground">Tính năng đang bảo trì</h3>
          <p className="text-sm text-muted-foreground">
            Luồng giao bài đang được cấu trúc lại để tích hợp hoàn toàn vào hệ thống <strong>Khóa Học (Course)</strong>. Bạn sẽ sớm có thể giao bài trực tiếp trong từng khóa học!
          </p>
        </div>

        <div className="p-4 border-t border-border flex justify-end bg-muted/10">
          <Button onClick={onClose} className="font-bold">
            Đã hiểu
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}