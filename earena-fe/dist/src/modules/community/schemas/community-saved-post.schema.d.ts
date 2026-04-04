import { Document, Types } from 'mongoose';
export declare class CommunitySavedPost {
    userId: Types.ObjectId;
    postId: Types.ObjectId;
}
export type CommunitySavedPostDocument = CommunitySavedPost & Document;
export declare const CommunitySavedPostSchema: import("mongoose").Schema<CommunitySavedPost, import("mongoose").Model<CommunitySavedPost, any, any, any, (Document<unknown, any, CommunitySavedPost, any, import("mongoose").DefaultSchemaOptions> & CommunitySavedPost & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, CommunitySavedPost, any, import("mongoose").DefaultSchemaOptions> & CommunitySavedPost & {
    _id: Types.ObjectId;
} & {
    __v: number;
}), any, CommunitySavedPost>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, CommunitySavedPost, Document<unknown, {}, CommunitySavedPost, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<CommunitySavedPost & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    userId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, CommunitySavedPost, Document<unknown, {}, CommunitySavedPost, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunitySavedPost & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    postId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, CommunitySavedPost, Document<unknown, {}, CommunitySavedPost, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunitySavedPost & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, CommunitySavedPost>;
