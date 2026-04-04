import { Document, Types } from 'mongoose';
export declare class CommunityComment {
    postId: Types.ObjectId;
    authorId: Types.ObjectId;
    parentCommentId?: Types.ObjectId | null;
    body: string;
    attachments: {
        url: string;
        kind: 'IMAGE' | 'FILE';
        name?: string;
        mime?: string;
    }[];
    mentionedUserIds: Types.ObjectId[];
    isTeacherAnswer: boolean;
    isPinned: boolean;
    isRemoved: boolean;
    reactionCount: number;
    reactionBreakdown: Record<string, number>;
}
export type CommunityCommentDocument = CommunityComment & Document;
export declare const CommunityCommentSchema: import("mongoose").Schema<CommunityComment, import("mongoose").Model<CommunityComment, any, any, any, (Document<unknown, any, CommunityComment, any, import("mongoose").DefaultSchemaOptions> & CommunityComment & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, CommunityComment, any, import("mongoose").DefaultSchemaOptions> & CommunityComment & {
    _id: Types.ObjectId;
} & {
    __v: number;
}), any, CommunityComment>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, CommunityComment, Document<unknown, {}, CommunityComment, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<CommunityComment & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    postId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, CommunityComment, Document<unknown, {}, CommunityComment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityComment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    authorId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, CommunityComment, Document<unknown, {}, CommunityComment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityComment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    parentCommentId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | null | undefined, CommunityComment, Document<unknown, {}, CommunityComment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityComment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    body?: import("mongoose").SchemaDefinitionProperty<string, CommunityComment, Document<unknown, {}, CommunityComment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityComment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    attachments?: import("mongoose").SchemaDefinitionProperty<{
        url: string;
        kind: "IMAGE" | "FILE";
        name?: string;
        mime?: string;
    }[], CommunityComment, Document<unknown, {}, CommunityComment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityComment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    mentionedUserIds?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId[], CommunityComment, Document<unknown, {}, CommunityComment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityComment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    isTeacherAnswer?: import("mongoose").SchemaDefinitionProperty<boolean, CommunityComment, Document<unknown, {}, CommunityComment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityComment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    isPinned?: import("mongoose").SchemaDefinitionProperty<boolean, CommunityComment, Document<unknown, {}, CommunityComment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityComment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    isRemoved?: import("mongoose").SchemaDefinitionProperty<boolean, CommunityComment, Document<unknown, {}, CommunityComment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityComment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    reactionCount?: import("mongoose").SchemaDefinitionProperty<number, CommunityComment, Document<unknown, {}, CommunityComment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityComment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    reactionBreakdown?: import("mongoose").SchemaDefinitionProperty<Record<string, number>, CommunityComment, Document<unknown, {}, CommunityComment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityComment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, CommunityComment>;
