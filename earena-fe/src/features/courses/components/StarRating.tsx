'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface StarRatingProps {
    value: number;
    onChange?: (value: number) => void;
    readonly?: boolean;
    size?: number;
    className?: string;
}

export const StarRating = ({
    value,
    onChange,
    readonly = false,
    size = 16,
    className
}: StarRatingProps) => {
    const [hoverValue, setHoverValue] = useState<number | null>(null);

    return (
        <div className={cn("flex items-center gap-1", className)}>
            {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = (hoverValue ?? value) >= star;

                return (
                    <Star
                        key={star}
                        size={size}
                        className={cn(
                            "transition-all duration-200",
                            isFilled ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted-foreground/30",
                            !readonly && "cursor-pointer hover:scale-110"
                        )}
                        onMouseEnter={() => !readonly && setHoverValue(star)}
                        onMouseLeave={() => !readonly && setHoverValue(null)}
                        onClick={() => !readonly && onChange?.(star)}
                        draggable={false}
                    />
                );
            })}
        </div>
    );
};