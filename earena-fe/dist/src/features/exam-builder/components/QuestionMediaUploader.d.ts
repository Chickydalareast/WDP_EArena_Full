export interface PopulatedMedia {
    _id: string;
    url: string;
    mimetype: string;
    originalName: string;
}
interface QuestionMediaUploaderProps {
    value: string[];
    onChange: (newMediaIds: string[]) => void;
    disabled?: boolean;
    initialMedia?: PopulatedMedia[];
}
export declare function QuestionMediaUploader({ value, onChange, disabled, initialMedia }: QuestionMediaUploaderProps): any;
export {};
