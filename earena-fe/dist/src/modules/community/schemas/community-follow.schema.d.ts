import { Document, Types } from 'mongoose';
import { CommunityFollowTarget } from '../constants/community.constants';
export declare class CommunityFollow {
    followerId: Types.ObjectId;
    targetType: CommunityFollowTarget;
    targetId: Types.ObjectId;
}
export type CommunityFollowDocument = CommunityFollow & Document;
export declare const CommunityFollowSchema: import("mongoose").Schema<CommunityFollow, import("mongoose").Model<CommunityFollow, any, any, any, (Document<unknown, any, CommunityFollow, any, import("mongoose").DefaultSchemaOptions> & CommunityFollow & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, CommunityFollow, any, import("mongoose").DefaultSchemaOptions> & CommunityFollow & {
    _id: Types.ObjectId;
} & {
    __v: number;
}), any, CommunityFollow>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, CommunityFollow, Document<unknown, {}, CommunityFollow, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<CommunityFollow & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    followerId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, CommunityFollow, Document<unknown, {}, CommunityFollow, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityFollow & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    targetType?: import("mongoose").SchemaDefinitionProperty<CommunityFollowTarget, CommunityFollow, Document<unknown, {}, CommunityFollow, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityFollow & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    targetId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, CommunityFollow, Document<unknown, {}, CommunityFollow, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityFollow & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, CommunityFollow>;
