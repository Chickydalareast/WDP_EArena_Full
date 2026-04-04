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
export declare function VideoPlayer({ src, accumulatedTimeRef, onFlush, onTrackTimeUpdate, onOptimisticComplete, initialPosition, isCompletedAtLoad, onTokenExpired, isRefetching, className, onPlay, onPause, onEnded, onTimeUpdate, onLoadedMetadata, ...props }: VideoPlayerProps): any;
export {};
