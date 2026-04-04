import { Document, Schema as MongooseSchema, Types } from 'mongoose';
export declare enum WalletStatus {
    ACTIVE = "ACTIVE",
    FROZEN = "FROZEN"
}
export type WalletDocument = Wallet & Document;
export declare class Wallet {
    userId: Types.ObjectId;
    balance: number;
    status: WalletStatus;
}
export declare const WalletSchema: MongooseSchema<Wallet, import("mongoose").Model<Wallet, any, any, any, (Document<unknown, any, Wallet, any, import("mongoose").DefaultSchemaOptions> & Wallet & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, Wallet, any, import("mongoose").DefaultSchemaOptions> & Wallet & {
    _id: Types.ObjectId;
} & {
    __v: number;
}), any, Wallet>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Wallet, Document<unknown, {}, Wallet, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Wallet & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    userId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Wallet, Document<unknown, {}, Wallet, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Wallet & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    balance?: import("mongoose").SchemaDefinitionProperty<number, Wallet, Document<unknown, {}, Wallet, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Wallet & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<WalletStatus, Wallet, Document<unknown, {}, Wallet, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Wallet & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Wallet>;
