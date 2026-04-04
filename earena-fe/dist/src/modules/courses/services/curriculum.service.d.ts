import { Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CoursesRepository } from '../courses.repository';
import { SectionsRepository } from '../repositories/sections.repository';
import { LessonsRepository } from '../repositories/lessons.repository';
import { MediaRepository } from '../../media/media.repository';
import { ExamsRepository } from '../../exams/exams.repository';
import { EnrollmentsRepository } from '../repositories/enrollments.repository';
import { RedisService } from '../../../common/redis/redis.service';
import { CreateSectionPayload, CreateLessonPayload, UpdateSectionPayload, UpdateLessonPayload, ReorderPayload } from '../interfaces/course.interface';
export declare class CurriculumService {
    private readonly coursesRepo;
    private readonly sectionsRepo;
    private readonly lessonsRepo;
    private readonly redisService;
    private readonly mediaRepo;
    private readonly examsRepo;
    private readonly eventEmitter;
    private readonly enrollmentsRepo;
    private readonly logger;
    constructor(coursesRepo: CoursesRepository, sectionsRepo: SectionsRepository, lessonsRepo: LessonsRepository, redisService: RedisService, mediaRepo: MediaRepository, examsRepo: ExamsRepository, eventEmitter: EventEmitter2, enrollmentsRepo: EnrollmentsRepository);
    private verifyMultipleMediaStrict;
    private verifyExamStrict;
    private validateCourseOwnership;
    private clearCourseCache;
    private checkStructureLock;
    private processEmbeddedExamConfig;
    createSection(payload: CreateSectionPayload): Promise<any>;
    updateSection(payload: UpdateSectionPayload): Promise<{
        courseId?: Types.ObjectId | undefined;
        title?: string | undefined;
        description?: string;
        order?: number | undefined;
        _id?: Types.ObjectId | undefined;
        $locals?: Record<string, unknown> | undefined;
        $op?: "save" | "validate" | "remove" | null | undefined;
        $where?: Record<string, unknown> | undefined;
        baseModelName?: string;
        collection?: import("mongoose").Collection<import("bson").Document> | undefined;
        db?: import("mongoose").Connection | undefined;
        errors?: import("mongoose").Error.ValidationError;
        isNew?: boolean | undefined;
        schema?: import("mongoose").Schema<any, import("mongoose").Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, {
            [x: number]: unknown;
            [x: symbol]: unknown;
            [x: string]: unknown;
        }, import("mongoose").Document<unknown, {}, {
            [x: number]: unknown;
            [x: symbol]: unknown;
            [x: string]: unknown;
        }, {
            id: string;
        }, import("mongoose").DefaultSchemaOptions> & Omit<{
            [x: number]: unknown;
            [x: symbol]: unknown;
            [x: string]: unknown;
        } & Required<{
            _id: unknown;
        }> & {
            __v: number;
        }, "id"> & {
            id: string;
        }, {
            [path: string]: import("mongoose").SchemaDefinitionProperty<undefined, any, any>;
        } | {
            [x: string]: import("mongoose").SchemaDefinitionProperty<any, any, import("mongoose").Document<unknown, {}, {
                [x: number]: unknown;
                [x: symbol]: unknown;
                [x: string]: unknown;
            }, {
                id: string;
            }, import("mongoose").DefaultSchemaOptions> & Omit<{
                [x: number]: unknown;
                [x: symbol]: unknown;
                [x: string]: unknown;
            } & Required<{
                _id: unknown;
            }> & {
                __v: number;
            }, "id"> & {
                id: string;
            }> | undefined;
        }, {
            [x: number]: {};
            [x: symbol]: {};
            [x: string]: {};
        } & Required<{
            _id: unknown;
        }> & {
            __v: number;
        }> | undefined;
        message: string;
        id: any;
    }>;
    deleteSection(courseId: string, sectionId: string, teacherId: string): Promise<{
        message: string;
    }>;
    createLesson(payload: CreateLessonPayload): Promise<any>;
    updateLesson(payload: UpdateLessonPayload): Promise<{
        courseId?: Types.ObjectId | undefined;
        sectionId?: Types.ObjectId | undefined;
        title?: string | undefined;
        order?: number | undefined;
        isFreePreview?: boolean | undefined;
        primaryVideoId?: Types.ObjectId;
        attachments?: Types.ObjectId[] | undefined;
        content?: string | undefined;
        examId?: Types.ObjectId;
        examRules?: import("../schemas/lesson.schema").ExamRuleConfig;
        _id?: Types.ObjectId | undefined;
        $locals?: Record<string, unknown> | undefined;
        $op?: "save" | "validate" | "remove" | null | undefined;
        $where?: Record<string, unknown> | undefined;
        baseModelName?: string;
        collection?: import("mongoose").Collection<import("bson").Document> | undefined;
        db?: import("mongoose").Connection | undefined;
        errors?: import("mongoose").Error.ValidationError;
        isNew?: boolean | undefined;
        schema?: import("mongoose").Schema<any, import("mongoose").Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, {
            [x: number]: unknown;
            [x: symbol]: unknown;
            [x: string]: unknown;
        }, import("mongoose").Document<unknown, {}, {
            [x: number]: unknown;
            [x: symbol]: unknown;
            [x: string]: unknown;
        }, {
            id: string;
        }, import("mongoose").DefaultSchemaOptions> & Omit<{
            [x: number]: unknown;
            [x: symbol]: unknown;
            [x: string]: unknown;
        } & Required<{
            _id: unknown;
        }> & {
            __v: number;
        }, "id"> & {
            id: string;
        }, {
            [path: string]: import("mongoose").SchemaDefinitionProperty<undefined, any, any>;
        } | {
            [x: string]: import("mongoose").SchemaDefinitionProperty<any, any, import("mongoose").Document<unknown, {}, {
                [x: number]: unknown;
                [x: symbol]: unknown;
                [x: string]: unknown;
            }, {
                id: string;
            }, import("mongoose").DefaultSchemaOptions> & Omit<{
                [x: number]: unknown;
                [x: symbol]: unknown;
                [x: string]: unknown;
            } & Required<{
                _id: unknown;
            }> & {
                __v: number;
            }, "id"> & {
                id: string;
            }> | undefined;
        }, {
            [x: number]: {};
            [x: symbol]: {};
            [x: string]: {};
        } & Required<{
            _id: unknown;
        }> & {
            __v: number;
        }> | undefined;
        id: any;
    }>;
    deleteLesson(courseId: string, lessonId: string, teacherId: string): Promise<{
        message: string;
    }>;
    reorderCurriculum(payload: ReorderPayload): Promise<{
        message: string;
    }>;
}
