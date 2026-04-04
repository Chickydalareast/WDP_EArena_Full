"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = __importStar(require("bcrypt"));
const courses_repository_1 = require("../courses/courses.repository");
const course_schema_1 = require("../courses/schemas/course.schema");
const user_schema_1 = require("../users/schemas/user.schema");
const token_schema_1 = require("../auth/schemas/token.schema");
const exam_schema_1 = require("../exams/schemas/exam.schema");
const question_schema_1 = require("../questions/schemas/question.schema");
const class_schema_1 = require("../classes/schemas/class.schema");
const subject_schema_1 = require("../taxonomy/schemas/subject.schema");
const knowledge_topic_schema_1 = require("../taxonomy/schemas/knowledge-topic.schema");
const subscription_transaction_schema_1 = require("../subscriptions/schemas/subscription-transaction.schema");
const redis_service_1 = require("../../common/redis/redis.service");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
const exams_service_1 = require("../exams/exams.service");
const mail_service_1 = require("../mail/mail.service");
const pricing_plans_repository_1 = require("../subscriptions/repositories/pricing-plans.repository");
const subscription_transactions_repository_1 = require("../subscriptions/repositories/subscription-transactions.repository");
function buildPageMeta(page, limit, totalItems) {
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    return { page, limit, totalItems, totalPages };
}
let AdminService = class AdminService {
    userModel;
    tokenModel;
    examModel;
    questionModel;
    classModel;
    subjectModel;
    topicModel;
    pricingPlansRepo;
    txRepo;
    redisService;
    coursesRepo;
    examsService;
    mailService;
    constructor(userModel, tokenModel, examModel, questionModel, classModel, subjectModel, topicModel, pricingPlansRepo, txRepo, redisService, coursesRepo, examsService, mailService) {
        this.userModel = userModel;
        this.tokenModel = tokenModel;
        this.examModel = examModel;
        this.questionModel = questionModel;
        this.classModel = classModel;
        this.subjectModel = subjectModel;
        this.topicModel = topicModel;
        this.pricingPlansRepo = pricingPlansRepo;
        this.txRepo = txRepo;
        this.redisService = redisService;
        this.coursesRepo = coursesRepo;
        this.examsService = examsService;
        this.mailService = mailService;
    }
    async getOverview() {
        const [totalUsers, students, teachers, admins, totalExams, publishedExams, totalQuestions, archivedQuestions, totalClasses, lockedClasses, totalCourses, pendingCourses, publishedCourses, rejectedCourses] = await Promise.all([
            this.userModel.countDocuments({}),
            this.userModel.countDocuments({ role: user_role_enum_1.UserRole.STUDENT }),
            this.userModel.countDocuments({ role: user_role_enum_1.UserRole.TEACHER }),
            this.userModel.countDocuments({ role: user_role_enum_1.UserRole.ADMIN }),
            this.examModel.countDocuments({}),
            this.examModel.countDocuments({ isPublished: true }),
            this.questionModel.countDocuments({}),
            this.questionModel.countDocuments({ isArchived: true }),
            this.classModel.countDocuments({}),
            this.classModel.countDocuments({ isLocked: true }),
            this.coursesRepo.modelInstance.countDocuments({}),
            this.coursesRepo.modelInstance.countDocuments({ status: course_schema_1.CourseStatus.PENDING_REVIEW }),
            this.coursesRepo.modelInstance.countDocuments({ status: course_schema_1.CourseStatus.PUBLISHED }),
            this.coursesRepo.modelInstance.countDocuments({ status: course_schema_1.CourseStatus.REJECTED }),
        ]);
        return {
            users: { total: totalUsers, students, teachers, admins },
            exams: { total: totalExams, published: publishedExams },
            questions: { total: totalQuestions, archived: archivedQuestions },
            classes: { total: totalClasses, locked: lockedClasses },
            courses: { total: totalCourses, pending: pendingCourses, published: publishedCourses, rejected: rejectedCourses }
        };
    }
    async listUsers(query) {
        const { page, limit, search, role, status } = query;
        const filter = {};
        if (role)
            filter.role = role;
        if (status)
            filter.status = status;
        if (search) {
            filter.$or = [
                { email: { $regex: search, $options: 'i' } },
                { fullName: { $regex: search, $options: 'i' } },
            ];
        }
        const skip = (page - 1) * limit;
        const [items, totalItems] = await Promise.all([
            this.userModel
                .find(filter)
                .select('email fullName role status avatar phone createdAt lastLoginAt teacherVerificationStatus teacherVerificationNote')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean()
                .exec(),
            this.userModel.countDocuments(filter),
        ]);
        return { items, meta: buildPageMeta(page, limit, totalItems) };
    }
    async createUser(payload) {
        const email = payload.email.trim().toLowerCase();
        const existing = await this.userModel.exists({ email });
        if (existing)
            throw new common_1.BadRequestException('Email đã tồn tại');
        const salt = await bcrypt.genSalt();
        const hashed = await bcrypt.hash(payload.password, salt);
        const created = await this.userModel.create({
            email,
            fullName: payload.fullName,
            password: hashed,
            role: payload.role,
            status: payload.status || user_schema_1.UserStatus.ACTIVE,
        });
        return { _id: created._id };
    }
    async updateUserRole(id, role) {
        const updated = await this.userModel.findByIdAndUpdate(id, { $set: { role } }, { returnDocument: 'after' }).lean();
        if (!updated)
            throw new common_1.NotFoundException('User không tồn tại');
        return { success: true };
    }
    async updateUserStatus(id, status) {
        const updated = await this.userModel.findByIdAndUpdate(id, { $set: { status } }, { returnDocument: 'after' }).lean();
        if (!updated)
            throw new common_1.NotFoundException('User không tồn tại');
        return { success: true };
    }
    async resetUserPassword(id, newPassword) {
        const user = await this.userModel.findById(id).select('+password');
        if (!user)
            throw new common_1.NotFoundException('User không tồn tại');
        const pwd = newPassword || Math.random().toString(36).slice(-10) + 'A1';
        const salt = await bcrypt.genSalt();
        const hashed = await bcrypt.hash(pwd, salt);
        user.password = hashed;
        await user.save();
        return { newPassword: pwd };
    }
    async deactivateUser(id) {
        const updated = await this.userModel.findByIdAndUpdate(id, { $set: { status: user_schema_1.UserStatus.INACTIVE } }, { returnDocument: 'after' }).lean();
        if (!updated)
            throw new common_1.NotFoundException('User không tồn tại');
        return { success: true };
    }
    async listExams(query) {
        const { page, limit, search, type, teacherId } = query;
        const filter = {};
        if (type)
            filter.type = type;
        if (teacherId)
            filter.teacherId = new mongoose_2.Types.ObjectId(teacherId);
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }
        const skip = (page - 1) * limit;
        const [items, totalItems] = await Promise.all([
            this.examModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean().exec(),
            this.examModel.countDocuments(filter),
        ]);
        return { items, meta: buildPageMeta(page, limit, totalItems) };
    }
    async setExamPublish(id, isPublished) {
        const updated = await this.examModel.findByIdAndUpdate(id, { $set: { isPublished } }, { returnDocument: 'after' }).lean();
        if (!updated)
            throw new common_1.NotFoundException('Exam không tồn tại');
        return { success: true };
    }
    async deleteExam(id) {
        const res = await this.examModel.findByIdAndDelete(id).lean();
        if (!res)
            throw new common_1.NotFoundException('Exam không tồn tại');
        return { success: true };
    }
    async listClasses(query) {
        const { page, limit, search, teacherId } = query;
        const filter = {};
        if (teacherId)
            filter.teacherId = new mongoose_2.Types.ObjectId(teacherId);
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { code: { $regex: search, $options: 'i' } },
            ];
        }
        const skip = (page - 1) * limit;
        const [items, totalItems] = await Promise.all([
            this.classModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean().exec(),
            this.classModel.countDocuments(filter),
        ]);
        return { items, meta: buildPageMeta(page, limit, totalItems) };
    }
    async setClassLocked(id, isLocked) {
        const updated = await this.classModel.findByIdAndUpdate(id, { $set: { isLocked } }, { returnDocument: 'after' }).lean();
        if (!updated)
            throw new common_1.NotFoundException('Class không tồn tại');
        return { success: true };
    }
    async deleteClass(id) {
        const res = await this.classModel.findByIdAndDelete(id).lean();
        if (!res)
            throw new common_1.NotFoundException('Class không tồn tại');
        return { success: true };
    }
    async listQuestions(query) {
        const { page, limit, search, ownerId, folderId, topicId } = query;
        const filter = {};
        if (ownerId)
            filter.ownerId = new mongoose_2.Types.ObjectId(ownerId);
        if (folderId)
            filter.folderId = new mongoose_2.Types.ObjectId(folderId);
        if (topicId)
            filter.topicId = new mongoose_2.Types.ObjectId(topicId);
        if (search) {
            filter.$or = [
                { content: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } },
            ];
        }
        const skip = (page - 1) * limit;
        const [items, totalItems] = await Promise.all([
            this.questionModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean().exec(),
            this.questionModel.countDocuments(filter),
        ]);
        return { items, meta: buildPageMeta(page, limit, totalItems) };
    }
    async setQuestionArchived(id, isArchived) {
        const updated = await this.questionModel.findByIdAndUpdate(id, { $set: { isArchived } }, { returnDocument: 'after' }).lean();
        if (!updated)
            throw new common_1.NotFoundException('Question không tồn tại');
        return { success: true };
    }
    async deleteQuestion(id) {
        const res = await this.questionModel.findByIdAndDelete(id).lean();
        if (!res)
            throw new common_1.NotFoundException('Question không tồn tại');
        return { success: true };
    }
    async listSubjects() {
        return this.subjectModel.find({}).sort({ createdAt: -1 }).lean().exec();
    }
    async createSubject(payload) {
        const created = await this.subjectModel.create({
            name: payload.name,
            code: payload.code,
            isActive: payload.isActive ?? true,
        });
        return created;
    }
    async updateSubject(id, payload) {
        const updated = await this.subjectModel.findByIdAndUpdate(id, { $set: payload }, { returnDocument: 'after' }).lean();
        if (!updated)
            throw new common_1.NotFoundException('Subject không tồn tại');
        return updated;
    }
    async listTopicsBySubject(subjectId) {
        return this.topicModel.find({ subjectId: new mongoose_2.Types.ObjectId(subjectId) }).sort({ level: 1, name: 1 }).lean().exec();
    }
    async invalidateTopicTreeCache(subjectId) {
        const cacheKey = `topics_tree:${subjectId}`;
        await this.redisService.del(cacheKey);
    }
    async createTopic(payload) {
        const subjectObjectId = new mongoose_2.Types.ObjectId(payload.subjectId);
        const parentObjectId = payload.parentId ? new mongoose_2.Types.ObjectId(payload.parentId) : null;
        let ancestors = [];
        if (parentObjectId) {
            const parent = await this.topicModel.findById(parentObjectId).lean();
            if (!parent)
                throw new common_1.BadRequestException('Parent topic không tồn tại');
            ancestors = [...(parent.ancestors || []), parentObjectId];
        }
        const created = await this.topicModel.create({
            subjectId: subjectObjectId,
            name: payload.name,
            level: payload.level,
            parentId: parentObjectId,
            ancestors,
        });
        await this.invalidateTopicTreeCache(payload.subjectId);
        return created;
    }
    async updateTopic(id, payload) {
        const topic = await this.topicModel.findById(id);
        if (!topic)
            throw new common_1.NotFoundException('Topic không tồn tại');
        if (payload.parentId !== undefined) {
            const newParentId = payload.parentId ? new mongoose_2.Types.ObjectId(payload.parentId) : null;
            if (newParentId) {
                const parent = await this.topicModel.findById(newParentId).lean();
                if (!parent)
                    throw new common_1.BadRequestException('Parent topic không tồn tại');
                topic.parentId = newParentId;
                topic.ancestors = [...(parent.ancestors || []), newParentId];
            }
            else {
                topic.parentId = null;
                topic.ancestors = [];
            }
        }
        if (payload.name !== undefined)
            topic.name = payload.name;
        if (payload.level !== undefined)
            topic.level = payload.level;
        await topic.save();
        await this.invalidateTopicTreeCache(topic.subjectId.toString());
        return topic.toObject();
    }
    async deleteTopic(id) {
        const topic = await this.topicModel.findById(id).lean();
        if (!topic)
            throw new common_1.NotFoundException('Topic không tồn tại');
        await this.topicModel.deleteOne({ _id: new mongoose_2.Types.ObjectId(id) });
        await this.invalidateTopicTreeCache(topic.subjectId.toString());
        return { success: true };
    }
    async listPricingPlans() {
        return this.pricingPlansRepo.modelInstance.find({}).sort({ priceMonthly: 1 }).lean().exec();
    }
    async createPricingPlan(payload) {
        return this.pricingPlansRepo.createDocument({
            name: payload.name,
            code: payload.code,
            priceMonthly: payload.priceMonthly,
            priceYearly: payload.priceYearly,
            benefits: payload.benefits || [],
            isActive: payload.isActive ?? true,
        });
    }
    async updatePricingPlan(id, payload) {
        const updated = await this.pricingPlansRepo.updateByIdSafe(id, { $set: payload });
        if (!updated)
            throw new common_1.NotFoundException('Pricing plan không tồn tại');
        return updated;
    }
    async listTeacherVerifications(query) {
        const { page, limit, status, search } = query;
        const filter = { role: user_role_enum_1.UserRole.TEACHER };
        const andConditions = [];
        if (status) {
            if (status === 'PENDING') {
                andConditions.push({
                    $or: [
                        { teacherVerificationStatus: 'PENDING' },
                        { teacherVerificationStatus: { $exists: false } },
                        { teacherVerificationStatus: null },
                    ],
                });
            }
            else {
                filter.teacherVerificationStatus = status;
            }
        }
        if (search?.trim()) {
            andConditions.push({
                $or: [
                    { email: { $regex: search.trim(), $options: 'i' } },
                    { fullName: { $regex: search.trim(), $options: 'i' } },
                ],
            });
        }
        if (andConditions.length > 0) {
            filter.$and = andConditions;
        }
        const skip = (page - 1) * limit;
        const [items, totalItems] = await Promise.all([
            this.userModel
                .find(filter)
                .select('email fullName avatar phone teacherVerificationStatus teacherVerificationNote teacherVerifiedAt hasUploadedQualifications qualifications')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean()
                .exec(),
            this.userModel.countDocuments(filter),
        ]);
        return { items, meta: buildPageMeta(page, limit, totalItems) };
    }
    async updateTeacherVerification(adminId, teacherId, payload) {
        const teacher = await this.userModel.findOne({ _id: new mongoose_2.Types.ObjectId(teacherId), role: user_role_enum_1.UserRole.TEACHER }).lean();
        if (!teacher)
            throw new common_1.NotFoundException('Teacher không tồn tại');
        if (payload.status === user_schema_1.TeacherVerificationStatus.REJECTED) {
            await this.mailService.sendTeacherVerificationRejection(teacher.email, teacher.fullName, payload.note);
            await this.tokenModel.deleteMany({ userId: new mongoose_2.Types.ObjectId(teacherId) });
            await this.userModel.findOneAndDelete({
                _id: new mongoose_2.Types.ObjectId(teacherId),
                role: user_role_enum_1.UserRole.TEACHER,
            });
            return { success: true };
        }
        const updated = await this.userModel.findOneAndUpdate({ _id: new mongoose_2.Types.ObjectId(teacherId), role: user_role_enum_1.UserRole.TEACHER }, {
            $set: {
                teacherVerificationStatus: payload.status,
                teacherVerificationNote: payload.note || null,
                teacherVerifiedAt: payload.status === user_schema_1.TeacherVerificationStatus.VERIFIED ? new Date() : null,
                teacherVerifiedBy: payload.status === user_schema_1.TeacherVerificationStatus.VERIFIED ? new mongoose_2.Types.ObjectId(adminId) : null,
            },
        }, { returnDocument: 'after' }).lean();
        if (!updated)
            throw new common_1.NotFoundException('Teacher không tồn tại');
        if (payload.status === user_schema_1.TeacherVerificationStatus.VERIFIED) {
            await this.mailService.sendTeacherVerificationApproval(teacher.email, teacher.fullName, payload.note);
        }
        return { success: true };
    }
    async getBusinessMetrics(query) {
        const from = query.from ? new Date(query.from) : null;
        const to = query.to ? new Date(query.to) : null;
        const match = { status: subscription_transaction_schema_1.TransactionStatus.PAID };
        if (from || to) {
            match.createdAt = {};
            if (from)
                match.createdAt.$gte = from;
            if (to)
                match.createdAt.$lte = to;
        }
        const [totalUsers, totalTeachers, totalStudents] = await Promise.all([
            this.userModel.countDocuments({}),
            this.userModel.countDocuments({ role: user_role_enum_1.UserRole.TEACHER }),
            this.userModel.countDocuments({ role: user_role_enum_1.UserRole.STUDENT }),
        ]);
        const revenueAgg = await this.txRepo.modelInstance.aggregate([
            { $match: match },
            { $group: { _id: null, revenue: { $sum: '$finalAmount' }, count: { $sum: 1 } } },
        ]);
        const revenue = revenueAgg?.[0]?.revenue || 0;
        const paidOrders = revenueAgg?.[0]?.count || 0;
        return {
            users: { total: totalUsers, teachers: totalTeachers, students: totalStudents },
            revenue: { total: revenue, currency: 'VND', paidOrders },
            note: 'Doanh thu được tổng hợp từ subscription_transactions (PAID).',
        };
    }
    async getExamPaperDetailByExamId(examId) {
        return this.examsService.getPaperDetailByExamIdForAdmin(examId);
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(token_schema_1.Token.name)),
    __param(2, (0, mongoose_1.InjectModel)(exam_schema_1.Exam.name)),
    __param(3, (0, mongoose_1.InjectModel)(question_schema_1.Question.name)),
    __param(4, (0, mongoose_1.InjectModel)(class_schema_1.Class.name)),
    __param(5, (0, mongoose_1.InjectModel)(subject_schema_1.Subject.name)),
    __param(6, (0, mongoose_1.InjectModel)(knowledge_topic_schema_1.KnowledgeTopic.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        pricing_plans_repository_1.PricingPlansRepository,
        subscription_transactions_repository_1.SubscriptionTransactionsRepository,
        redis_service_1.RedisService,
        courses_repository_1.CoursesRepository,
        exams_service_1.ExamsService,
        mail_service_1.MailService])
], AdminService);
//# sourceMappingURL=admin.service.js.map