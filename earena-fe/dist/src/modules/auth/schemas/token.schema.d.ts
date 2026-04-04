import { Document, Types } from 'mongoose';
export declare class Token extends Document {
    token: string;
    userId: Types.ObjectId;
    type: string;
    expiresAt: Date;
}
export declare const TokenSchema: import("mongoose").Schema<Token, import("mongoose").Model<Token, any, any, any, (Document<unknown, any, Token, any, import("mongoose").DefaultSchemaOptions> & Token & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, Token, any, import("mongoose").DefaultSchemaOptions> & Token & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}), any, Token>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Token, Document<unknown, {}, Token, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Token & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    type?: import("mongoose").SchemaDefinitionProperty<string, Token, Document<unknown, {}, Token, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Token & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    _id?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Token, Document<unknown, {}, Token, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Token & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    userId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Token, Document<unknown, {}, Token, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Token & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    token?: import("mongoose").SchemaDefinitionProperty<string, Token, Document<unknown, {}, Token, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Token & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    expiresAt?: import("mongoose").SchemaDefinitionProperty<Date, Token, Document<unknown, {}, Token, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Token & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Token>;
