'use client';

import { useRef, useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { toast } from 'sonner';

interface VideoPlayerProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
    src: string;
    onTokenExpired?: () => void;
    isRefetching?: boolean;
}

export function VideoPlayer({ src, onTokenExpired, isRefetching, className, ...props }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [hasError, setHasError] = useState<boolean>(false);

    const [prevSrc, setPrevSrc] = useState<string>(src);
    if (src !== prevSrc) {
        setPrevSrc(src);
        setHasError(false);
    }

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.load();
        }
    }, [src]);

    const handleError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
        const mediaError = e.currentTarget.error;
        if (!mediaError) return;

        if (mediaError.code === 2 || mediaError.code === 4) {
            setHasError(true);

            if (onTokenExpired) {
                toast.info('Phiên kết nối hết hạn. Đang tải lại luồng video...');
                onTokenExpired();
            } else {
                toast.error('Không thể tải video. Vui lòng thử lại sau.');
            }
        }
    };

    return (
        <div className={cn("relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-xl border border-border", className)}>
            {(isRefetching || hasError) && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 text-white backdrop-blur-md transition-all">
                    {isRefetching ? (
                        <>
                            <Loader2 className="w-10 h-10 animate-spin text-primary mb-3" />
                            <p className="text-sm font-semibold tracking-wide">Đang cấp phát lại phiên kết nối an toàn...</p>
                        </>
                    ) : (
                        <>
                            <AlertCircle className="w-10 h-10 text-destructive mb-3" />
                            <p className="text-sm font-semibold">Tín hiệu bị gián đoạn.</p>
                        </>
                    )}
                </div>
            )}

            <video
                ref={videoRef}
                className="w-full h-full outline-none"
                controls
                controlsList="nodownload"
                disablePictureInPicture
                onError={handleError}
                {...props}
            >
                <source src={src} type="video/mp4" />
            </video>
        </div>
    );
}