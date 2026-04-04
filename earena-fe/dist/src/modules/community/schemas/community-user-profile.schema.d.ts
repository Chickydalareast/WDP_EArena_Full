import { Document, Types } from 'mongoose';
import { CommunityUserCommunityStatus } from '../constants/community.constants';
export declare class CommunityUserProfile {
    userId: Types.ObjectId;
    reputation: number;
    badges: string[];
    postsCount: number;
    commentsCount: number;
    helpfulReceived: number;
    savesReceived: number;
    communityStatus: CommunityUserCommunityStatus;
    mutedUntil?: Date | null;
    moderationNote?: string;
    lastDigestNotifiedAt?: Date | null;
}
export type CommunityUserProfileDocument = CommunityUserProfile & Document;
export declare const CommunityUserProfileSchema: import("mongoose").Schema<CommunityUserProfile, import("mongoose").Model<CommunityUserProfile, any, any, any, (Document<unknown, any, CommunityUserProfile, any, import("mongoose").DefaultSchemaOptions> & CommunityUserProfile & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, CommunityUserProfile, any, import("mongoose").DefaultSchemaOptions> & CommunityUserProfile & {
    _id: Types.ObjectId;
} & {
    __v: number;
}), any, CommunityUserProfile>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, CommunityUserProfile, Document<unknown, {}, CommunityUserProfile, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<CommunityUserProfile & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    userId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, CommunityUserProfile, Document<unknown, {}, CommunityUserProfile, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityUserProfile & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    reputation?: import("mongoose").SchemaDefinitionProperty<number, CommunityUserProfile, Document<unknown, {}, CommunityUserProfile, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityUserProfile & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    badges?: import("mongoose").SchemaDefinitionProperty<string[], CommunityUserProfile, Document<unknown, {}, CommunityUserProfile, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityUserProfile & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    postsCount?: import("mongoose").SchemaDefinitionProperty<number, CommunityUserProfile, Document<unknown, {}, CommunityUserProfile, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityUserProfile & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    commentsCount?: import("mongoose").SchemaDefinitionProperty<number, CommunityUserProfile, Document<unknown, {}, CommunityUserProfile, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityUserProfile & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    helpfulReceived?: import("mongoose").SchemaDefinitionProperty<number, CommunityUserProfile, Document<unknown, {}, CommunityUserProfile, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityUserProfile & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    savesReceived?: import("mongoose").SchemaDefinitionProperty<number, CommunityUserProfile, Document<unknown, {}, CommunityUserProfile, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityUserProfile & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    communityStatus?: import("mongoose").SchemaDefinitionProperty<CommunityUserCommunityStatus, CommunityUserProfile, Document<unknown, {}, CommunityUserProfile, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityUserProfile & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    mutedUntil?: import("mongoose").SchemaDefinitionProperty<Date | null | undefined, CommunityUserProfile, Document<unknown, {}, CommunityUserProfile, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityUserProfile & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    moderationNote?: import("mongoose").SchemaDefinitionProperty<string | undefined, CommunityUserProfile, Document<unknown, {}, CommunityUserProfile, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityUserProfile & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    lastDigestNotifiedAt?: import("mongoose").SchemaDefinitionProperty<Date | null | undefined, CommunityUserProfile, Document<unknown, {}, CommunityUserProfile, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityUserProfile & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, CommunityUserProfile>;
