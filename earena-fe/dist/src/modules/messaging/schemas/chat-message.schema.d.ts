import { Document, Types } from 'mongoose';
export type ChatMessageDocument = ChatMessage & Document;
export declare class ChatMessage {
    threadId: Types.ObjectId;
    senderId: Types.ObjectId;
    body?: string;
    imageUrls: string[];
    shareCourseId?: Types.ObjectId;
}
export declare const ChatMessageSchema: import("mongoose").Schema<ChatMessage, import("mongoose").Model<ChatMessage, any, any, any, (Document<unknown, any, ChatMessage, any, import("mongoose").DefaultSchemaOptions> & ChatMessage & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, ChatMessage, any, import("mongoose").DefaultSchemaOptions> & ChatMessage & {
    _id: Types.ObjectId;
} & {
    __v: number;
}), any, ChatMessage>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ChatMessage, Document<unknown, {}, ChatMessage, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<ChatMessage & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    threadId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, ChatMessage, Document<unknown, {}, ChatMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChatMessage & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    senderId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, ChatMessage, Document<unknown, {}, ChatMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChatMessage & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    body?: import("mongoose").SchemaDefinitionProperty<string | undefined, ChatMessage, Document<unknown, {}, ChatMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChatMessage & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    imageUrls?: import("mongoose").SchemaDefinitionProperty<string[], ChatMessage, Document<unknown, {}, ChatMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChatMessage & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    shareCourseId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | undefined, ChatMessage, Document<unknown, {}, ChatMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChatMessage & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, ChatMessage>;
