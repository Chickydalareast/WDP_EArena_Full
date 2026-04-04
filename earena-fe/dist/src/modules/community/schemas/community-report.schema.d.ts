import { Document, Types } from 'mongoose';
import { CommunityReportStatus, CommunityReportTarget } from '../constants/community.constants';
export declare class CommunityReport {
    reporterId: Types.ObjectId;
    targetType: CommunityReportTarget;
    targetId: Types.ObjectId;
    postId?: Types.ObjectId;
    reason: string;
    status: CommunityReportStatus;
    resolvedBy?: Types.ObjectId | null;
    resolutionNote?: string;
}
export type CommunityReportDocument = CommunityReport & Document;
export declare const CommunityReportSchema: import("mongoose").Schema<CommunityReport, import("mongoose").Model<CommunityReport, any, any, any, (Document<unknown, any, CommunityReport, any, import("mongoose").DefaultSchemaOptions> & CommunityReport & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, CommunityReport, any, import("mongoose").DefaultSchemaOptions> & CommunityReport & {
    _id: Types.ObjectId;
} & {
    __v: number;
}), any, CommunityReport>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, CommunityReport, Document<unknown, {}, CommunityReport, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<CommunityReport & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    reporterId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, CommunityReport, Document<unknown, {}, CommunityReport, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityReport & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    targetType?: import("mongoose").SchemaDefinitionProperty<CommunityReportTarget, CommunityReport, Document<unknown, {}, CommunityReport, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityReport & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    targetId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, CommunityReport, Document<unknown, {}, CommunityReport, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityReport & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    postId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | undefined, CommunityReport, Document<unknown, {}, CommunityReport, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityReport & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    reason?: import("mongoose").SchemaDefinitionProperty<string, CommunityReport, Document<unknown, {}, CommunityReport, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityReport & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<CommunityReportStatus, CommunityReport, Document<unknown, {}, CommunityReport, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityReport & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    resolvedBy?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | null | undefined, CommunityReport, Document<unknown, {}, CommunityReport, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityReport & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    resolutionNote?: import("mongoose").SchemaDefinitionProperty<string | undefined, CommunityReport, Document<unknown, {}, CommunityReport, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityReport & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, CommunityReport>;
