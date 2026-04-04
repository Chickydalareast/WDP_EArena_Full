'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { ROUTES } from '@/config/routes';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { RichTextEditor } from '@/shared/components/ui/rich-text-editor';
import { createCommunityPost } from '../api/community-api';
import { CommunityAttachmentPicker } from './CommunityAttachmentPicker';
import type { CommunityAttachment } from './PostAttachmentsDisplay';
import { toast } from 'sonner';
import { Share2 } from 'lucide-react';

export function ShareCourseToCommunityButton({
  courseId,
  subjectId,
  variant = 'outline',
}: {
  courseId: string;
  subjectId?: string;
  variant?: 'default' | 'outline' | 'secondary';
}) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState('');
  const [attachments, setAttachments] = useState<CommunityAttachment[]>([]);

  const submit = async () => {
    const hasText = !!(body.trim() && body !== '<p></p>');
    if (!hasText && attachments.length === 0) {
      toast.error('Thêm mô tả ngắn hoặc ít nhất một ảnh kèm chia sẻ.');
      return;
    }
    try {
      await createCommunityPost({
        type: 'COURSE_SHARE',
        bodyJson: body.trim() ? body : '<p></p>',
        courseId,
        ...(attachments.length ? { attachments } : {}),
        ...(subjectId ? { subjectId } : {}),
      });
      toast.success('Đã chia sẻ lên cộng đồng');
      setOpen(false);
      setBody('');
      setAttachments([]);
    } catch {
      toast.error('Không thể chia sẻ');
    }
  };

  return (
    <>
      <Button
        type="button"
        variant={variant}
        className="w-full font-semibold"
        onClick={() => {
          if (!isAuthenticated) {
            router.push(
              ROUTES.AUTH.LOGIN +
                '?callbackUrl=' +
                encodeURIComponent(window.location.pathname),
            );
            return;
          }
          setOpen(true);
        }}
      >
        <Share2 className="w-4 h-4 mr-2" />
        Chia sẻ vào cộng đồng
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chia sẻ khóa học</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Thẻ khóa học sẽ được gắn tự động. Thêm vài dòng cảm nhận để thu hút học viên.
          </p>
          <RichTextEditor
            value={body}
            onChange={setBody}
            placeholder="Ví dụ: Khóa này hợp người mất gốc..."
          />
          <CommunityAttachmentPicker attachments={attachments} onChange={setAttachments} />
          <Button className="w-full" onClick={submit}>
            Đăng lên Community
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
