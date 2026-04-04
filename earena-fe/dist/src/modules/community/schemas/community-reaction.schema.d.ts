import { Document, Types } from 'mongoose';
import { CommunityReactionKind, CommunityReactionTarget } from '../constants/community.constants';
export declare class CommunityReaction {
    userId: Types.ObjectId;
    targetType: CommunityReactionTarget;
    targetId: Types.ObjectId;
    kind: CommunityReactionKind;
}
export type CommunityReactionDocument = CommunityReaction & Document;
export declare const CommunityReactionSchema: import("mongoose").Schema<CommunityReaction, import("mongoose").Model<CommunityReaction, any, any, any, (Document<unknown, any, CommunityReaction, any, import("mongoose").DefaultSchemaOptions> & CommunityReaction & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, CommunityReaction, any, import("mongoose").DefaultSchemaOptions> & CommunityReaction & {
    _id: Types.ObjectId;
} & {
    __v: number;
}), any, CommunityReaction>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, CommunityReaction, Document<unknown, {}, CommunityReaction, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<CommunityReaction & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    userId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, CommunityReaction, Document<unknown, {}, CommunityReaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityReaction & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    targetType?: import("mongoose").SchemaDefinitionProperty<CommunityReactionTarget, CommunityReaction, Document<unknown, {}, CommunityReaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityReaction & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    targetId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, CommunityReaction, Document<unknown, {}, CommunityReaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityReaction & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    kind?: import("mongoose").SchemaDefinitionProperty<CommunityReactionKind, CommunityReaction, Document<unknown, {}, CommunityReaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityReaction & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, CommunityReaction>;
