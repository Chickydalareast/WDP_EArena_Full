import 'katex/dist/katex.min.css';
interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    placeholder?: string;
}
export declare function RichTextEditor({ value, onChange, disabled, placeholder }: RichTextEditorProps): any;
export {};
