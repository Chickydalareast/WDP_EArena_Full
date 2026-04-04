import { Document, Schema as MongooseSchema, Types } from 'mongoose';
export type QuestionDocument = Question & Document;
export declare enum DifficultyLevel {
    NB = "NB",
    TH = "TH",
    VD = "VD",
    VDC = "VDC",
    UNKNOWN = "UNKNOWN"
}
export declare enum QuestionType {
    MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
    PASSAGE = "PASSAGE",
    FILL_BLANK = "FILL_BLANK",
    TRUE_FALSE = "TRUE_FALSE"
}
export declare class AnswerOption {
    id: string;
    content: string;
    isCorrect: boolean;
}
export declare class Question {
    ownerId: Types.ObjectId;
    folderId: Types.ObjectId;
    topicId: Types.ObjectId;
    parentPassageId: Types.ObjectId;
    type: QuestionType;
    content: string;
    explanation: string;
    orderIndex: number;
    answers: AnswerOption[];
    attachedMedia: Types.ObjectId[];
    difficultyLevel: DifficultyLevel;
    tags: string[];
    isDraft: boolean;
    isArchived: boolean;
}
export declare const QuestionSchema: MongooseSchema<Question, import("mongoose").Model<Question, any, any, any, (Document<unknown, any, Question, any, import("mongoose").DefaultSchemaOptions> & Question & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, Question, any, import("mongoose").DefaultSchemaOptions> & Question & {
    _id: Types.ObjectId;
} & {
    __v: number;
}), any, Question>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Question, Document<unknown, {}, Question, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Question & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    ownerId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Question, Document<unknown, {}, Question, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Question & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    folderId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Question, Document<unknown, {}, Question, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Question & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    topicId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Question, Document<unknown, {}, Question, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Question & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    parentPassageId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Question, Document<unknown, {}, Question, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Question & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    type?: import("mongoose").SchemaDefinitionProperty<QuestionType, Question, Document<unknown, {}, Question, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Question & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    content?: import("mongoose").SchemaDefinitionProperty<string, Question, Document<unknown, {}, Question, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Question & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    explanation?: import("mongoose").SchemaDefinitionProperty<string, Question, Document<unknown, {}, Question, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Question & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    orderIndex?: import("mongoose").SchemaDefinitionProperty<number, Question, Document<unknown, {}, Question, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Question & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    answers?: import("mongoose").SchemaDefinitionProperty<AnswerOption[], Question, Document<unknown, {}, Question, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Question & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    attachedMedia?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId[], Question, Document<unknown, {}, Question, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Question & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    difficultyLevel?: import("mongoose").SchemaDefinitionProperty<DifficultyLevel, Question, Document<unknown, {}, Question, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Question & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    tags?: import("mongoose").SchemaDefinitionProperty<string[], Question, Document<unknown, {}, Question, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Question & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    isDraft?: import("mongoose").SchemaDefinitionProperty<boolean, Question, Document<unknown, {}, Question, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Question & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    isArchived?: import("mongoose").SchemaDefinitionProperty<boolean, Question, Document<unknown, {}, Question, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Question & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Question>;
