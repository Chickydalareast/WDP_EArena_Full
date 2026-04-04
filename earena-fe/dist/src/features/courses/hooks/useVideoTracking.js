"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useVideoTracking = useVideoTracking;
const react_1 = require("react");
const course_service_1 = require("../api/course.service");
const PING_INTERVAL_MS = 10000;
function useVideoTracking(courseId, lessonId, initialWatchTime = 0) {
    const lastVideoTimeRef = (0, react_1.useRef)(null);
    const diffBufferRef = (0, react_1.useRef)(0);
    const accumulatedTimeRef = (0, react_1.useRef)(initialWatchTime);
    const currentPositionRef = (0, react_1.useRef)(0);
    (0, react_1.useEffect)(() => {
        accumulatedTimeRef.current = initialWatchTime;
        diffBufferRef.current = 0;
        lastVideoTimeRef.current = null;
    }, [lessonId, initialWatchTime]);
    const trackTimeUpdate = (0, react_1.useCallback)((currentTime) => {
        currentPositionRef.current = currentTime;
        if (lastVideoTimeRef.current !== null) {
            const diff = currentTime - lastVideoTimeRef.current;
            if (diff > 0 && diff <= 2.0) {
                diffBufferRef.current += diff;
            }
        }
        lastVideoTimeRef.current = currentTime;
    }, []);
    const flushHeartbeat = (0, react_1.useCallback)((isEnded = false) => {
        const deltaFloat = diffBufferRef.current;
        let delta = Math.floor(deltaFloat);
        if (delta > 30)
            delta = 30;
        if (isEnded && delta === 0) {
            delta = 1;
        }
        if (delta > 0) {
            diffBufferRef.current -= delta;
            accumulatedTimeRef.current += delta;
            course_service_1.courseService.sendHeartbeat({
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
    (0, react_1.useEffect)(() => {
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
//# sourceMappingURL=useVideoTracking.js.map