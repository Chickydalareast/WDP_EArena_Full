import { Document } from 'mongoose';
export type SubjectDocument = Subject & Document;
export declare class Subject {
    name: string;
    code: string;
    isActive: boolean;
}
export declare const SubjectSchema: import("mongoose").Schema<Subject, import("mongoose").Model<Subject, any, any, any, (Document<unknown, any, Subject, any, import("mongoose").DefaultSchemaOptions> & Subject & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, Subject, any, import("mongoose").DefaultSchemaOptions> & Subject & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}), any, Subject>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Subject, Document<unknown, {}, Subject, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Subject & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    name?: import("mongoose").SchemaDefinitionProperty<string, Subject, Document<unknown, {}, Subject, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Subject & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    code?: import("mongoose").SchemaDefinitionProperty<string, Subject, Document<unknown, {}, Subject, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Subject & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    isActive?: import("mongoose").SchemaDefinitionProperty<boolean, Subject, Document<unknown, {}, Subject, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Subject & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Subject>;
