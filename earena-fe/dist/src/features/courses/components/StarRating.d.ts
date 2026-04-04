interface StarRatingProps {
    value: number;
    onChange?: (value: number) => void;
    readonly?: boolean;
    size?: number;
    className?: string;
}
export declare const StarRating: ({ value, onChange, readonly, size, className }: StarRatingProps) => any;
export {};
