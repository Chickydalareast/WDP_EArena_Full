import { Document, Schema as MongooseSchema, Types } from 'mongoose';
export type WithdrawalRequestDocument = WithdrawalRequest & Document;
export declare enum WithdrawalStatus {
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    COMPLETED = "COMPLETED",
    REJECTED = "REJECTED"
}
export declare class BankDetail {
    bankName: string;
    accountNumber: string;
    accountName: string;
}
export declare class WithdrawalRequest {
    teacherId: Types.ObjectId;
    amount: number;
    bankInfo: BankDetail;
    status: WithdrawalStatus;
    processedBy?: Types.ObjectId;
    processedAt?: Date;
    rejectionReason?: string;
    transactionId?: Types.ObjectId;
}
export declare const WithdrawalRequestSchema: MongooseSchema<WithdrawalRequest, import("mongoose").Model<WithdrawalRequest, any, any, any, (Document<unknown, any, WithdrawalRequest, any, import("mongoose").DefaultSchemaOptions> & WithdrawalRequest & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, WithdrawalRequest, any, import("mongoose").DefaultSchemaOptions> & WithdrawalRequest & {
    _id: Types.ObjectId;
} & {
    __v: number;
}), any, WithdrawalRequest>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, WithdrawalRequest, Document<unknown, {}, WithdrawalRequest, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<WithdrawalRequest & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    teacherId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, WithdrawalRequest, Document<unknown, {}, WithdrawalRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<WithdrawalRequest & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    amount?: import("mongoose").SchemaDefinitionProperty<number, WithdrawalRequest, Document<unknown, {}, WithdrawalRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<WithdrawalRequest & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    bankInfo?: import("mongoose").SchemaDefinitionProperty<BankDetail, WithdrawalRequest, Document<unknown, {}, WithdrawalRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<WithdrawalRequest & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<WithdrawalStatus, WithdrawalRequest, Document<unknown, {}, WithdrawalRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<WithdrawalRequest & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    processedBy?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | undefined, WithdrawalRequest, Document<unknown, {}, WithdrawalRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<WithdrawalRequest & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    processedAt?: import("mongoose").SchemaDefinitionProperty<Date | undefined, WithdrawalRequest, Document<unknown, {}, WithdrawalRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<WithdrawalRequest & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    rejectionReason?: import("mongoose").SchemaDefinitionProperty<string | undefined, WithdrawalRequest, Document<unknown, {}, WithdrawalRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<WithdrawalRequest & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    transactionId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | undefined, WithdrawalRequest, Document<unknown, {}, WithdrawalRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<WithdrawalRequest & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, WithdrawalRequest>;
