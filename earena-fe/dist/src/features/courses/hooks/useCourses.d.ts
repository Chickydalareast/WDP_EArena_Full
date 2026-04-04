import { CourseBasic } from '../types/course.schema';
interface UsePublicCoursesProps {
    page?: number;
    limit?: number;
    keyword?: string;
    subjectId?: string;
    isFree?: boolean;
    minPrice?: number;
    maxPrice?: number;
    sort?: 'NEWEST' | 'PRICE_ASC' | 'PRICE_DESC' | 'POPULAR';
}
interface UsePublicCoursesProps {
    page?: number;
    limit?: number;
    keyword?: string;
    subjectId?: string;
}
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
export interface PaginatedCourseResponse {
    items: CourseBasic[];
    meta: PaginationMeta;
}
export declare const usePublicCourses: (filters?: UsePublicCoursesProps) => any;
export declare const usePublicCourseDetail: (slug: string) => any;
export {};
