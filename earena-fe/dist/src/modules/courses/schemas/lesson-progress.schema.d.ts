import { Document, Types } from 'mongoose';
export declare class LessonProgress {
    userId: Types.ObjectId;
    courseId: Types.ObjectId;
    lessonId: Types.ObjectId;
    watchTime: number;
    lastPosition: number;
    isCompleted: boolean;
    completedAt?: Date;
}
export type LessonProgressDocument = LessonProgress & Document;
export declare const LessonProgressSchema: import("mongoose").Schema<LessonProgress, import("mongoose").Model<LessonProgress, any, any, any, (Document<unknown, any, LessonProgress, any, import("mongoose").DefaultSchemaOptions> & LessonProgress & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, LessonProgress, any, import("mongoose").DefaultSchemaOptions> & LessonProgress & {
    _id: Types.ObjectId;
} & {
    __v: number;
}), any, LessonProgress>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, LessonProgress, Document<unknown, {}, LessonProgress, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<LessonProgress & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    userId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, LessonProgress, Document<unknown, {}, LessonProgress, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<LessonProgress & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    courseId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, LessonProgress, Document<unknown, {}, LessonProgress, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<LessonProgress & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    lessonId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, LessonProgress, Document<unknown, {}, LessonProgress, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<LessonProgress & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    watchTime?: import("mongoose").SchemaDefinitionProperty<number, LessonProgress, Document<unknown, {}, LessonProgress, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<LessonProgress & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    lastPosition?: import("mongoose").SchemaDefinitionProperty<number, LessonProgress, Document<unknown, {}, LessonProgress, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<LessonProgress & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    isCompleted?: import("mongoose").SchemaDefinitionProperty<boolean, LessonProgress, Document<unknown, {}, LessonProgress, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<LessonProgress & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    completedAt?: import("mongoose").SchemaDefinitionProperty<Date | undefined, LessonProgress, Document<unknown, {}, LessonProgress, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<LessonProgress & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, LessonProgress>;
