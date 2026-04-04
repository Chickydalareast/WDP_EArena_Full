export interface SubjectDTO {
    _id: string;
    name: string;
    code: string;
    description?: string;
}
export declare const taxonomyService: {
    getSubjects: () => Promise<SubjectDTO[]>;
};
