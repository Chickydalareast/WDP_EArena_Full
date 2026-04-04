import { Document, Types } from 'mongoose';
export declare enum EnrollmentStatus {
    ACTIVE = "ACTIVE",
    EXPIRED = "EXPIRED",
    BANNED = "BANNED"
}
export declare class Enrollment {
    userId: Types.ObjectId;
    courseId: Types.ObjectId;
    status: EnrollmentStatus;
    completedLessons: Types.ObjectId[];
    progress: number;
}
export type EnrollmentDocument = Enrollment & Document;
export declare const EnrollmentSchema: import("mongoose").Schema<Enrollment, import("mongoose").Model<Enrollment, any, any, any, (Document<unknown, any, Enrollment, any, import("mongoose").DefaultSchemaOptions> & Enrollment & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, Enrollment, any, import("mongoose").DefaultSchemaOptions> & Enrollment & {
    _id: Types.ObjectId;
} & {
    __v: number;
}), any, Enrollment>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Enrollment, Document<unknown, {}, Enrollment, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Enrollment & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    userId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Enrollment, Document<unknown, {}, Enrollment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Enrollment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    courseId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Enrollment, Document<unknown, {}, Enrollment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Enrollment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<EnrollmentStatus, Enrollment, Document<unknown, {}, Enrollment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Enrollment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    completedLessons?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId[], Enrollment, Document<unknown, {}, Enrollment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Enrollment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    progress?: import("mongoose").SchemaDefinitionProperty<number, Enrollment, Document<unknown, {}, Enrollment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Enrollment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Enrollment>;
