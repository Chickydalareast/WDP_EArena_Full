'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { toast } from 'sonner';

interface VideoPlayerProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
    src: string;
    accumulatedTimeRef: React.RefObject<number>;

    onFlush: (isEnded?: boolean) => void;
    onTrackTimeUpdate: (currentTime: number) => void;
    onOptimisticComplete: () => void;

    initialPosition?: number;
    isCompletedAtLoad?: boolean;
    onTokenExpired?: () => void;
    isRefetching?: boolean;
}

export function VideoPlayer({
    src,
    accumulatedTimeRef,
    onFlush,
    onTrackTimeUpdate, // [CTO ADD]
    onOptimisticComplete,
    initialPosition = 0,
    isCompletedAtLoad = false,
    onTokenExpired,
    isRefetching,
    className,
    onPlay,
    onPause,
    onEnded,
    onTimeUpdate,
    onLoadedMetadata,
    ...props
}: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [hasError, setHasError] = useState<boolean>(false);

    const hasTriggeredCompleteRef = useRef<boolean>(isCompletedAtLoad);

    const [prevSrc, setPrevSrc] = useState<string>(src);
    if (src !== prevSrc) {
        setPrevSrc(src);
        setHasError(false);
        hasTriggeredCompleteRef.current = isCompletedAtLoad;
    }

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && videoRef.current && !videoRef.current.paused) {
                videoRef.current.pause();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    useEffect(() => {
        const handleSystemPause = () => {
            if (videoRef.current && !videoRef.current.paused) {
                videoRef.current.pause();
            }
        };
        window.addEventListener('core:pause_video', handleSystemPause);
        return () => window.removeEventListener('core:pause_video', handleSystemPause);
    }, []);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.load();
        }
    }, [src]);


    const handleLoadedMetadata = useCallback((e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
        if (onLoadedMetadata) onLoadedMetadata(e);

        if (videoRef.current && initialPosition > 0 && !isCompletedAtLoad) {
            const duration = videoRef.current.duration;
            if (initialPosition < duration - 2) {
                videoRef.current.currentTime = initialPosition;
            }
        }
    }, [initialPosition, isCompletedAtLoad, onLoadedMetadata]);

    const handleTimeUpdate = useCallback((e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
        if (onTimeUpdate) onTimeUpdate(e);
        if (!videoRef.current || !accumulatedTimeRef) return;

        const currentTime = videoRef.current.currentTime;

        onTrackTimeUpdate(currentTime);

        const duration = videoRef.current.duration;
        const accumulated = accumulatedTimeRef.current;

        if (duration > 0 && !hasTriggeredCompleteRef.current) {
            const watchRatio = accumulated / duration;
            if (watchRatio >= 0.9) {
                hasTriggeredCompleteRef.current = true;
                console.debug(`[OptimisticUI] Reached real watch time: ${(watchRatio * 100).toFixed(1)}%. Triggering completion!`);
                onOptimisticComplete();
            }
        }
    }, [onTimeUpdate, onTrackTimeUpdate, accumulatedTimeRef, onOptimisticComplete]);

    const handleVideoEnded = useCallback((e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
        if (onEnded) onEnded(e);

        onFlush(true);

        if (!videoRef.current || !accumulatedTimeRef) return;
        const duration = videoRef.current.duration;
        const accumulated = accumulatedTimeRef.current;
        if (duration > 0 && !hasTriggeredCompleteRef.current) {
            const watchRatio = accumulated / duration;
            if (watchRatio >= 0.9) {
                hasTriggeredCompleteRef.current = true;
                onOptimisticComplete();
            }
        }
    }, [onEnded, onFlush, accumulatedTimeRef, onOptimisticComplete]);

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

                onPlay={onPlay}
                onPause={onPause}

                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleVideoEnded}

                {...props}
            >
                <source src={src} type="video/mp4" />
            </video>
        </div>
    );
}