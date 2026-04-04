export declare class QualificationDto {
    url: string;
    name: string;
}
export declare class RegisterDto {
    email: string;
    fullName: string;
    password: string;
    ticket: string;
    role: 'STUDENT' | 'TEACHER';
    subjectIds?: string[];
    qualifications?: QualificationDto[];
}
