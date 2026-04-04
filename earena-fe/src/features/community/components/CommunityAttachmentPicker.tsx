'use client';

import { useId, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { flushSync } from 'react-dom';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { uploadCommunityImage } from '../api/community-api';
import { toast } from 'sonner';
import type { CommunityAttachment } from './PostAttachmentsDisplay';

const DEFAULT_MAX = 8;
/** Rộng hơn để Windows / HEIC không bị `type` rỗng. */
const ACCEPT = 'image/*';
const MAX_BYTES = 8 * 1024 * 1024;

function isAllowedImageFile(file: File): boolean {
  if (file.type.startsWith('image/')) {
    if (file.type === 'image/svg+xml') return false;
    return true;
  }
  return /\.(jpe?g|png|gif|webp|bmp|heic|heif|avif)$/i.test(file.name);
}

export function CommunityAttachmentPicker({
  attachments,
  onChange,
  disabled,
  maxImages = DEFAULT_MAX,
}: {
  attachments: CommunityAttachment[];
  onChange: Dispatch<SetStateAction<CommunityAttachment[]>>;
  disabled?: boolean;
  maxImages?: number;
}) {
  const reactId = useId().replace(/:/g, '');
  const fileInputId = `community-att-${reactId}`;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [pending, setPending] = useState<{ key: string; previewUrl: string }[]>([]);

  const onFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    e.target.value = '';
    if (!files?.length) return;

    let room = maxImages - attachments.length;
    if (room <= 0) {
      toast.error(`Tối đa ${maxImages} ảnh.`);
      return;
    }

    const slice = Array.from(files).slice(0, room);
    for (const file of slice) {
      if (room <= 0) break;

      if (!isAllowedImageFile(file)) {
        toast.error('Chọn file ảnh (JPEG, PNG, WebP, GIF, HEIC…).');
        continue;
      }
      if (file.size > MAX_BYTES) {
        toast.error('Mỗi ảnh tối đa 8MB.');
        continue;
      }

      const key =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`;
      const previewUrl = URL.createObjectURL(file);
      // Buộc commit preview trước khi upload — nếu không, lỗi nhanh có thể gộp batch
      // với finally (xóa pending) nên giao diện không kịp hiện ảnh.
      flushSync(() => {
        setPending((p) => [...p, { key, previewUrl }]);
      });

      try {
        setIsUploading(true);
        const { url } = await uploadCommunityImage(file);
        onChange((prev) => {
          if (prev.length >= maxImages) return prev;
          return [
            ...prev,
            {
              url,
              kind: 'IMAGE' as const,
              name: file.name,
              mime: file.type || 'image/jpeg',
            },
          ];
        });
        room -= 1;
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Không thể tải ảnh lên.';
        toast.error('Lỗi tải ảnh', { description: msg });
      } finally {
        setIsUploading(false);
        setPending((p) => p.filter((x) => x.key !== key));
        URL.revokeObjectURL(previewUrl);
      }
    }
  };

  const remove = (idx: number) => {
    onChange((prev) => prev.filter((_, i) => i !== idx));
  };

  const busy = isUploading || pending.length > 0;
  const pickerBlocked = disabled || busy || attachments.length >= maxImages;

  return (
    <div className="space-y-2">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        id={fileInputId}
        type="file"
        accept={ACCEPT}
        multiple
        className="sr-only"
        onChange={onFiles}
        disabled={pickerBlocked}
        aria-label="Chọn ảnh đính kèm"
      />

      {/* Trigger button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pickerBlocked}
        onClick={() => fileInputRef.current?.click()}
      >
        {busy ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <ImagePlus className="mr-2 h-4 w-4" />
        )}
        Thêm ảnh
      </Button>

      {/* Preview grid */}
      {(attachments.length > 0 || pending.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {pending.map((p) => (
            <div
              key={p.key}
              className="relative h-24 w-24 overflow-hidden rounded-md border border-border bg-muted"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.previewUrl} alt="" className="h-full w-full object-cover opacity-70" />
              <div className="absolute inset-0 flex items-center justify-center bg-background/40">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            </div>
          ))}
          {attachments.map((a, i) => (
            <div
              key={`${a.url}-${i}`}
              className="group relative h-24 w-24 overflow-hidden rounded-md border border-border bg-muted"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={a.url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                className="absolute right-0.5 top-0.5 rounded-full bg-background/90 p-0.5 opacity-0 shadow transition group-hover:opacity-100"
                onClick={() => remove(i)}
                disabled={disabled || busy}
                aria-label="Xóa ảnh"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
