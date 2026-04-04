import { Document, Types } from 'mongoose';
export declare enum ShowResultMode {
    IMMEDIATELY = "IMMEDIATELY",
    AFTER_END_TIME = "AFTER_END_TIME",
    NEVER = "NEVER"
}
export declare class ExamRuleConfig {
    timeLimit: number;
    maxAttempts: number;
    passPercentage: number;
    showResultMode: ShowResultMode;
}
export declare class Lesson {
    courseId: Types.ObjectId;
    sectionId: Types.ObjectId;
    title: string;
    order: number;
    isFreePreview: boolean;
    primaryVideoId?: Types.ObjectId;
    attachments: Types.ObjectId[];
    content: string;
    examId?: Types.ObjectId;
    examRules?: ExamRuleConfig;
}
export type LessonDocument = Lesson & Document;
export declare const LessonSchema: import("mongoose").Schema<Lesson, import("mongoose").Model<Lesson, any, any, any, (Document<unknown, any, Lesson, any, import("mongoose").DefaultSchemaOptions> & Lesson & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, Lesson, any, import("mongoose").DefaultSchemaOptions> & Lesson & {
    _id: Types.ObjectId;
} & {
    __v: number;
}), any, Lesson>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Lesson, Document<unknown, {}, Lesson, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Lesson & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    courseId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Lesson, Document<unknown, {}, Lesson, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Lesson & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    sectionId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Lesson, Document<unknown, {}, Lesson, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Lesson & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    title?: import("mongoose").SchemaDefinitionProperty<string, Lesson, Document<unknown, {}, Lesson, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Lesson & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    order?: import("mongoose").SchemaDefinitionProperty<number, Lesson, Document<unknown, {}, Lesson, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Lesson & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    isFreePreview?: import("mongoose").SchemaDefinitionProperty<boolean, Lesson, Document<unknown, {}, Lesson, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Lesson & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    primaryVideoId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | undefined, Lesson, Document<unknown, {}, Lesson, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Lesson & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    attachments?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId[], Lesson, Document<unknown, {}, Lesson, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Lesson & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    content?: import("mongoose").SchemaDefinitionProperty<string, Lesson, Document<unknown, {}, Lesson, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Lesson & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    examId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | undefined, Lesson, Document<unknown, {}, Lesson, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Lesson & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    examRules?: import("mongoose").SchemaDefinitionProperty<ExamRuleConfig | undefined, Lesson, Document<unknown, {}, Lesson, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Lesson & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Lesson>;
