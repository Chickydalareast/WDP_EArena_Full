import { Document, Schema as MongooseSchema, Types } from 'mongoose';
export type WalletTransactionDocument = WalletTransaction & Document;
export declare enum TransactionType {
    DEPOSIT = "DEPOSIT",
    PAYMENT = "PAYMENT",
    REVENUE = "REVENUE",
    REFUND = "REFUND",
    WITHDRAWAL = "WITHDRAWAL"
}
export declare enum ReferenceType {
    COURSE = "COURSE",
    EXAM = "EXAM",
    ORDER = "ORDER",
    COURSE_PROMOTION = "COURSE_PROMOTION"
}
export declare class WalletTransaction {
    walletId: Types.ObjectId;
    type: TransactionType;
    amount: number;
    postBalance: number;
    description: string;
    referenceId?: Types.ObjectId;
    referenceType?: ReferenceType;
}
export declare const WalletTransactionSchema: MongooseSchema<WalletTransaction, import("mongoose").Model<WalletTransaction, any, any, any, (Document<unknown, any, WalletTransaction, any, import("mongoose").DefaultSchemaOptions> & WalletTransaction & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, WalletTransaction, any, import("mongoose").DefaultSchemaOptions> & WalletTransaction & {
    _id: Types.ObjectId;
} & {
    __v: number;
}), any, WalletTransaction>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, WalletTransaction, Document<unknown, {}, WalletTransaction, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<WalletTransaction & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    walletId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, WalletTransaction, Document<unknown, {}, WalletTransaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<WalletTransaction & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    type?: import("mongoose").SchemaDefinitionProperty<TransactionType, WalletTransaction, Document<unknown, {}, WalletTransaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<WalletTransaction & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    amount?: import("mongoose").SchemaDefinitionProperty<number, WalletTransaction, Document<unknown, {}, WalletTransaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<WalletTransaction & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    postBalance?: import("mongoose").SchemaDefinitionProperty<number, WalletTransaction, Document<unknown, {}, WalletTransaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<WalletTransaction & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    description?: import("mongoose").SchemaDefinitionProperty<string, WalletTransaction, Document<unknown, {}, WalletTransaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<WalletTransaction & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    referenceId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | undefined, WalletTransaction, Document<unknown, {}, WalletTransaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<WalletTransaction & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    referenceType?: import("mongoose").SchemaDefinitionProperty<ReferenceType | undefined, WalletTransaction, Document<unknown, {}, WalletTransaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<WalletTransaction & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, WalletTransaction>;
