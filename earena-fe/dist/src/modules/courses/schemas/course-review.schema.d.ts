import { Document, Types } from 'mongoose';
export declare class CourseReview {
    courseId: Types.ObjectId;
    userId: Types.ObjectId;
    rating: number;
    comment?: string;
    teacherReply?: string;
    repliedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
export type CourseReviewDocument = CourseReview & Document;
export declare const CourseReviewSchema: import("mongoose").Schema<CourseReview, import("mongoose").Model<CourseReview, any, any, any, (Document<unknown, any, CourseReview, any, import("mongoose").DefaultSchemaOptions> & CourseReview & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, CourseReview, any, import("mongoose").DefaultSchemaOptions> & CourseReview & {
    _id: Types.ObjectId;
} & {
    __v: number;
}), any, CourseReview>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, CourseReview, Document<unknown, {}, CourseReview, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<CourseReview & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    courseId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, CourseReview, Document<unknown, {}, CourseReview, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CourseReview & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    userId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, CourseReview, Document<unknown, {}, CourseReview, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CourseReview & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    rating?: import("mongoose").SchemaDefinitionProperty<number, CourseReview, Document<unknown, {}, CourseReview, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CourseReview & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    comment?: import("mongoose").SchemaDefinitionProperty<string | undefined, CourseReview, Document<unknown, {}, CourseReview, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CourseReview & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    teacherReply?: import("mongoose").SchemaDefinitionProperty<string | undefined, CourseReview, Document<unknown, {}, CourseReview, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CourseReview & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    repliedAt?: import("mongoose").SchemaDefinitionProperty<Date | undefined, CourseReview, Document<unknown, {}, CourseReview, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CourseReview & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    createdAt?: import("mongoose").SchemaDefinitionProperty<Date | undefined, CourseReview, Document<unknown, {}, CourseReview, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CourseReview & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    updatedAt?: import("mongoose").SchemaDefinitionProperty<Date | undefined, CourseReview, Document<unknown, {}, CourseReview, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CourseReview & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, CourseReview>;
