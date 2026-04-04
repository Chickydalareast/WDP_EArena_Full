export interface TopicNode {
    _id: string;
    name: string;
    children?: TopicNode[];
}
export interface FlatTopic {
    id: string;
    name: string;
    path: string;
}
export declare const useTopicsTree: (subjectId?: string) => any;
