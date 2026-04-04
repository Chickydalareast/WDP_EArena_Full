import { AdminService } from '../admin.service';
import { AdminListQuestionsQueryDto, AdminSetQuestionArchiveDto } from '../dto/admin-questions.dto';
export declare class AdminQuestionsController {
    private readonly adminService;
    constructor(adminService: AdminService);
    list(query: AdminListQuestionsQueryDto): Promise<import("../admin.service").PageResult<any>>;
    archive(id: string, dto: AdminSetQuestionArchiveDto): Promise<{
        success: boolean;
    }>;
    delete(id: string): Promise<{
        success: boolean;
    }>;
}
