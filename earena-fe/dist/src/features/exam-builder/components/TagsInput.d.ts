interface TagsInputProps {
    value: string[];
    onChange: (tags: string[]) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}
export declare function TagsInput({ value, onChange, placeholder, disabled, className }: TagsInputProps): any;
export {};
