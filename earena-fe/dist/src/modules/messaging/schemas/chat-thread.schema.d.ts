import { Document, Types } from 'mongoose';
export type ChatThreadDocument = ChatThread & Document;
export declare class ChatThread {
    userLowId: Types.ObjectId;
    userHighId: Types.ObjectId;
    lastMessageAt: Date;
    lastMessageSenderId?: Types.ObjectId;
    readAtLow?: Date;
    readAtHigh?: Date;
}
export declare const ChatThreadSchema: import("mongoose").Schema<ChatThread, import("mongoose").Model<ChatThread, any, any, any, (Document<unknown, any, ChatThread, any, import("mongoose").DefaultSchemaOptions> & ChatThread & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, ChatThread, any, import("mongoose").DefaultSchemaOptions> & ChatThread & {
    _id: Types.ObjectId;
} & {
    __v: number;
}), any, ChatThread>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ChatThread, Document<unknown, {}, ChatThread, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<ChatThread & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    userLowId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, ChatThread, Document<unknown, {}, ChatThread, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChatThread & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    userHighId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, ChatThread, Document<unknown, {}, ChatThread, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChatThread & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    lastMessageAt?: import("mongoose").SchemaDefinitionProperty<Date, ChatThread, Document<unknown, {}, ChatThread, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChatThread & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    lastMessageSenderId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | undefined, ChatThread, Document<unknown, {}, ChatThread, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChatThread & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    readAtLow?: import("mongoose").SchemaDefinitionProperty<Date | undefined, ChatThread, Document<unknown, {}, ChatThread, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChatThread & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    readAtHigh?: import("mongoose").SchemaDefinitionProperty<Date | undefined, ChatThread, Document<unknown, {}, ChatThread, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChatThread & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, ChatThread>;
