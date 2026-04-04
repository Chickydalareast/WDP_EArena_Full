import { Logger } from '@nestjs/common';
import { Connection, Model, Types } from 'mongoose';
import { AbstractRepository } from '../../common/database/abstract.repository';
import { Course, CourseDocument } from './schemas/course.schema';
import { CourseSortType } from './enums/course-search.enum';
export interface GetCurriculumOptions {
    maskMediaUrls?: boolean;
}
export interface SearchPublicCoursesOptions {
    keyword?: string;
    subjectId?: string;
    page: number;
    limit: number;
    isFree?: boolean;
    minPrice?: number;
    maxPrice?: number;
    sort?: CourseSortType;
}
export declare class CoursesRepository extends AbstractRepository<CourseDocument> {
    private readonly courseModel;
    protected readonly logger: Logger;
    constructor(courseModel: Model<CourseDocument>, connection: Connection);
    getCourseDetailById(courseId: string): Promise<(Course & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    findBySlug(slug: string): Promise<any>;
    getFullCourseCurriculum(courseId: string | Types.ObjectId, options?: GetCurriculumOptions): Promise<any>;
    searchPublicCourses(options: SearchPublicCoursesOptions): Promise<{
        data: any[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getTeacherCoursesWithMetrics(teacherId: string): Promise<any[]>;
    countTeacherActiveCourses(teacherId: string | Types.ObjectId): Promise<number>;
    findPublishedPublicCardsByOrderedIds(ids: Types.ObjectId[]): Promise<Record<string, unknown>[]>;
    private mapLeanToPublicCourseCard;
}
