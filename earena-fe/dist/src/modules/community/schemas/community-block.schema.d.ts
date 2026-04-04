import { Document, Types } from 'mongoose';
export declare class CommunityBlock {
    blockerId: Types.ObjectId;
    blockedUserId: Types.ObjectId;
}
export type CommunityBlockDocument = CommunityBlock & Document;
export declare const CommunityBlockSchema: import("mongoose").Schema<CommunityBlock, import("mongoose").Model<CommunityBlock, any, any, any, (Document<unknown, any, CommunityBlock, any, import("mongoose").DefaultSchemaOptions> & CommunityBlock & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, CommunityBlock, any, import("mongoose").DefaultSchemaOptions> & CommunityBlock & {
    _id: Types.ObjectId;
} & {
    __v: number;
}), any, CommunityBlock>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, CommunityBlock, Document<unknown, {}, CommunityBlock, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<CommunityBlock & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    blockerId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, CommunityBlock, Document<unknown, {}, CommunityBlock, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityBlock & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    blockedUserId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, CommunityBlock, Document<unknown, {}, CommunityBlock, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityBlock & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, CommunityBlock>;
