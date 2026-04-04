import { AdminService } from '../admin.service';
import { AdminCreateSubjectDto, AdminCreateTopicDto, AdminUpdateSubjectDto, AdminUpdateTopicDto } from '../dto/admin-taxonomy.dto';
export declare class AdminTaxonomyController {
    private readonly adminService;
    constructor(adminService: AdminService);
    listSubjects(): Promise<(import("../../taxonomy/schemas/subject.schema").Subject & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    createSubject(dto: AdminCreateSubjectDto): Promise<import("mongoose").Document<unknown, {}, import("../../taxonomy/schemas/subject.schema").SubjectDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../../taxonomy/schemas/subject.schema").Subject & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    updateSubject(id: string, dto: AdminUpdateSubjectDto): Promise<import("../../taxonomy/schemas/subject.schema").Subject & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    listTopics(subjectId: string): Promise<(import("../../taxonomy/schemas/knowledge-topic.schema").KnowledgeTopic & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    createTopic(dto: AdminCreateTopicDto): Promise<import("mongoose").Document<unknown, {}, import("../../taxonomy/schemas/knowledge-topic.schema").KnowledgeTopicDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../../taxonomy/schemas/knowledge-topic.schema").KnowledgeTopic & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    updateTopic(id: string, dto: AdminUpdateTopicDto): Promise<import("../../taxonomy/schemas/knowledge-topic.schema").KnowledgeTopic & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    deleteTopic(id: string): Promise<{
        success: boolean;
    }>;
}
