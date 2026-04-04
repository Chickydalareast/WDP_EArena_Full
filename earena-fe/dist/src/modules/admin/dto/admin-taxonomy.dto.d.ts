export declare class AdminCreateSubjectDto {
    name: string;
    code: string;
    isActive?: boolean;
}
export declare class AdminUpdateSubjectDto {
    name?: string;
    code?: string;
    isActive?: boolean;
}
export declare class AdminCreateTopicDto {
    subjectId: string;
    name: string;
    level: number;
    parentId?: string;
}
export declare class AdminUpdateTopicDto {
    name?: string;
    level?: number;
    parentId?: string | null;
}
