import { AdminService } from '../admin.service';
import { AdminListExamsQueryDto, AdminSetExamPublishDto } from '../dto/admin-exams.dto';
export declare class AdminExamsController {
    private readonly adminService;
    constructor(adminService: AdminService);
    list(query: AdminListExamsQueryDto): Promise<import("../admin.service").PageResult<any>>;
    getPaperDetailByExamId(examId: string): Promise<{
        message: string;
        data: {
            folderId: string | null;
            examId: import("mongoose").Types.ObjectId;
            submissionId?: import("mongoose").Types.ObjectId;
            questions: import("../../exams/schemas/exam-paper.schema").PaperQuestion[];
            answerKeys: import("../../exams/schemas/exam-paper.schema").PaperAnswerKey[];
            _id: import("mongoose").Types.ObjectId;
            $locals: Record<string, unknown>;
            $op: "save" | "validate" | "remove" | null;
            $where: Record<string, unknown>;
            baseModelName?: string;
            collection: import("mongoose").Collection;
            db: import("mongoose").Connection;
            errors?: import("mongoose").Error.ValidationError;
            isNew: boolean;
            schema: import("mongoose").Schema;
            __v: number;
        };
    }>;
    setPublish(id: string, dto: AdminSetExamPublishDto): Promise<{
        success: boolean;
    }>;
    delete(id: string): Promise<{
        success: boolean;
    }>;
}
