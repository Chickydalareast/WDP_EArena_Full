import { CourseSortType } from '../enums/course-search.enum';
export declare class SearchPublicCoursesDto {
    keyword?: string;
    subjectId?: string;
    page?: number;
    limit?: number;
    isFree?: boolean;
    minPrice?: number;
    maxPrice?: number;
    sort?: CourseSortType;
}
