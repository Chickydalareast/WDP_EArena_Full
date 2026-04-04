import { Document, Types } from 'mongoose';
export type MediaDocument = Media & Document;
export declare enum MediaContext {
    AVATAR = "avatar",
    COURSE_THUMBNAIL = "course_thumbnail",
    LESSON_VIDEO = "lesson_video",
    LESSON_DOCUMENT = "lesson_document",
    QUESTION = "question",
    GENERAL = "general"
}
export declare enum MediaProvider {
    CLOUDINARY = "CLOUDINARY",
    GOOGLE_DRIVE = "GOOGLE_DRIVE",
    YOUTUBE = "YOUTUBE",
    FIREBASE = "FIREBASE"
}
export declare enum MediaStatus {
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    READY = "READY",
    FAILED = "FAILED"
}
export declare class Media {
    originalName: string;
    publicId: string;
    url: string;
    provider: MediaProvider;
    status: MediaStatus;
    mimetype: string;
    size: number;
    width?: number;
    height?: number;
    blurHash?: string;
    duration?: number;
    uploadedBy: Types.ObjectId;
    context: MediaContext;
}
export declare const MediaSchema: import("mongoose").Schema<Media, import("mongoose").Model<Media, any, any, any, (Document<unknown, any, Media, any, import("mongoose").DefaultSchemaOptions> & Media & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, Media, any, import("mongoose").DefaultSchemaOptions> & Media & {
    _id: Types.ObjectId;
} & {
    __v: number;
}), any, Media>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Media, Document<unknown, {}, Media, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Media & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    originalName?: import("mongoose").SchemaDefinitionProperty<string, Media, Document<unknown, {}, Media, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Media & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    publicId?: import("mongoose").SchemaDefinitionProperty<string, Media, Document<unknown, {}, Media, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Media & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    url?: import("mongoose").SchemaDefinitionProperty<string, Media, Document<unknown, {}, Media, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Media & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    provider?: import("mongoose").SchemaDefinitionProperty<MediaProvider, Media, Document<unknown, {}, Media, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Media & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<MediaStatus, Media, Document<unknown, {}, Media, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Media & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    mimetype?: import("mongoose").SchemaDefinitionProperty<string, Media, Document<unknown, {}, Media, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Media & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    size?: import("mongoose").SchemaDefinitionProperty<number, Media, Document<unknown, {}, Media, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Media & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    width?: import("mongoose").SchemaDefinitionProperty<number | undefined, Media, Document<unknown, {}, Media, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Media & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    height?: import("mongoose").SchemaDefinitionProperty<number | undefined, Media, Document<unknown, {}, Media, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Media & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    blurHash?: import("mongoose").SchemaDefinitionProperty<string | undefined, Media, Document<unknown, {}, Media, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Media & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    duration?: import("mongoose").SchemaDefinitionProperty<number | undefined, Media, Document<unknown, {}, Media, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Media & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    uploadedBy?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Media, Document<unknown, {}, Media, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Media & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    context?: import("mongoose").SchemaDefinitionProperty<MediaContext, Media, Document<unknown, {}, Media, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Media & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Media>;
