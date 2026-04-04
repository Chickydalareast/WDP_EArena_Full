import { ClassesService } from './classes.service';
import { CreateClassDto, SearchClassDto, JoinByCodeDto, GetMembersDto, ReviewMemberDto, UpdateClassDto } from './dto';
export declare class ClassesController {
    private readonly classesService;
    constructor(classesService: ClassesService);
    createClass(dto: CreateClassDto, userId: string): Promise<import("./schemas/class.schema").ClassDocument>;
    searchClasses(query: SearchClassDto): Promise<any>;
    requestJoin(classId: string, userId: string): Promise<{
        message: string;
    }>;
    joinByCode(dto: JoinByCodeDto, userId: string): Promise<{
        message: string;
    }>;
    reviewMember(classId: string, dto: ReviewMemberDto, userId: string): Promise<{
        message: string;
    }>;
    getClassPreview(classId: string, userId?: string): Promise<any>;
    getClassMembers(classId: string, query: GetMembersDto, userId: string): Promise<any>;
    getMyClasses(userId: string): Promise<any[]>;
    getClassDetailForTeacher(classId: string, userId: string): Promise<import("./classes.repository").ClassAdminDetail>;
    updateClass(classId: string, dto: UpdateClassDto, userId: string): Promise<{
        name: string;
        description: string;
        code: string;
        teacherId: import("mongoose").Types.ObjectId;
        coverImageUrl: string;
        isLocked: boolean;
        isPublic: boolean;
        $locals: Record<string, unknown>;
        $op: "save" | "validate" | "remove" | null;
        $where: Record<string, unknown>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").Connection;
        errors?: import("mongoose").Error.ValidationError;
        isNew: boolean;
        schema: import("mongoose").Schema;
        id: string;
    }>;
    deleteClass(classId: string, userId: string): Promise<{
        message: string;
    }>;
    kickStudent(classId: string, studentId: string, userId: string): Promise<{
        message: string;
    }>;
    getJoinedClasses(userId: string, page: string, limit: string): Promise<{
        data: any;
        meta: {
            page: number;
            limit: number;
            total: any;
            totalPages: number;
        };
    }>;
    getStudentWorkspace(classId: string, userId: string): Promise<any>;
    leaveClass(classId: string, userId: string): Promise<{
        message: string;
    }>;
    resetClassCode(classId: string, userId: string): Promise<{
        message: string;
        newCode: string;
    } | undefined>;
}
