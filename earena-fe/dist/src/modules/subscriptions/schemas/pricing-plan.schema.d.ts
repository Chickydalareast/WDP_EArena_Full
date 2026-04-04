import { Document } from 'mongoose';
export type PricingPlanDocument = PricingPlan & Document;
export declare enum PricingPlanCode {
    FREE = "FREE",
    PRO = "PRO",
    ENTERPRISE = "ENTERPRISE"
}
export declare class PricingPlan {
    name: string;
    code: PricingPlanCode;
    priceMonthly: number;
    priceYearly: number;
    benefits: string[];
    isActive: boolean;
    canCreatePaidCourse: boolean;
    isUnlimitedCourses: boolean;
    maxCourses: number;
}
export declare const PricingPlanSchema: import("mongoose").Schema<PricingPlan, import("mongoose").Model<PricingPlan, any, any, any, (Document<unknown, any, PricingPlan, any, import("mongoose").DefaultSchemaOptions> & PricingPlan & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, PricingPlan, any, import("mongoose").DefaultSchemaOptions> & PricingPlan & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}), any, PricingPlan>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PricingPlan, Document<unknown, {}, PricingPlan, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<PricingPlan & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    name?: import("mongoose").SchemaDefinitionProperty<string, PricingPlan, Document<unknown, {}, PricingPlan, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PricingPlan & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    code?: import("mongoose").SchemaDefinitionProperty<PricingPlanCode, PricingPlan, Document<unknown, {}, PricingPlan, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PricingPlan & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    priceMonthly?: import("mongoose").SchemaDefinitionProperty<number, PricingPlan, Document<unknown, {}, PricingPlan, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PricingPlan & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    priceYearly?: import("mongoose").SchemaDefinitionProperty<number, PricingPlan, Document<unknown, {}, PricingPlan, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PricingPlan & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    benefits?: import("mongoose").SchemaDefinitionProperty<string[], PricingPlan, Document<unknown, {}, PricingPlan, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PricingPlan & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    isActive?: import("mongoose").SchemaDefinitionProperty<boolean, PricingPlan, Document<unknown, {}, PricingPlan, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PricingPlan & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    canCreatePaidCourse?: import("mongoose").SchemaDefinitionProperty<boolean, PricingPlan, Document<unknown, {}, PricingPlan, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PricingPlan & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    isUnlimitedCourses?: import("mongoose").SchemaDefinitionProperty<boolean, PricingPlan, Document<unknown, {}, PricingPlan, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PricingPlan & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    maxCourses?: import("mongoose").SchemaDefinitionProperty<number, PricingPlan, Document<unknown, {}, PricingPlan, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PricingPlan & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, PricingPlan>;
