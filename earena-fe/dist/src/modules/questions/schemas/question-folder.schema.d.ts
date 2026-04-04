import { Document, Schema as MongooseSchema, Types } from 'mongoose';
export type QuestionFolderDocument = QuestionFolder & Document;
export declare class QuestionFolder {
    name: string;
    description: string;
    ownerId: Types.ObjectId;
    parentId: Types.ObjectId | null;
    ancestors: Types.ObjectId[];
}
export declare const QuestionFolderSchema: MongooseSchema<QuestionFolder, import("mongoose").Model<QuestionFolder, any, any, any, (Document<unknown, any, QuestionFolder, any, import("mongoose").DefaultSchemaOptions> & QuestionFolder & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, QuestionFolder, any, import("mongoose").DefaultSchemaOptions> & QuestionFolder & {
    _id: Types.ObjectId;
} & {
    __v: number;
}), any, QuestionFolder>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, QuestionFolder, Document<unknown, {}, QuestionFolder, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<QuestionFolder & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    name?: import("mongoose").SchemaDefinitionProperty<string, QuestionFolder, Document<unknown, {}, QuestionFolder, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QuestionFolder & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    description?: import("mongoose").SchemaDefinitionProperty<string, QuestionFolder, Document<unknown, {}, QuestionFolder, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QuestionFolder & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    ownerId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, QuestionFolder, Document<unknown, {}, QuestionFolder, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QuestionFolder & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    parentId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | null, QuestionFolder, Document<unknown, {}, QuestionFolder, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QuestionFolder & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    ancestors?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId[], QuestionFolder, Document<unknown, {}, QuestionFolder, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QuestionFolder & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, QuestionFolder>;
