import { Document, Schema as MongooseSchema, Types } from 'mongoose';
export type KnowledgeTopicDocument = KnowledgeTopic & Document;
export declare class KnowledgeTopic {
    subjectId: Types.ObjectId;
    name: string;
    level: number;
    parentId: Types.ObjectId;
    ancestors: Types.ObjectId[];
}
export declare const KnowledgeTopicSchema: MongooseSchema<KnowledgeTopic, import("mongoose").Model<KnowledgeTopic, any, any, any, (Document<unknown, any, KnowledgeTopic, any, import("mongoose").DefaultSchemaOptions> & KnowledgeTopic & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, KnowledgeTopic, any, import("mongoose").DefaultSchemaOptions> & KnowledgeTopic & {
    _id: Types.ObjectId;
} & {
    __v: number;
}), any, KnowledgeTopic>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, KnowledgeTopic, Document<unknown, {}, KnowledgeTopic, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<KnowledgeTopic & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    subjectId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, KnowledgeTopic, Document<unknown, {}, KnowledgeTopic, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<KnowledgeTopic & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    name?: import("mongoose").SchemaDefinitionProperty<string, KnowledgeTopic, Document<unknown, {}, KnowledgeTopic, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<KnowledgeTopic & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    level?: import("mongoose").SchemaDefinitionProperty<number, KnowledgeTopic, Document<unknown, {}, KnowledgeTopic, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<KnowledgeTopic & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    parentId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, KnowledgeTopic, Document<unknown, {}, KnowledgeTopic, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<KnowledgeTopic & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    ancestors?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId[], KnowledgeTopic, Document<unknown, {}, KnowledgeTopic, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<KnowledgeTopic & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, KnowledgeTopic>;
