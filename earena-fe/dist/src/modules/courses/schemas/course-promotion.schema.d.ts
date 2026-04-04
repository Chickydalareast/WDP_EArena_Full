import { Document, Types } from 'mongoose';
export type CoursePromotionDocument = CoursePromotion & Document;
export declare class CoursePromotion {
    courseId: Types.ObjectId;
    teacherId: Types.ObjectId;
    expiresAt: Date;
    amountPaid: number;
    durationDays: number;
}
export declare const CoursePromotionSchema: import("mongoose").Schema<CoursePromotion, import("mongoose").Model<CoursePromotion, any, any, any, (Document<unknown, any, CoursePromotion, any, import("mongoose").DefaultSchemaOptions> & CoursePromotion & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, CoursePromotion, any, import("mongoose").DefaultSchemaOptions> & CoursePromotion & {
    _id: Types.ObjectId;
} & {
    __v: number;
}), any, CoursePromotion>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, CoursePromotion, Document<unknown, {}, CoursePromotion, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<CoursePromotion & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    courseId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, CoursePromotion, Document<unknown, {}, CoursePromotion, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CoursePromotion & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    teacherId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, CoursePromotion, Document<unknown, {}, CoursePromotion, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CoursePromotion & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    expiresAt?: import("mongoose").SchemaDefinitionProperty<Date, CoursePromotion, Document<unknown, {}, CoursePromotion, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CoursePromotion & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    amountPaid?: import("mongoose").SchemaDefinitionProperty<number, CoursePromotion, Document<unknown, {}, CoursePromotion, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CoursePromotion & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    durationDays?: import("mongoose").SchemaDefinitionProperty<number, CoursePromotion, Document<unknown, {}, CoursePromotion, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CoursePromotion & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, CoursePromotion>;
