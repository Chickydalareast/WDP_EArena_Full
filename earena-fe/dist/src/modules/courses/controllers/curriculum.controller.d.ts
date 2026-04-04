import { CurriculumService } from '../services/curriculum.service';
import { CreateSectionDto, CreateLessonDto, UpdateSectionDto, UpdateLessonDto } from '../dto/curriculum.dto';
import { ReorderCurriculumDto } from '../dto/course.dto';
export declare class CurriculumController {
    private readonly curriculumService;
    constructor(curriculumService: CurriculumService);
    createSection(courseId: string, dto: CreateSectionDto, userId: string): Promise<{
        message: string;
        data: any;
    }>;
    createLesson(courseId: string, sectionId: string, dto: CreateLessonDto, userId: string): Promise<{
        message: string;
        data: any;
    }>;
    deleteSection(courseId: string, sectionId: string, userId: string): Promise<{
        message: string;
    }>;
    updateLesson(courseId: string, lessonId: string, dto: UpdateLessonDto, userId: string): Promise<{
        courseId?: import("mongoose").Types.ObjectId | undefined;
        sectionId?: import("mongoose").Types.ObjectId | undefined;
        title?: string | undefined;
        order?: number | undefined;
        isFreePreview?: boolean | undefined;
        primaryVideoId?: import("mongoose").Types.ObjectId;
        attachments?: import("mongoose").Types.ObjectId[] | undefined;
        content?: string | undefined;
        examId?: import("mongoose").Types.ObjectId;
        examRules?: import("../schemas/lesson.schema").ExamRuleConfig;
        _id?: import("mongoose").Types.ObjectId | undefined;
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
    deleteLesson(courseId: string, lessonId: string, userId: string): Promise<{
        message: string;
    }>;
    reorderCurriculum(courseId: string, dto: ReorderCurriculumDto, userId: string): Promise<{
        message: string;
    }>;
    updateSection(courseId: string, sectionId: string, dto: UpdateSectionDto, userId: string): Promise<{
        courseId?: import("mongoose").Types.ObjectId | undefined;
        title?: string | undefined;
        description?: string;
        order?: number | undefined;
        _id?: import("mongoose").Types.ObjectId | undefined;
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
}
