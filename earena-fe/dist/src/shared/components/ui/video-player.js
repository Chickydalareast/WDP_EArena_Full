'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoPlayer = VideoPlayer;
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/shared/lib/utils");
const sonner_1 = require("sonner");
function VideoPlayer({ src, accumulatedTimeRef, onFlush, onTrackTimeUpdate, onOptimisticComplete, initialPosition = 0, isCompletedAtLoad = false, onTokenExpired, isRefetching, className, onPlay, onPause, onEnded, onTimeUpdate, onLoadedMetadata, ...props }) {
    const videoRef = (0, react_1.useRef)(null);
    const [hasError, setHasError] = (0, react_1.useState)(false);
    const hasTriggeredCompleteRef = (0, react_1.useRef)(isCompletedAtLoad);
    const [prevSrc, setPrevSrc] = (0, react_1.useState)(src);
    if (src !== prevSrc) {
        setPrevSrc(src);
        setHasError(false);
        hasTriggeredCompleteRef.current = isCompletedAtLoad;
    }
    (0, react_1.useEffect)(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && videoRef.current && !videoRef.current.paused) {
                videoRef.current.pause();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);
    (0, react_1.useEffect)(() => {
        const handleSystemPause = () => {
            if (videoRef.current && !videoRef.current.paused) {
                videoRef.current.pause();
            }
        };
        window.addEventListener('core:pause_video', handleSystemPause);
        return () => window.removeEventListener('core:pause_video', handleSystemPause);
    }, []);
    (0, react_1.useEffect)(() => {
        if (videoRef.current) {
            videoRef.current.load();
        }
    }, [src]);
    const handleLoadedMetadata = (0, react_1.useCallback)((e) => {
        if (onLoadedMetadata)
            onLoadedMetadata(e);
        if (videoRef.current && initialPosition > 0 && !isCompletedAtLoad) {
            const duration = videoRef.current.duration;
            if (initialPosition < duration - 2) {
                videoRef.current.currentTime = initialPosition;
            }
        }
    }, [initialPosition, isCompletedAtLoad, onLoadedMetadata]);
    const handleTimeUpdate = (0, react_1.useCallback)((e) => {
        if (onTimeUpdate)
            onTimeUpdate(e);
        if (!videoRef.current || !accumulatedTimeRef)
            return;
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
    const handleVideoEnded = (0, react_1.useCallback)((e) => {
        if (onEnded)
            onEnded(e);
        onFlush(true);
        if (!videoRef.current || !accumulatedTimeRef)
            return;
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
    const handleError = (e) => {
        const mediaError = e.currentTarget.error;
        if (!mediaError)
            return;
        if (mediaError.code === 2 || mediaError.code === 4) {
            setHasError(true);
            if (onTokenExpired) {
                sonner_1.toast.info('Phiên kết nối hết hạn. Đang tải lại luồng video...');
                onTokenExpired();
            }
            else {
                sonner_1.toast.error('Không thể tải video. Vui lòng thử lại sau.');
            }
        }
    };
    return (<div className={(0, utils_1.cn)("relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-xl border border-border", className)}>
            {(isRefetching || hasError) && (<div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 text-white backdrop-blur-md transition-all">
                    {isRefetching ? (<>
                            <lucide_react_1.Loader2 className="w-10 h-10 animate-spin text-primary mb-3"/>
                            <p className="text-sm font-semibold tracking-wide">Đang cấp phát lại phiên kết nối an toàn...</p>
                        </>) : (<>
                            <lucide_react_1.AlertCircle className="w-10 h-10 text-destructive mb-3"/>
                            <p className="text-sm font-semibold">Tín hiệu bị gián đoạn.</p>
                        </>)}
                </div>)}

            <video ref={videoRef} className="w-full h-full outline-none" controls controlsList="nodownload" disablePictureInPicture onError={handleError} onPlay={onPlay} onPause={onPause} onLoadedMetadata={handleLoadedMetadata} onTimeUpdate={handleTimeUpdate} onEnded={handleVideoEnded} {...props}>
                <source src={src} type="video/mp4"/>
            </video>
        </div>);
}
//# sourceMappingURL=video-player.js.map