import { Document, Schema as MongooseSchema, Types } from 'mongoose';
export type ClassMemberDocument = ClassMember & Document;
export declare enum JoinStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED"
}
export declare class ClassMember {
    classId: Types.ObjectId;
    studentId: Types.ObjectId;
    status: JoinStatus;
}
export declare const ClassMemberSchema: MongooseSchema<ClassMember, import("mongoose").Model<ClassMember, any, any, any, (Document<unknown, any, ClassMember, any, import("mongoose").DefaultSchemaOptions> & ClassMember & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, ClassMember, any, import("mongoose").DefaultSchemaOptions> & ClassMember & {
    _id: Types.ObjectId;
} & {
    __v: number;
}), any, ClassMember>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ClassMember, Document<unknown, {}, ClassMember, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<ClassMember & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    classId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, ClassMember, Document<unknown, {}, ClassMember, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ClassMember & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    studentId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, ClassMember, Document<unknown, {}, ClassMember, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ClassMember & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<JoinStatus, ClassMember, Document<unknown, {}, ClassMember, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ClassMember & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, ClassMember>;
