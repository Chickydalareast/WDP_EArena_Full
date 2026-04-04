import { Document, Schema as MongooseSchema, Types } from 'mongoose';
export type SubscriptionTransactionDocument = SubscriptionTransaction & Document;
export declare enum TransactionStatus {
    PENDING = "PENDING",
    PAID = "PAID",
    REFUNDED = "REFUNDED"
}
export declare class SubscriptionTransaction {
    userId: Types.ObjectId;
    planId: Types.ObjectId;
    amount: number;
    currency: string;
    status: TransactionStatus;
}
export declare const SubscriptionTransactionSchema: MongooseSchema<SubscriptionTransaction, import("mongoose").Model<SubscriptionTransaction, any, any, any, (Document<unknown, any, SubscriptionTransaction, any, import("mongoose").DefaultSchemaOptions> & SubscriptionTransaction & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, SubscriptionTransaction, any, import("mongoose").DefaultSchemaOptions> & SubscriptionTransaction & {
    _id: Types.ObjectId;
} & {
    __v: number;
}), any, SubscriptionTransaction>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, SubscriptionTransaction, Document<unknown, {}, SubscriptionTransaction, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<SubscriptionTransaction & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    userId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, SubscriptionTransaction, Document<unknown, {}, SubscriptionTransaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SubscriptionTransaction & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    planId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, SubscriptionTransaction, Document<unknown, {}, SubscriptionTransaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SubscriptionTransaction & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    amount?: import("mongoose").SchemaDefinitionProperty<number, SubscriptionTransaction, Document<unknown, {}, SubscriptionTransaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SubscriptionTransaction & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    currency?: import("mongoose").SchemaDefinitionProperty<string, SubscriptionTransaction, Document<unknown, {}, SubscriptionTransaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SubscriptionTransaction & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<TransactionStatus, SubscriptionTransaction, Document<unknown, {}, SubscriptionTransaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SubscriptionTransaction & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, SubscriptionTransaction>;
