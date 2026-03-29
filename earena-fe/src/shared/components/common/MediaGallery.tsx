'use client';

import React from 'react';
import { cn } from '@/shared/lib/utils';

// Dựa trên spec Populate Media từ BE
export interface PopulatedMedia {
    _id: string;
    url: string;
    mimetype: string;
    originalName: string;
}

interface MediaGalleryProps {
    mediaList?: PopulatedMedia[];
}

export const MediaGallery = React.memo(({ mediaList }: MediaGalleryProps) => {
    if (!mediaList || mediaList.length === 0) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-3 p-3 bg-slate-50/80 border border-slate-100 rounded-xl">
            {mediaList.map((media) => {
                const isImage = media.mimetype.startsWith('image/');
                const isAudio = media.mimetype.startsWith('audio/');

                return (
                    <div key={media._id} className="relative group bg-white overflow-hidden rounded-xl border shadow-sm max-w-full flex flex-col justify-center p-2">
                        {isImage && (
                            <img src={media.url} alt={media.originalName} loading="lazy" className="max-h-[250px] w-full object-contain rounded-lg mx-auto" />
                        )}
                        {isAudio && (
                            <div className="w-full px-4 py-3 flex flex-col items-center">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 w-full text-left">Bài Nghe (Audio)</span>
                                <audio src={media.url} controls className="w-full h-10 outline-none" />
                                <p className="text-[10px] text-slate-400 mt-2 truncate w-full text-center font-mono">{media.originalName}</p>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
});
MediaGallery.displayName = 'MediaGallery';