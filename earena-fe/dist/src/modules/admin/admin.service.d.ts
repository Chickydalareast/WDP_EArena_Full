import { Model, Types } from 'mongoose';
import { CoursesRepository } from '../courses/courses.repository';
import { UserDocument, UserStatus } from '../users/schemas/user.schema';
import { Token } from '../auth/schemas/token.schema';
import { ExamDocument, ExamType } from '../exams/schemas/exam.schema';
import { QuestionDocument } from '../questions/schemas/question.schema';
import { ClassDocument } from '../classes/schemas/class.schema';
import { Subject, SubjectDocument } from '../taxonomy/schemas/subject.schema';
import { KnowledgeTopic, KnowledgeTopicDocument } from '../taxonomy/schemas/knowledge-topic.schema';
import { PricingPlanCode } from '../subscriptions/schemas/pricing-plan.schema';
import { RedisService } from '../../common/redis/redis.service';
import { UserRole } from '../../common/enums/user-role.enum';
import { ExamsService } from '../exams/exams.service';
import { MailService } from '../mail/mail.service';
import { PricingPlansRepository } from '../subscriptions/repositories/pricing-plans.repository';
import { SubscriptionTransactionsRepository } from '../subscriptions/repositories/subscription-transactions.repository';
export type PageMeta = {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
};
export type PageResult<T> = {
    items: T[];
    meta: PageMeta;
};
export declare class AdminService {
    private readonly userModel;
    private readonly tokenModel;
    private readonly examModel;
    private readonly questionModel;
    private readonly classModel;
    private readonly subjectModel;
    private readonly topicModel;
    private readonly pricingPlansRepo;
    private readonly txRepo;
    private readonly redisService;
    private readonly coursesRepo;
    private readonly examsService;
    private readonly mailService;
    constructor(userModel: Model<UserDocument>, tokenModel: Model<Token>, examModel: Model<ExamDocument>, questionModel: Model<QuestionDocument>, classModel: Model<ClassDocument>, subjectModel: Model<SubjectDocument>, topicModel: Model<KnowledgeTopicDocument>, pricingPlansRepo: PricingPlansRepository, txRepo: SubscriptionTransactionsRepository, redisService: RedisService, coursesRepo: CoursesRepository, examsService: ExamsService, mailService: MailService);
    getOverview(): Promise<{
        users: {
            total: number;
            students: number;
            teachers: number;
            admins: number;
        };
        exams: {
            total: number;
            published: number;
        };
        questions: {
            total: number;
            archived: number;
        };
        classes: {
            total: number;
            locked: number;
        };
        courses: {
            total: number;
            pending: number;
            published: number;
            rejected: number;
        };
    }>;
    listUsers(query: {
        page: number;
        limit: number;
        search?: string;
        role?: UserRole;
        status?: UserStatus;
    }): Promise<PageResult<any>>;
    createUser(payload: {
        email: string;
        fullName: string;
        password: string;
        role: UserRole;
        status?: UserStatus;
    }): Promise<{
        _id: Types.ObjectId;
    }>;
    updateUserRole(id: string, role: UserRole): Promise<{
        success: boolean;
    }>;
    updateUserStatus(id: string, status: UserStatus): Promise<{
        success: boolean;
    }>;
    resetUserPassword(id: string, newPassword?: string): Promise<{
        newPassword: string;
    }>;
    deactivateUser(id: string): Promise<{
        success: boolean;
    }>;
    listExams(query: {
        page: number;
        limit: number;
        search?: string;
        type?: ExamType;
        teacherId?: string;
    }): Promise<PageResult<any>>;
    setExamPublish(id: string, isPublished: boolean): Promise<{
        success: boolean;
    }>;
    deleteExam(id: string): Promise<{
        success: boolean;
    }>;
    listClasses(query: {
        page: number;
        limit: number;
        search?: string;
        teacherId?: string;
    }): Promise<PageResult<any>>;
    setClassLocked(id: string, isLocked: boolean): Promise<{
        success: boolean;
    }>;
    deleteClass(id: string): Promise<{
        success: boolean;
    }>;
    listQuestions(query: {
        page: number;
        limit: number;
        search?: string;
        ownerId?: string;
        folderId?: string;
        topicId?: string;
    }): Promise<PageResult<any>>;
    setQuestionArchived(id: string, isArchived: boolean): Promise<{
        success: boolean;
    }>;
    deleteQuestion(id: string): Promise<{
        success: boolean;
    }>;
    listSubjects(): Promise<(Subject & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    createSubject(payload: {
        name: string;
        code: string;
        isActive?: boolean;
    }): Promise<import("mongoose").Document<unknown, {}, SubjectDocument, {}, import("mongoose").DefaultSchemaOptions> & Subject & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    updateSubject(id: string, payload: any): Promise<Subject & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    listTopicsBySubject(subjectId: string): Promise<(KnowledgeTopic & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    private invalidateTopicTreeCache;
    createTopic(payload: {
        subjectId: string;
        name: string;
        level: number;
        parentId?: string;
    }): Promise<import("mongoose").Document<unknown, {}, KnowledgeTopicDocument, {}, import("mongoose").DefaultSchemaOptions> & KnowledgeTopic & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    updateTopic(id: string, payload: {
        name?: string;
        level?: number;
        parentId?: string | null;
    }): Promise<KnowledgeTopic & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    deleteTopic(id: string): Promise<{
        success: boolean;
    }>;
    listPricingPlans(): Promise<(import("../subscriptions/schemas/pricing-plan.schema").PricingPlan & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    createPricingPlan(payload: {
        name: string;
        code: PricingPlanCode;
        priceMonthly: number;
        priceYearly: number;
        benefits?: string[];
        isActive?: boolean;
    }): Promise<import("../subscriptions/schemas/pricing-plan.schema").PricingPlanDocument>;
    updatePricingPlan(id: string, payload: any): Promise<import("../subscriptions/schemas/pricing-plan.schema").PricingPlanDocument>;
    listTeacherVerifications(query: {
        page: number;
        limit: number;
        status?: string;
        search?: string;
    }): Promise<PageResult<any>>;
    updateTeacherVerification(adminId: string, teacherId: string, payload: {
        status: string;
        note?: string;
    }): Promise<{
        success: boolean;
    }>;
    getBusinessMetrics(query: {
        from?: string;
        to?: string;
    }): Promise<{
        users: {
            total: number;
            teachers: number;
            students: number;
        };
        revenue: {
            total: any;
            currency: string;
            paidOrders: any;
        };
        note: string;
    }>;
    getExamPaperDetailByExamId(examId: string): Promise<{
        folderId: string | null;
        examId: Types.ObjectId;
        submissionId?: Types.ObjectId;
        questions: import("../exams/schemas/exam-paper.schema").PaperQuestion[];
        answerKeys: import("../exams/schemas/exam-paper.schema").PaperAnswerKey[];
        _id: Types.ObjectId;
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
    }>;
}
