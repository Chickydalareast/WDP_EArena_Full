import { Document, Schema as MongooseSchema, Types } from 'mongoose';
export type ClassDocument = Class & Document;
export declare class Class {
    name: string;
    description: string;
    code: string;
    teacherId: Types.ObjectId;
    coverImageUrl: string;
    isLocked: boolean;
    isPublic: boolean;
}
export declare const ClassSchema: MongooseSchema<Class, import("mongoose").Model<Class, any, any, any, (Document<unknown, any, Class, any, import("mongoose").DefaultSchemaOptions> & Class & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, Class, any, import("mongoose").DefaultSchemaOptions> & Class & {
    _id: Types.ObjectId;
} & {
    __v: number;
}), any, Class>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Class, Document<unknown, {}, Class, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Class & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    name?: import("mongoose").SchemaDefinitionProperty<string, Class, Document<unknown, {}, Class, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Class & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    description?: import("mongoose").SchemaDefinitionProperty<string, Class, Document<unknown, {}, Class, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Class & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    code?: import("mongoose").SchemaDefinitionProperty<string, Class, Document<unknown, {}, Class, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Class & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    teacherId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Class, Document<unknown, {}, Class, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Class & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    coverImageUrl?: import("mongoose").SchemaDefinitionProperty<string, Class, Document<unknown, {}, Class, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Class & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    isLocked?: import("mongoose").SchemaDefinitionProperty<boolean, Class, Document<unknown, {}, Class, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Class & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    isPublic?: import("mongoose").SchemaDefinitionProperty<boolean, Class, Document<unknown, {}, Class, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Class & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Class>;
