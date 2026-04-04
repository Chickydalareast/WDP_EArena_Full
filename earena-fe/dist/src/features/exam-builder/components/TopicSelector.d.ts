import { FlatTopic } from '../hooks/useTopics';
export interface TopicSelectorProps {
    value?: string;
    onChange: (value: string) => void;
    topics: FlatTopic[];
    isLoading?: boolean;
    disabled?: boolean;
    placeholder?: string;
    className?: string;
}
export declare const TopicSelector: any;
