'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useCloudinaryUpload } from '@/shared/hooks/useCloudinaryUpload';
import { Button } from '@/shared/components/ui/button';
import { Loader2, FileUp, Trash2, Music } from 'lucide-react';
import { toast } from 'sonner';

// 1. DATA CONTRACT TỪ BACKEND TRẢ VỀ CHO FILE ĐÍNH KÈM
export interface PopulatedMedia {
    _id: string;
    url: string;
    mimetype: string;
    originalName: string;
}

// 2. COMPONENT PROPS
interface QuestionMediaUploaderProps {
    value: string[]; // Mảng ID quản lý bởi react-hook-form (Đẩy xuống BE)
    onChange: (newMediaIds: string[]) => void;
    disabled?: boolean;
    initialMedia?: PopulatedMedia[]; // [BẢN VÁ] Dữ liệu gốc từ BE để hiển thị Preview lúc Edit
}

// Local state quản lý UI Preview
interface MediaPreview {
    id: string;
    url: string;
    type: 'image' | 'audio';
    name: string;
}

export function QuestionMediaUploader({
    value = [],
    onChange,
    disabled,
    initialMedia
}: QuestionMediaUploaderProps) {

    const { uploadDirectly, isUploading, progress } = useCloudinaryUpload();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previews, setPreviews] = useState<MediaPreview[]>([]);

    // ==========================================
    // HYDRATION LOGIC (Tối ưu chống Loop và Memory Leak)
    // ==========================================

    // Biến mảng object thành chuỗi ID để so sánh, tránh vòng lặp vô hạn của React
    const initialMediaIdsString = initialMedia?.map(m => m._id).sort().join(',') || '';

    useEffect(() => {
        // Luồng 1: Bơm dữ liệu cũ (Lúc mở Modal Edit)
        if (initialMedia && initialMedia.length > 0) {
            const hydratedPreviews: MediaPreview[] = initialMedia.map(m => ({
                id: m._id,
                url: m.url,
                type: m.mimetype.startsWith('image/') ? 'image' : 'audio',
                name: m.originalName
            }));
            setPreviews(hydratedPreviews);
        }
        // Luồng 2: Reset Form trắng (Lúc chuyển sang Tạo mới)
        else if (value.length === 0 && previews.length > 0) {
            setPreviews([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialMediaIdsString, value.length]);


    // ==========================================
    // UPLOAD HANDLERS
    // ==========================================

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const isImage = file.type.startsWith('image/');
        const isAudio = file.type.startsWith('audio/');

        if (!isImage && !isAudio) {
            toast.error('Định dạng không hỗ trợ', { description: 'Chỉ chấp nhận tệp Hình ảnh hoặc Âm thanh (MP3/WAV).' });
            return;
        }

        const maxSize = isAudio ? 20 * 1024 * 1024 : 5 * 1024 * 1024;
        if (file.size > maxSize) {
            toast.error('Tệp quá lớn', {
                description: `Vui lòng chọn ${isAudio ? 'âm thanh dưới 20MB' : 'ảnh dưới 5MB'}.`
            });
            return;
        }

        try {
            const mediaRes = await uploadDirectly(file, 'question');

            if (mediaRes && mediaRes.id) {
                onChange([...value, mediaRes.id]);
                setPreviews(prev => [...prev, {
                    id: mediaRes.id,
                    url: mediaRes.url,
                    type: isImage ? 'image' : 'audio',
                    name: file.name
                }]);
                toast.success(`Đã đính kèm ${isImage ? 'hình ảnh' : 'âm thanh'} thành công!`);
            }
        } catch (error) {
            // Error handled within hook
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const removeMedia = (idToRemove: string) => {
        onChange(value.filter(id => id !== idToRemove));
        setPreviews(prev => prev.filter(p => p.id !== idToRemove));
    };

    // ==========================================
    // RENDER UI
    // ==========================================

    return (
        <div className="mt-4 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <FileUp className="w-4 h-4 text-blue-500" /> Tệp đính kèm (Ảnh / Bài nghe)
                </label>

                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*, audio/mpeg, audio/wav, audio/mp3"
                    onChange={handleFileSelect}
                    disabled={disabled || isUploading}
                />

                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="font-semibold text-blue-700 border-blue-200 hover:bg-blue-50"
                    disabled={disabled || isUploading}
                    onClick={() => fileInputRef.current?.click()}
                >
                    {isUploading ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang tải {progress}%</>
                    ) : (
                        <>Thêm File Đính Kèm</>
                    )}
                </Button>
            </div>

            {previews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 border-t pt-4">
                    {previews.map((media) => (
                        <div key={media.id} className="relative group bg-slate-50 border border-slate-200 rounded-lg p-2 overflow-hidden flex flex-col items-center justify-center">
                            <button
                                type="button"
                                onClick={() => removeMedia(media.id)}
                                disabled={disabled}
                                className="absolute top-2 right-2 bg-white/90 text-red-500 hover:text-white hover:bg-red-500 p-1.5 rounded-md shadow-sm transition-all z-10"
                                title="Xóa tệp này"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>

                            {media.type === 'image' ? (
                                <div className="w-full flex justify-center">
                                    <img src={media.url} alt={media.name} className="max-h-[150px] object-contain rounded-md" />
                                </div>
                            ) : (
                                <div className="w-full flex flex-col items-center justify-center py-4 px-2">
                                    <Music className="w-8 h-8 text-purple-500 mb-2" />
                                    <p className="text-xs text-slate-500 font-mono truncate w-full text-center mb-3 px-6">{media.name}</p>
                                    <audio src={media.url} controls className="w-full h-10" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    <p className="text-xs text-slate-400">Chưa có tệp đính kèm nào.</p>
                </div>
            )}
        </div>
    );
}