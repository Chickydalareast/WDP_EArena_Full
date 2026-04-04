import { Document, Types } from 'mongoose';
import { CommunityPostStatus, CommunityPostType } from '../constants/community.constants';
export declare class CommunityCourseSnapshot {
    courseId: Types.ObjectId;
    title: string;
    slug: string;
    coverUrl?: string;
    price: number;
    discountPrice?: number;
    teacherName: string;
    teacherId: Types.ObjectId;
    averageRating: number;
    totalReviews: number;
}
export declare class CommunityPost {
    authorId: Types.ObjectId;
    type: CommunityPostType;
    status: CommunityPostStatus;
    bodyJson: string;
    bodyPlain: string;
    attachments: {
        url: string;
        kind: 'IMAGE' | 'FILE';
        name?: string;
        mime?: string;
    }[];
    tags: string[];
    subjectId?: Types.ObjectId;
    courseId?: Types.ObjectId;
    examId?: Types.ObjectId;
    courseSnapshot?: CommunityCourseSnapshot;
    commentCount: number;
    reactionCount: number;
    saveCount: number;
    reactionBreakdown: Record<string, number>;
    hotScore: number;
    bestAnswerCommentId?: Types.ObjectId | null;
    pinnedCommentId?: Types.ObjectId | null;
    isFeatured: boolean;
    commentsLocked: boolean;
}
export type CommunityPostDocument = CommunityPost & Document;
export declare const CommunityPostSchema: import("mongoose").Schema<CommunityPost, import("mongoose").Model<CommunityPost, any, any, any, (Document<unknown, any, CommunityPost, any, import("mongoose").DefaultSchemaOptions> & CommunityPost & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, CommunityPost, any, import("mongoose").DefaultSchemaOptions> & CommunityPost & {
    _id: Types.ObjectId;
} & {
    __v: number;
}), any, CommunityPost>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, CommunityPost, Document<unknown, {}, CommunityPost, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<CommunityPost & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    authorId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, CommunityPost, Document<unknown, {}, CommunityPost, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityPost & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    type?: import("mongoose").SchemaDefinitionProperty<CommunityPostType, CommunityPost, Document<unknown, {}, CommunityPost, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityPost & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<CommunityPostStatus, CommunityPost, Document<unknown, {}, CommunityPost, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityPost & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    bodyJson?: import("mongoose").SchemaDefinitionProperty<string, CommunityPost, Document<unknown, {}, CommunityPost, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityPost & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    bodyPlain?: import("mongoose").SchemaDefinitionProperty<string, CommunityPost, Document<unknown, {}, CommunityPost, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityPost & {
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
    }[], CommunityPost, Document<unknown, {}, CommunityPost, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityPost & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    tags?: import("mongoose").SchemaDefinitionProperty<string[], CommunityPost, Document<unknown, {}, CommunityPost, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityPost & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    subjectId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | undefined, CommunityPost, Document<unknown, {}, CommunityPost, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityPost & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    courseId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | undefined, CommunityPost, Document<unknown, {}, CommunityPost, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityPost & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    examId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | undefined, CommunityPost, Document<unknown, {}, CommunityPost, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityPost & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    courseSnapshot?: import("mongoose").SchemaDefinitionProperty<CommunityCourseSnapshot | undefined, CommunityPost, Document<unknown, {}, CommunityPost, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityPost & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    commentCount?: import("mongoose").SchemaDefinitionProperty<number, CommunityPost, Document<unknown, {}, CommunityPost, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityPost & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    reactionCount?: import("mongoose").SchemaDefinitionProperty<number, CommunityPost, Document<unknown, {}, CommunityPost, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityPost & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    saveCount?: import("mongoose").SchemaDefinitionProperty<number, CommunityPost, Document<unknown, {}, CommunityPost, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityPost & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    reactionBreakdown?: import("mongoose").SchemaDefinitionProperty<Record<string, number>, CommunityPost, Document<unknown, {}, CommunityPost, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityPost & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    hotScore?: import("mongoose").SchemaDefinitionProperty<number, CommunityPost, Document<unknown, {}, CommunityPost, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityPost & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    bestAnswerCommentId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | null | undefined, CommunityPost, Document<unknown, {}, CommunityPost, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityPost & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    pinnedCommentId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | null | undefined, CommunityPost, Document<unknown, {}, CommunityPost, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityPost & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    isFeatured?: import("mongoose").SchemaDefinitionProperty<boolean, CommunityPost, Document<unknown, {}, CommunityPost, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityPost & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    commentsLocked?: import("mongoose").SchemaDefinitionProperty<boolean, CommunityPost, Document<unknown, {}, CommunityPost, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CommunityPost & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, CommunityPost>;
