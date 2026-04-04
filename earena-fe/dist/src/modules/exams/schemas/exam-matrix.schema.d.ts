import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { DifficultyLevel } from '../../questions/schemas/question.schema';
export type ExamMatrixDocument = ExamMatrix & Document;
export declare class MatrixRule {
    folderIds: Types.ObjectId[];
    topicIds: Types.ObjectId[];
    difficulties: DifficultyLevel[];
    tags: string[];
    limit: number;
}
export declare const MatrixRuleSchema: MongooseSchema<MatrixRule, import("mongoose").Model<MatrixRule, any, any, any, (Document<unknown, any, MatrixRule, any, import("mongoose").DefaultSchemaOptions> & MatrixRule & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, MatrixRule, any, import("mongoose").DefaultSchemaOptions> & MatrixRule & {
    _id: Types.ObjectId;
} & {
    __v: number;
}), any, MatrixRule>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, MatrixRule, Document<unknown, {}, MatrixRule, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<MatrixRule & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    folderIds?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId[], MatrixRule, Document<unknown, {}, MatrixRule, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MatrixRule & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    topicIds?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId[], MatrixRule, Document<unknown, {}, MatrixRule, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MatrixRule & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    difficulties?: import("mongoose").SchemaDefinitionProperty<DifficultyLevel[], MatrixRule, Document<unknown, {}, MatrixRule, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MatrixRule & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    tags?: import("mongoose").SchemaDefinitionProperty<string[], MatrixRule, Document<unknown, {}, MatrixRule, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MatrixRule & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    limit?: import("mongoose").SchemaDefinitionProperty<number, MatrixRule, Document<unknown, {}, MatrixRule, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MatrixRule & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, MatrixRule>;
export declare class MatrixSection {
    name: string;
    orderIndex: number;
    rules: MatrixRule[];
}
export declare const MatrixSectionSchema: MongooseSchema<MatrixSection, import("mongoose").Model<MatrixSection, any, any, any, (Document<unknown, any, MatrixSection, any, import("mongoose").DefaultSchemaOptions> & MatrixSection & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, MatrixSection, any, import("mongoose").DefaultSchemaOptions> & MatrixSection & {
    _id: Types.ObjectId;
} & {
    __v: number;
}), any, MatrixSection>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, MatrixSection, Document<unknown, {}, MatrixSection, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<MatrixSection & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    name?: import("mongoose").SchemaDefinitionProperty<string, MatrixSection, Document<unknown, {}, MatrixSection, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MatrixSection & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    orderIndex?: import("mongoose").SchemaDefinitionProperty<number, MatrixSection, Document<unknown, {}, MatrixSection, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MatrixSection & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    rules?: import("mongoose").SchemaDefinitionProperty<MatrixRule[], MatrixSection, Document<unknown, {}, MatrixSection, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MatrixSection & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, MatrixSection>;
export declare class ExamMatrix {
    title: string;
    description: string;
    teacherId: Types.ObjectId;
    subjectId: Types.ObjectId;
    sections: MatrixSection[];
}
export declare const ExamMatrixSchema: MongooseSchema<ExamMatrix, import("mongoose").Model<ExamMatrix, any, any, any, (Document<unknown, any, ExamMatrix, any, import("mongoose").DefaultSchemaOptions> & ExamMatrix & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, ExamMatrix, any, import("mongoose").DefaultSchemaOptions> & ExamMatrix & {
    _id: Types.ObjectId;
} & {
    __v: number;
}), any, ExamMatrix>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ExamMatrix, Document<unknown, {}, ExamMatrix, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<ExamMatrix & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    title?: import("mongoose").SchemaDefinitionProperty<string, ExamMatrix, Document<unknown, {}, ExamMatrix, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ExamMatrix & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    description?: import("mongoose").SchemaDefinitionProperty<string, ExamMatrix, Document<unknown, {}, ExamMatrix, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ExamMatrix & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    teacherId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, ExamMatrix, Document<unknown, {}, ExamMatrix, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ExamMatrix & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    subjectId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, ExamMatrix, Document<unknown, {}, ExamMatrix, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ExamMatrix & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    sections?: import("mongoose").SchemaDefinitionProperty<MatrixSection[], ExamMatrix, Document<unknown, {}, ExamMatrix, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ExamMatrix & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, ExamMatrix>;
