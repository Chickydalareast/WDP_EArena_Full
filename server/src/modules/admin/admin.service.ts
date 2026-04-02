import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { CoursesRepository } from '../courses/courses.repository';
import { CourseStatus } from '../courses/schemas/course.schema';

import { User, UserDocument, UserStatus } from '../users/schemas/user.schema';
import { Exam, ExamDocument, ExamType } from '../exams/schemas/exam.schema';
import { Question, QuestionDocument } from '../questions/schemas/question.schema';
import { Class, ClassDocument } from '../classes/schemas/class.schema';
import { Subject, SubjectDocument } from '../taxonomy/schemas/subject.schema';
import { KnowledgeTopic, KnowledgeTopicDocument } from '../taxonomy/schemas/knowledge-topic.schema';
import { PricingPlanCode } from '../subscriptions/schemas/pricing-plan.schema';
import { TransactionStatus } from '../subscriptions/schemas/subscription-transaction.schema';
import { RedisService } from '../../common/redis/redis.service';
import { UserRole } from '../../common/enums/user-role.enum';
import { ExamsService } from '../exams/exams.service';

import { PricingPlansRepository } from '../subscriptions/repositories/pricing-plans.repository';
import { SubscriptionTransactionsRepository } from '../subscriptions/repositories/subscription-transactions.repository';

export type PageMeta = { page: number; limit: number; totalItems: number; totalPages: number };
export type PageResult<T> = { items: T[]; meta: PageMeta };

function buildPageMeta(page: number, limit: number, totalItems: number): PageMeta {
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  return { page, limit, totalItems, totalPages };
}

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Exam.name) private readonly examModel: Model<ExamDocument>,
    @InjectModel(Question.name) private readonly questionModel: Model<QuestionDocument>,
    @InjectModel(Class.name) private readonly classModel: Model<ClassDocument>,
    @InjectModel(Subject.name) private readonly subjectModel: Model<SubjectDocument>,
    @InjectModel(KnowledgeTopic.name) private readonly topicModel: Model<KnowledgeTopicDocument>,
    
    private readonly pricingPlansRepo: PricingPlansRepository,
    private readonly txRepo: SubscriptionTransactionsRepository,
    
    private readonly redisService: RedisService,
    private readonly coursesRepo: CoursesRepository,
    
    private readonly examsService: ExamsService,
  ) {}

  async getOverview() {
    const [
      totalUsers, students, teachers, admins,
      totalExams, publishedExams,
      totalQuestions, archivedQuestions,
      totalClasses, lockedClasses,
      totalCourses, pendingCourses, publishedCourses, rejectedCourses
    ] = await Promise.all([
      this.userModel.countDocuments({}),
      this.userModel.countDocuments({ role: UserRole.STUDENT }),
      this.userModel.countDocuments({ role: UserRole.TEACHER }),
      this.userModel.countDocuments({ role: UserRole.ADMIN }),
      this.examModel.countDocuments({}),
      this.examModel.countDocuments({ isPublished: true }),
      this.questionModel.countDocuments({}),
      this.questionModel.countDocuments({ isArchived: true }),
      this.classModel.countDocuments({}),
      this.classModel.countDocuments({ isLocked: true }),
      this.coursesRepo.modelInstance.countDocuments({}),
      this.coursesRepo.modelInstance.countDocuments({ status: CourseStatus.PENDING_REVIEW }),
      this.coursesRepo.modelInstance.countDocuments({ status: CourseStatus.PUBLISHED }),
      this.coursesRepo.modelInstance.countDocuments({ status: CourseStatus.REJECTED }),
    ]);

    return {
      users: { total: totalUsers, students, teachers, admins },
      exams: { total: totalExams, published: publishedExams },
      questions: { total: totalQuestions, archived: archivedQuestions },
      classes: { total: totalClasses, locked: lockedClasses },
      courses: { total: totalCourses, pending: pendingCourses, published: publishedCourses, rejected: rejectedCourses }
    };
  }

  // ---------------- Users ----------------
  async listUsers(query: { page: number; limit: number; search?: string; role?: UserRole; status?: UserStatus }): Promise<PageResult<any>> {
    const { page, limit, search, role, status } = query;
    const filter: any = {};
    if (role) filter.role = role;
    if (status) filter.status = status;
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

  async createUser(payload: { email: string; fullName: string; password: string; role: UserRole; status?: UserStatus }) {
    const email = payload.email.trim().toLowerCase();
    const existing = await this.userModel.exists({ email });
    if (existing) throw new BadRequestException('Email đã tồn tại');

    const salt = await bcrypt.genSalt();
    const hashed = await bcrypt.hash(payload.password, salt);

    const created = await this.userModel.create({
      email,
      fullName: payload.fullName,
      password: hashed,
      role: payload.role,
      status: payload.status || UserStatus.ACTIVE,
    } as any);

    return { _id: created._id };
  }

  async updateUserRole(id: string, role: UserRole) {
    const updated = await this.userModel.findByIdAndUpdate(id, { $set: { role } }, { returnDocument: 'after' }).lean();
    if (!updated) throw new NotFoundException('User không tồn tại');
    return { success: true };
  }

  async updateUserStatus(id: string, status: UserStatus) {
    const updated = await this.userModel.findByIdAndUpdate(id, { $set: { status } }, { returnDocument: 'after' }).lean();
    if (!updated) throw new NotFoundException('User không tồn tại');
    return { success: true };
  }

  async resetUserPassword(id: string, newPassword?: string) {
    const user = await this.userModel.findById(id).select('+password');
    if (!user) throw new NotFoundException('User không tồn tại');

    const pwd = newPassword || Math.random().toString(36).slice(-10) + 'A1';
    const salt = await bcrypt.genSalt();
    const hashed = await bcrypt.hash(pwd, salt);

    user.password = hashed;
    await user.save();

    return { newPassword: pwd };
  }

  async deactivateUser(id: string) {
    const updated = await this.userModel.findByIdAndUpdate(id, { $set: { status: UserStatus.INACTIVE } }, { returnDocument: 'after' }).lean();
    if (!updated) throw new NotFoundException('User không tồn tại');
    return { success: true };
  }

  // ---------------- Exams ----------------
  async listExams(query: { page: number; limit: number; search?: string; type?: ExamType; teacherId?: string }): Promise<PageResult<any>> {
    const { page, limit, search, type, teacherId } = query;
    const filter: any = {};
    if (type) filter.type = type;
    if (teacherId) filter.teacherId = new Types.ObjectId(teacherId);
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

  async setExamPublish(id: string, isPublished: boolean) {
    const updated = await this.examModel.findByIdAndUpdate(id, { $set: { isPublished } }, { returnDocument: 'after' }).lean();
    if (!updated) throw new NotFoundException('Exam không tồn tại');
    return { success: true };
  }

  async deleteExam(id: string) {
    const res = await this.examModel.findByIdAndDelete(id).lean();
    if (!res) throw new NotFoundException('Exam không tồn tại');
    return { success: true };
  }

  // ---------------- Classes ----------------
  async listClasses(query: { page: number; limit: number; search?: string; teacherId?: string }): Promise<PageResult<any>> {
    const { page, limit, search, teacherId } = query;
    const filter: any = {};
    if (teacherId) filter.teacherId = new Types.ObjectId(teacherId);
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

  async setClassLocked(id: string, isLocked: boolean) {
    const updated = await this.classModel.findByIdAndUpdate(id, { $set: { isLocked } }, { returnDocument: 'after' }).lean();
    if (!updated) throw new NotFoundException('Class không tồn tại');
    return { success: true };
  }

  async deleteClass(id: string) {
    const res = await this.classModel.findByIdAndDelete(id).lean();
    if (!res) throw new NotFoundException('Class không tồn tại');
    return { success: true };
  }

  // ---------------- Questions ----------------
  async listQuestions(query: { page: number; limit: number; search?: string; ownerId?: string; folderId?: string; topicId?: string }): Promise<PageResult<any>> {
    const { page, limit, search, ownerId, folderId, topicId } = query;
    const filter: any = {};
    if (ownerId) filter.ownerId = new Types.ObjectId(ownerId);
    if (folderId) filter.folderId = new Types.ObjectId(folderId);
    if (topicId) filter.topicId = new Types.ObjectId(topicId);
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

  async setQuestionArchived(id: string, isArchived: boolean) {
    const updated = await this.questionModel.findByIdAndUpdate(id, { $set: { isArchived } }, { returnDocument: 'after' }).lean();
    if (!updated) throw new NotFoundException('Question không tồn tại');
    return { success: true };
  }

  async deleteQuestion(id: string) {
    const res = await this.questionModel.findByIdAndDelete(id).lean();
    if (!res) throw new NotFoundException('Question không tồn tại');
    return { success: true };
  }

  // ---------------- Taxonomy ----------------
  async listSubjects() {
    return this.subjectModel.find({}).sort({ createdAt: -1 }).lean().exec();
  }

  async createSubject(payload: { name: string; code: string; isActive?: boolean }) {
    const created = await this.subjectModel.create({
      name: payload.name,
      code: payload.code,
      isActive: payload.isActive ?? true,
    } as any);
    return created;
  }

  async updateSubject(id: string, payload: any) {
    const updated = await this.subjectModel.findByIdAndUpdate(id, { $set: payload }, { returnDocument: 'after' }).lean();
    if (!updated) throw new NotFoundException('Subject không tồn tại');
    return updated;
  }

  async listTopicsBySubject(subjectId: string) {
    return this.topicModel.find({ subjectId: new Types.ObjectId(subjectId) }).sort({ level: 1, name: 1 }).lean().exec();
  }

  private async invalidateTopicTreeCache(subjectId: string) {
    const cacheKey = `topics_tree:${subjectId}`;
    await this.redisService.del(cacheKey);
  }

  async createTopic(payload: { subjectId: string; name: string; level: number; parentId?: string }) {
    const subjectObjectId = new Types.ObjectId(payload.subjectId);
    const parentObjectId = payload.parentId ? new Types.ObjectId(payload.parentId) : null;

    let ancestors: Types.ObjectId[] = [];
    if (parentObjectId) {
      const parent = await this.topicModel.findById(parentObjectId).lean();
      if (!parent) throw new BadRequestException('Parent topic không tồn tại');
      ancestors = [...(parent.ancestors || []), parentObjectId];
    }

    const created = await this.topicModel.create({
      subjectId: subjectObjectId,
      name: payload.name,
      level: payload.level,
      parentId: parentObjectId,
      ancestors,
    } as any);

    await this.invalidateTopicTreeCache(payload.subjectId);
    return created;
  }

  async updateTopic(id: string, payload: { name?: string; level?: number; parentId?: string | null }) {
    const topic = await this.topicModel.findById(id);
    if (!topic) throw new NotFoundException('Topic không tồn tại');

    if (payload.parentId !== undefined) {
      const newParentId = payload.parentId ? new Types.ObjectId(payload.parentId) : null;
      if (newParentId) {
        const parent = await this.topicModel.findById(newParentId).lean();
        if (!parent) throw new BadRequestException('Parent topic không tồn tại');
        topic.parentId = newParentId as any;
        topic.ancestors = [...(parent.ancestors || []), newParentId];
      } else {
        topic.parentId = null as any;
        topic.ancestors = [];
      }
    }

    if (payload.name !== undefined) topic.name = payload.name;
    if (payload.level !== undefined) topic.level = payload.level;

    await topic.save();
    await this.invalidateTopicTreeCache(topic.subjectId.toString());

    return topic.toObject();
  }

  async deleteTopic(id: string) {
    const topic = await this.topicModel.findById(id).lean();
    if (!topic) throw new NotFoundException('Topic không tồn tại');

    await this.topicModel.deleteOne({ _id: new Types.ObjectId(id) });
    await this.invalidateTopicTreeCache(topic.subjectId.toString());

    return { success: true };
  }

  // ---------------- Pricing plans ----------------
  async listPricingPlans() {
    // [CTO FIX]: Gọi qua Repo thay vì chọc thẳng Model
    return this.pricingPlansRepo.modelInstance.find({}).sort({ priceMonthly: 1 }).lean().exec();
  }

  async createPricingPlan(payload: { name: string; code: PricingPlanCode; priceMonthly: number; priceYearly: number; benefits?: string[]; isActive?: boolean }) {
    // [CTO FIX]: Dùng hàm chuẩn Abstract Repository
    return this.pricingPlansRepo.createDocument({
      name: payload.name,
      code: payload.code,
      priceMonthly: payload.priceMonthly,
      priceYearly: payload.priceYearly,
      benefits: payload.benefits || [],
      isActive: payload.isActive ?? true,
    } as any);
  }

  async updatePricingPlan(id: string, payload: any) {
    // [CTO FIX]: Dùng updateByIdSafe chuẩn
    const updated = await this.pricingPlansRepo.updateByIdSafe(id, { $set: payload });
    if (!updated) throw new NotFoundException('Pricing plan không tồn tại');
    return updated;
  }

  // ---------------- Teacher verification ----------------
  async listTeacherVerifications(query: { page: number; limit: number; status?: string; search?: string }): Promise<PageResult<any>> {
    const { page, limit, status, search } = query;
    const filter: any = { role: UserRole.TEACHER };
    if (status) {
      if (status === 'PENDING') {
        filter.teacherVerificationStatus = { $in: ['PENDING', null] };
      } else {
        filter.teacherVerificationStatus = status;
      }
    }
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
        .select('email fullName avatar phone teacherVerificationStatus teacherVerificationNote teacherVerifiedAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.userModel.countDocuments(filter),
    ]);

    return { items, meta: buildPageMeta(page, limit, totalItems) };
  }

  async updateTeacherVerification(adminId: string, teacherId: string, payload: { status: string; note?: string }) {
    const updated = await this.userModel.findOneAndUpdate(
      { _id: new Types.ObjectId(teacherId), role: UserRole.TEACHER },
      {
        $set: {
          teacherVerificationStatus: payload.status,
          teacherVerificationNote: payload.note || null,
          teacherVerifiedAt: payload.status === 'VERIFIED' ? new Date() : null,
          teacherVerifiedBy: payload.status === 'VERIFIED' ? new Types.ObjectId(adminId) : null,
        },
      },
      { returnDocument: 'after' }
    ).lean();

    if (!updated) throw new NotFoundException('Teacher không tồn tại');
    return { success: true };
  }

  // ---------------- Business dashboard ----------------
  async getBusinessMetrics(query: { from?: string; to?: string }) {
    const from = query.from ? new Date(query.from) : null;
    const to = query.to ? new Date(query.to) : null;
    const match: any = { status: TransactionStatus.PAID };
    if (from || to) {
      match.createdAt = {};
      if (from) match.createdAt.$gte = from;
      if (to) match.createdAt.$lte = to;
    }

    const [totalUsers, totalTeachers, totalStudents] = await Promise.all([
      this.userModel.countDocuments({}),
      this.userModel.countDocuments({ role: UserRole.TEACHER }),
      this.userModel.countDocuments({ role: UserRole.STUDENT }),
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

  async getExamPaperDetailByExamId(examId: string) {
    return this.examsService.getPaperDetailByExamIdForAdmin(examId);
  }
}