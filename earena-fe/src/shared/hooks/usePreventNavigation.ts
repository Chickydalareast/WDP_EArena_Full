'use client';

import { useEffect } from 'react';

export function usePreventNavigation(isPrevented: boolean) {
    useEffect(() => {
        if (!isPrevented) return;

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = 'Tiến trình đang diễn ra, bạn có chắc chắn muốn rời đi? Dữ liệu có thể không được lưu.';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isPrevented]);
}