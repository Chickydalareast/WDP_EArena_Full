export interface Option {
    label: string;
    value: string;
    disabled?: boolean;
}
interface MultiSelectProps {
    options: Option[];
    selected: string[];
    onChange: (values: string[]) => void;
    placeholder?: string;
    disabled?: boolean;
}
export declare function MultiSelect({ options, selected, onChange, placeholder, disabled }: MultiSelectProps): any;
export {};
