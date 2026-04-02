import { useEffect, useRef, useCallback } from 'react';
import { courseService } from '../api/course.service';

const PING_INTERVAL_MS = 10000;

export function useVideoTracking(
    courseId: string,
    lessonId: string,
    initialWatchTime: number = 0
) {
    const lastVideoTimeRef = useRef<number | null>(null);

    const diffBufferRef = useRef<number>(0);

    const accumulatedTimeRef = useRef<number>(initialWatchTime);

    const currentPositionRef = useRef<number>(0);

    useEffect(() => {
        accumulatedTimeRef.current = initialWatchTime;
        diffBufferRef.current = 0;
        lastVideoTimeRef.current = null;
    }, [lessonId, initialWatchTime]);
    const trackTimeUpdate = useCallback((currentTime: number) => {
        currentPositionRef.current = currentTime;

        if (lastVideoTimeRef.current !== null) {
            const diff = currentTime - lastVideoTimeRef.current;

            if (diff > 0 && diff <= 2.0) {
                diffBufferRef.current += diff;
            }
        }
        
        lastVideoTimeRef.current = currentTime;
    }, []);

    const flushHeartbeat = useCallback((isEnded: boolean = false) => {
        const deltaFloat = diffBufferRef.current;
        let delta = Math.floor(deltaFloat);

        if (delta > 30) delta = 30;

        if (isEnded && delta === 0) {
            delta = 1;
        }

        if (delta > 0) {
            diffBufferRef.current -= delta;
            accumulatedTimeRef.current += delta;

            courseService.sendHeartbeat({
                courseId,
                lessonId,
                delta,
                lastPosition: currentPositionRef.current,
                isEnded,
            }).catch(() => {
                console.debug('[Heartbeat] Ping failed, will retry/flush next cycle');
            });
        }
    }, [courseId, lessonId]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            flushHeartbeat(false);
        }, PING_INTERVAL_MS);

        return () => {
            clearInterval(intervalId);
            flushHeartbeat(false);
        };
    }, [flushHeartbeat]);

    return {
        trackTimeUpdate,
        flushHeartbeat,
        accumulatedTimeRef
    };
}