import { Document, Schema as MongooseSchema, Types } from 'mongoose';
export type SubscriptionTransactionDocument = SubscriptionTransaction & Document;
export declare enum TransactionStatus {
    PENDING = "PENDING",
    PAID = "PAID",
    REFUNDED = "REFUNDED"
}
export declare enum BillingCycle {
    MONTHLY = "MONTHLY",
    YEARLY = "YEARLY"
}
export declare class SubscriptionTransaction {
    userId: Types.ObjectId;
    planId: Types.ObjectId;
    billingCycle: BillingCycle;
    baseAmount: number;
    proratedDiscount: number;
    finalAmount: number;
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
    billingCycle?: import("mongoose").SchemaDefinitionProperty<BillingCycle, SubscriptionTransaction, Document<unknown, {}, SubscriptionTransaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SubscriptionTransaction & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    baseAmount?: import("mongoose").SchemaDefinitionProperty<number, SubscriptionTransaction, Document<unknown, {}, SubscriptionTransaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SubscriptionTransaction & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    proratedDiscount?: import("mongoose").SchemaDefinitionProperty<number, SubscriptionTransaction, Document<unknown, {}, SubscriptionTransaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<SubscriptionTransaction & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    finalAmount?: import("mongoose").SchemaDefinitionProperty<number, SubscriptionTransaction, Document<unknown, {}, SubscriptionTransaction, {
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
