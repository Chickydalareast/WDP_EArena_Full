'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ImagePlus, Send, X, Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { Progress } from '@/shared/components/ui/progress';
import { useDiscussionMutations } from '../hooks/useDiscussionMutations';
import { createDiscussionSchema, CreateQuestionDTO, CreateReplyDTO } from '../types/discussion.schema';
import { cn } from '@/shared/lib/utils';
import { MediaResponse } from '@/shared/types/media.types';
import { useCloudinaryUpload } from '@/shared/hooks/useCloudinaryUpload';

interface DiscussionEditorProps {
    courseId: string;
    lessonId: string;
    parentId?: string;
    onCancel?: () => void;
    onSuccessCb?: () => void;
}

export function DiscussionEditor({ courseId, lessonId, parentId, onCancel, onSuccessCb }: DiscussionEditorProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [attachments, setAttachments] = useState<MediaResponse[]>([]);
    
    const { uploadDirectly, isUploading, progress } = useCloudinaryUpload();
    const { postQuestion, postReply } = useDiscussionMutations(courseId, lessonId);

    const isSubmitting = postQuestion.isPending || postReply.isPending;

    const form = useForm<CreateQuestionDTO>({
        resolver: zodResolver(createDiscussionSchema),
        defaultValues: {
            courseId,
            lessonId,
            content: '',
            attachments: [],
        },
    });

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (fileInputRef.current) fileInputRef.current.value = '';

        try {
            const media = await uploadDirectly(file, 'lesson_discussion');
            setAttachments((prev) => [...prev, media]);
            form.setValue('attachments', [...(form.getValues('attachments') || []), media.id]);
        } catch (error) {
        }
    };

    const removeAttachment = (indexToRemove: number) => {
        setAttachments((prev) => prev.filter((_, idx) => idx !== indexToRemove));
        form.setValue(
            'attachments', 
            form.getValues('attachments')?.filter((_, idx) => idx !== indexToRemove) || []
        );
    };

    const onSubmit = (data: CreateQuestionDTO) => {
        if (parentId) {
            const replyPayload: CreateReplyDTO = { ...data, parentId };
            postReply.mutate(replyPayload, {
                onSuccess: () => {
                    form.reset({ content: '', courseId, lessonId, attachments: [] });
                    setAttachments([]);
                    onSuccessCb?.();
                }
            });
        } else {
            postQuestion.mutate(data, {
                onSuccess: () => {
                    form.reset({ content: '', courseId, lessonId, attachments: [] });
                    setAttachments([]);
                    onSuccessCb?.();
                }
            });
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="bg-card border border-border p-4 rounded-xl shadow-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all">
            <Textarea
                placeholder={parentId ? "Viết câu trả lời của bạn..." : "Bạn có thắc mắc gì về bài học này?"}
                className="border-none shadow-none focus-visible:ring-0 px-0 resize-none min-h-[80px]"
                {...form.register('content')}
                disabled={isSubmitting || isUploading}
            />
            {form.formState.errors.content && (
                <p className="text-[11px] text-destructive mt-1 font-medium">{form.formState.errors.content.message}</p>
            )}

            {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 p-2 bg-muted/30 rounded-lg">
                    {attachments.map((file, idx) => (
                        <div key={file.id} className="relative group rounded-md overflow-hidden border border-border bg-background">
                            {file.url.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                                <img src={file.url} alt="attachment" className="h-16 w-16 object-cover" loading="lazy" />
                            ) : (
                                <div className="h-16 w-16 flex items-center justify-center text-[10px] text-muted-foreground font-semibold bg-muted p-1 text-center break-words line-clamp-2">
                                    {file.originalName}
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={() => removeAttachment(idx)}
                                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Vùng hiển thị tiến trình Upload */}
            {isUploading && (
                <div className="mt-3 space-y-1.5">
                    <div className="flex justify-between text-xs text-muted-foreground font-medium">
                        <span>Đang tải tệp lên...</span>
                        <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-1.5 bg-primary/20" />
                </div>
            )}

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
                <div className="flex items-center gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*,application/pdf,.doc,.docx"
                        onChange={handleFileSelect}
                        disabled={isSubmitting || isUploading}
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-primary gap-1.5 h-8 px-2"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isSubmitting || isUploading}
                    >
                        <ImagePlus className="w-4 h-4" />
                        <span className="text-xs font-semibold">Đính kèm</span>
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    {onCancel && (
                        <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={isSubmitting || isUploading} className="h-8">
                            Hủy
                        </Button>
                    )}
                    <Button 
                        type="submit" 
                        size="sm" 
                        disabled={!form.watch('content')?.trim() || isSubmitting || isUploading}
                        className="gap-1.5 h-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-sm"
                    >
                        {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        Gửi
                    </Button>
                </div>
            </div>
        </form>
    );
}