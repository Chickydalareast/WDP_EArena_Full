import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { DifficultyLevel } from '../../questions/schemas/question.schema';
import { MatrixSection } from './exam-matrix.schema';
export type ExamDocument = Exam & Document;
export declare enum ExamType {
    OFFICIAL = "OFFICIAL",
    PRACTICE = "PRACTICE",
    COURSE_QUIZ = "COURSE_QUIZ"
}
export declare enum ExamMode {
    STATIC = "STATIC",
    DYNAMIC = "DYNAMIC"
}
export declare class DynamicFilter {
    difficulty: DifficultyLevel;
    count: number;
}
export declare class DynamicExamConfig {
    sourceFolders?: Types.ObjectId[];
    mixRatio?: DynamicFilter[];
    matrixId?: Types.ObjectId;
    adHocSections?: MatrixSection[];
}
export declare class Exam {
    title: string;
    description: string;
    teacherId: Types.ObjectId;
    subjectId: Types.ObjectId;
    totalScore: number;
    isPublished: boolean;
    type: ExamType;
    mode: ExamMode;
    dynamicConfig?: DynamicExamConfig;
    folderId?: Types.ObjectId;
}
export declare const ExamSchema: MongooseSchema<Exam, import("mongoose").Model<Exam, any, any, any, (Document<unknown, any, Exam, any, import("mongoose").DefaultSchemaOptions> & Exam & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, Exam, any, import("mongoose").DefaultSchemaOptions> & Exam & {
    _id: Types.ObjectId;
} & {
    __v: number;
}), any, Exam>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Exam, Document<unknown, {}, Exam, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Exam & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    title?: import("mongoose").SchemaDefinitionProperty<string, Exam, Document<unknown, {}, Exam, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Exam & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    description?: import("mongoose").SchemaDefinitionProperty<string, Exam, Document<unknown, {}, Exam, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Exam & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    teacherId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Exam, Document<unknown, {}, Exam, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Exam & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    subjectId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Exam, Document<unknown, {}, Exam, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Exam & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    totalScore?: import("mongoose").SchemaDefinitionProperty<number, Exam, Document<unknown, {}, Exam, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Exam & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    isPublished?: import("mongoose").SchemaDefinitionProperty<boolean, Exam, Document<unknown, {}, Exam, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Exam & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    type?: import("mongoose").SchemaDefinitionProperty<ExamType, Exam, Document<unknown, {}, Exam, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Exam & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    mode?: import("mongoose").SchemaDefinitionProperty<ExamMode, Exam, Document<unknown, {}, Exam, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Exam & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    dynamicConfig?: import("mongoose").SchemaDefinitionProperty<DynamicExamConfig | undefined, Exam, Document<unknown, {}, Exam, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Exam & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    folderId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | undefined, Exam, Document<unknown, {}, Exam, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Exam & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Exam>;
