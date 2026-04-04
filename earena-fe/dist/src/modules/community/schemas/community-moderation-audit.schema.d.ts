import { Document, Types } from 'mongoose';
export declare class CommunityModerationAudit {
    actorId: Types.ObjectId;
    action: string;
    targetType?: string;
    targetId?: Types.ObjectId;
    meta: Record<string, unknown>;
}
export type CommunityModerationAuditDocument = CommunityModerationAudit & Document;
export declare const CommunityModerationAuditSchema: import("mongoose").Schema<CommunityModerationAudit, import("mongoose").Model<CommunityModerationAudit, any, any, any, (Document<unknown, any, CommunityModerationAudit, any, import("mongoose").DefaultSchemaOptions> & CommunityModerationAudit & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, CommunityModerationAudit, any, import("mongoose").DefaultSchemaOptions> & CommunityModerationAudit & {
    _id: Types.ObjectId;
} & {
    __v: number;
}), any, CommunityModerationAudit>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, CommunityModerationAudit, Document<unknown, {}, CommunityModerationAudit, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<CommunityModerationAudit & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    actorId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, CommunityModerationAudit, Document<unknown, {}, CommunityModerationAudit, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityModerationAudit & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    action?: import("mongoose").SchemaDefinitionProperty<string, CommunityModerationAudit, Document<unknown, {}, CommunityModerationAudit, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityModerationAudit & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    targetType?: import("mongoose").SchemaDefinitionProperty<string | undefined, CommunityModerationAudit, Document<unknown, {}, CommunityModerationAudit, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityModerationAudit & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    targetId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | undefined, CommunityModerationAudit, Document<unknown, {}, CommunityModerationAudit, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityModerationAudit & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    meta?: import("mongoose").SchemaDefinitionProperty<Record<string, unknown>, CommunityModerationAudit, Document<unknown, {}, CommunityModerationAudit, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityModerationAudit & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, CommunityModerationAudit>;
