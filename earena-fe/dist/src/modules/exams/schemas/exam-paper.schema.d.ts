import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { DifficultyLevel, QuestionType } from '../../questions/schemas/question.schema';
export type ExamPaperDocument = ExamPaper & Document;
export declare class PaperAnswerOption {
    id: string;
    content: string;
}
export declare class PaperQuestion {
    originalQuestionId: Types.ObjectId;
    type: QuestionType;
    parentPassageId: Types.ObjectId;
    orderIndex: number;
    explanation: string;
    content: string;
    difficultyLevel: DifficultyLevel;
    answers: PaperAnswerOption[];
    attachedMedia: Types.ObjectId[];
    points: number | null;
}
export declare class PaperAnswerKey {
    originalQuestionId: Types.ObjectId;
    correctAnswerId: string;
}
export declare class ExamPaper {
    examId: Types.ObjectId;
    submissionId?: Types.ObjectId;
    questions: PaperQuestion[];
    answerKeys: PaperAnswerKey[];
}
export declare const ExamPaperSchema: MongooseSchema<ExamPaper, import("mongoose").Model<ExamPaper, any, any, any, (Document<unknown, any, ExamPaper, any, import("mongoose").DefaultSchemaOptions> & ExamPaper & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, ExamPaper, any, import("mongoose").DefaultSchemaOptions> & ExamPaper & {
    _id: Types.ObjectId;
} & {
    __v: number;
}), any, ExamPaper>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ExamPaper, Document<unknown, {}, ExamPaper, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<ExamPaper & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    examId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, ExamPaper, Document<unknown, {}, ExamPaper, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ExamPaper & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    submissionId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | undefined, ExamPaper, Document<unknown, {}, ExamPaper, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ExamPaper & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    questions?: import("mongoose").SchemaDefinitionProperty<PaperQuestion[], ExamPaper, Document<unknown, {}, ExamPaper, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ExamPaper & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    answerKeys?: import("mongoose").SchemaDefinitionProperty<PaperAnswerKey[], ExamPaper, Document<unknown, {}, ExamPaper, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ExamPaper & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, ExamPaper>;
