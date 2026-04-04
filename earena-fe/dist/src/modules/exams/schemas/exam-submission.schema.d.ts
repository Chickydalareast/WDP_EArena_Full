import { Document, Schema as MongooseSchema, Types } from 'mongoose';
export type ExamSubmissionDocument = ExamSubmission & Document;
export declare enum SubmissionStatus {
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    ABANDONED = "ABANDONED"
}
export declare class StudentAnswer {
    questionId: Types.ObjectId;
    selectedAnswerId: string | null;
    isCorrect?: boolean;
}
export declare class ExamSubmission {
    studentId: Types.ObjectId;
    courseId: Types.ObjectId;
    lessonId: Types.ObjectId;
    examId: Types.ObjectId;
    examPaperId: Types.ObjectId;
    attemptNumber: number;
    answers: StudentAnswer[];
    score: number;
    status: SubmissionStatus;
    submittedAt: Date;
}
export declare const ExamSubmissionSchema: MongooseSchema<ExamSubmission, import("mongoose").Model<ExamSubmission, any, any, any, (Document<unknown, any, ExamSubmission, any, import("mongoose").DefaultSchemaOptions> & ExamSubmission & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, ExamSubmission, any, import("mongoose").DefaultSchemaOptions> & ExamSubmission & {
    _id: Types.ObjectId;
} & {
    __v: number;
}), any, ExamSubmission>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ExamSubmission, Document<unknown, {}, ExamSubmission, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<ExamSubmission & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    studentId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, ExamSubmission, Document<unknown, {}, ExamSubmission, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ExamSubmission & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    courseId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, ExamSubmission, Document<unknown, {}, ExamSubmission, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ExamSubmission & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    lessonId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, ExamSubmission, Document<unknown, {}, ExamSubmission, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ExamSubmission & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    examId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, ExamSubmission, Document<unknown, {}, ExamSubmission, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ExamSubmission & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    examPaperId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, ExamSubmission, Document<unknown, {}, ExamSubmission, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ExamSubmission & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    attemptNumber?: import("mongoose").SchemaDefinitionProperty<number, ExamSubmission, Document<unknown, {}, ExamSubmission, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ExamSubmission & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    answers?: import("mongoose").SchemaDefinitionProperty<StudentAnswer[], ExamSubmission, Document<unknown, {}, ExamSubmission, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ExamSubmission & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    score?: import("mongoose").SchemaDefinitionProperty<number, ExamSubmission, Document<unknown, {}, ExamSubmission, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ExamSubmission & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<SubmissionStatus, ExamSubmission, Document<unknown, {}, ExamSubmission, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ExamSubmission & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    submittedAt?: import("mongoose").SchemaDefinitionProperty<Date, ExamSubmission, Document<unknown, {}, ExamSubmission, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ExamSubmission & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, ExamSubmission>;
