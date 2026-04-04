import { Document, Types } from 'mongoose';
import { ProgressionMode } from '../enums/progression-mode.enum';
export declare enum CourseStatus {
    DRAFT = "DRAFT",
    PENDING_REVIEW = "PENDING_REVIEW",
    PUBLISHED = "PUBLISHED",
    REJECTED = "REJECTED",
    ARCHIVED = "ARCHIVED"
}
export declare class Course {
    title: string;
    slug: string;
    description?: string;
    price: number;
    discountPrice?: number;
    teacherId: Types.ObjectId;
    subjectId?: Types.ObjectId;
    coverImageId?: Types.ObjectId;
    promotionalVideoId?: Types.ObjectId;
    status: CourseStatus;
    submittedAt?: Date;
    rejectionReason?: string;
    benefits: string[];
    requirements: string[];
    averageRating: number;
    totalReviews: number;
    progressionMode: ProgressionMode;
    isStrictExam: boolean;
}
export type CourseDocument = Course & Document;
export declare const CourseSchema: import("mongoose").Schema<Course, import("mongoose").Model<Course, any, any, any, (Document<unknown, any, Course, any, import("mongoose").DefaultSchemaOptions> & Course & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, Course, any, import("mongoose").DefaultSchemaOptions> & Course & {
    _id: Types.ObjectId;
} & {
    __v: number;
}), any, Course>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Course, Document<unknown, {}, Course, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Course & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    title?: import("mongoose").SchemaDefinitionProperty<string, Course, Document<unknown, {}, Course, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Course & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    slug?: import("mongoose").SchemaDefinitionProperty<string, Course, Document<unknown, {}, Course, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Course & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    description?: import("mongoose").SchemaDefinitionProperty<string | undefined, Course, Document<unknown, {}, Course, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Course & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    price?: import("mongoose").SchemaDefinitionProperty<number, Course, Document<unknown, {}, Course, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Course & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    discountPrice?: import("mongoose").SchemaDefinitionProperty<number | undefined, Course, Document<unknown, {}, Course, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Course & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    teacherId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Course, Document<unknown, {}, Course, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Course & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    subjectId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | undefined, Course, Document<unknown, {}, Course, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Course & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    coverImageId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | undefined, Course, Document<unknown, {}, Course, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Course & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    promotionalVideoId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | undefined, Course, Document<unknown, {}, Course, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Course & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<CourseStatus, Course, Document<unknown, {}, Course, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Course & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    submittedAt?: import("mongoose").SchemaDefinitionProperty<Date | undefined, Course, Document<unknown, {}, Course, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Course & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    rejectionReason?: import("mongoose").SchemaDefinitionProperty<string | undefined, Course, Document<unknown, {}, Course, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Course & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    benefits?: import("mongoose").SchemaDefinitionProperty<string[], Course, Document<unknown, {}, Course, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Course & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    requirements?: import("mongoose").SchemaDefinitionProperty<string[], Course, Document<unknown, {}, Course, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Course & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    averageRating?: import("mongoose").SchemaDefinitionProperty<number, Course, Document<unknown, {}, Course, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Course & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    totalReviews?: import("mongoose").SchemaDefinitionProperty<number, Course, Document<unknown, {}, Course, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Course & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    progressionMode?: import("mongoose").SchemaDefinitionProperty<ProgressionMode, Course, Document<unknown, {}, Course, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Course & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    isStrictExam?: import("mongoose").SchemaDefinitionProperty<boolean, Course, Document<unknown, {}, Course, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Course & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Course>;
