"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var MessagingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagingService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const chat_thread_schema_1 = require("./schemas/chat-thread.schema");
const chat_message_schema_1 = require("./schemas/chat-message.schema");
const user_schema_1 = require("../users/schemas/user.schema");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
const course_schema_1 = require("../courses/schemas/course.schema");
const enrollment_schema_1 = require("../courses/schemas/enrollment.schema");
const notifications_service_1 = require("../notifications/notifications.service");
function normalizePair(a, b) {
    const oa = new mongoose_2.Types.ObjectId(a);
    const ob = new mongoose_2.Types.ObjectId(b);
    const sa = oa.toString();
    const sb = ob.toString();
    return sa < sb ? { low: oa, high: ob } : { low: ob, high: oa };
}
let MessagingService = MessagingService_1 = class MessagingService {
    threadModel;
    messageModel;
    userModel;
    courseModel;
    enrollmentModel;
    notificationsService;
    logger = new common_1.Logger(MessagingService_1.name);
    constructor(threadModel, messageModel, userModel, courseModel, enrollmentModel, notificationsService) {
        this.threadModel = threadModel;
        this.messageModel = messageModel;
        this.userModel = userModel;
        this.courseModel = courseModel;
        this.enrollmentModel = enrollmentModel;
        this.notificationsService = notificationsService;
    }
    threadHasUnread(t, userId) {
        const doc = t;
        const lms = doc.lastMessageSenderId?.toString();
        if (!lms)
            return false;
        if (lms === userId)
            return false;
        const isLow = doc.userLowId.toString() === userId;
        const readAt = isLow ? doc.readAtLow : doc.readAtHigh;
        const readMs = readAt ? new Date(readAt).getTime() : 0;
        return new Date(doc.lastMessageAt).getTime() > readMs;
    }
    readAtFieldForUser(t, userId) {
        return t.userLowId.toString() === userId ? 'readAtLow' : 'readAtHigh';
    }
    async bumpReadCursor(threadId, t, userId) {
        const field = this.readAtFieldForUser(t, userId);
        await this.threadModel.updateOne({ _id: new mongoose_2.Types.ObjectId(threadId) }, { $set: { [field]: new Date() } });
    }
    async assertAllowedPair(aId, bId) {
        const [a, b] = await Promise.all([
            this.userModel.findById(aId).select('role').lean(),
            this.userModel.findById(bId).select('role').lean(),
        ]);
        if (!a || !b)
            throw new common_1.NotFoundException('Người dùng không tồn tại.');
        const roles = new Set([a.role, b.role]);
        const allowed = (roles.has(user_role_enum_1.UserRole.STUDENT) && roles.size === 1) ||
            (roles.has(user_role_enum_1.UserRole.STUDENT) && roles.has(user_role_enum_1.UserRole.TEACHER));
        if (!allowed) {
            throw new common_1.ForbiddenException('Chỉ hỗ trợ chat giữa học sinh với học sinh hoặc giữa học sinh với giáo viên.');
        }
    }
    async openOrGetThread(userId, peerUserId) {
        if (userId === peerUserId) {
            throw new common_1.BadRequestException('Không thể mở cuộc trò chuyện với chính mình.');
        }
        await this.assertAllowedPair(userId, peerUserId);
        const { low, high } = normalizePair(userId, peerUserId);
        let thread = await this.threadModel
            .findOne({ userLowId: low, userHighId: high })
            .lean();
        if (!thread) {
            const created = await this.threadModel.create({
                userLowId: low,
                userHighId: high,
                lastMessageAt: new Date(),
            });
            thread = created.toObject();
        }
        return this.serializeThread(thread, userId);
    }
    async listThreads(userId) {
        const uid = new mongoose_2.Types.ObjectId(userId);
        const threads = await this.threadModel
            .find({
            $or: [{ userLowId: uid }, { userHighId: uid }],
        })
            .sort({ lastMessageAt: -1 })
            .limit(80)
            .lean();
        const peerIds = threads.map((t) => {
            const low = t.userLowId.toString();
            const high = t.userHighId.toString();
            return low === userId ? high : low;
        });
        const peers = await this.userModel
            .find({ _id: { $in: peerIds.map((id) => new mongoose_2.Types.ObjectId(id)) } })
            .select('fullName avatar role')
            .lean();
        const pmap = Object.fromEntries(peers.map((p) => [
            p._id.toString(),
            {
                id: p._id.toString(),
                fullName: p.fullName,
                avatar: p.avatar,
                role: p.role,
            },
        ]));
        return threads.map((t) => {
            const low = t.userLowId.toString();
            const high = t.userHighId.toString();
            const peerId = low === userId ? high : low;
            return {
                id: t._id.toString(),
                peer: pmap[peerId] || { id: peerId, fullName: 'Thành viên', avatar: '', role: '' },
                lastMessageAt: t.lastMessageAt,
                unread: this.threadHasUnread(t, userId),
            };
        });
    }
    async countUnreadThreads(userId) {
        const uid = new mongoose_2.Types.ObjectId(userId);
        const threads = await this.threadModel
            .find({
            $or: [{ userLowId: uid }, { userHighId: uid }],
        })
            .select('userLowId userHighId lastMessageAt lastMessageSenderId readAtLow readAtHigh')
            .lean();
        let count = 0;
        for (const t of threads) {
            if (this.threadHasUnread(t, userId))
                count += 1;
        }
        return { count };
    }
    async markThreadRead(threadId, userId) {
        const t = await this.assertThreadMember(threadId, userId);
        await this.bumpReadCursor(threadId, t, userId);
        return { ok: true };
    }
    async listShareableCourses(userId) {
        const u = await this.userModel.findById(userId).select('role').lean();
        if (!u)
            throw new common_1.NotFoundException('Người dùng không tồn tại.');
        if (u.role === user_role_enum_1.UserRole.TEACHER) {
            const courses = await this.courseModel
                .find({
                teacherId: new mongoose_2.Types.ObjectId(userId),
                status: course_schema_1.CourseStatus.PUBLISHED,
            })
                .sort({ updatedAt: -1 })
                .limit(100)
                .populate('coverImageId', 'url')
                .select('title slug coverImageId')
                .lean();
            return {
                items: courses.map((c) => ({
                    id: c._id.toString(),
                    title: c.title,
                    slug: c.slug,
                    coverUrl: c.coverImageId?.url ?? null,
                })),
            };
        }
        if (u.role === user_role_enum_1.UserRole.STUDENT) {
            const enrollments = await this.enrollmentModel
                .find({
                userId: new mongoose_2.Types.ObjectId(userId),
                status: enrollment_schema_1.EnrollmentStatus.ACTIVE,
            })
                .select('courseId')
                .lean();
            const courseIds = enrollments.map((e) => e.courseId);
            if (courseIds.length === 0)
                return { items: [] };
            const courses = await this.courseModel
                .find({
                _id: { $in: courseIds },
                status: course_schema_1.CourseStatus.PUBLISHED,
            })
                .sort({ updatedAt: -1 })
                .limit(100)
                .populate('coverImageId', 'url')
                .select('title slug coverImageId')
                .lean();
            return {
                items: courses.map((c) => ({
                    id: c._id.toString(),
                    title: c.title,
                    slug: c.slug,
                    coverUrl: c.coverImageId?.url ?? null,
                })),
            };
        }
        return { items: [] };
    }
    async assertThreadMember(threadId, userId) {
        const t = await this.threadModel.findById(threadId).lean();
        if (!t)
            throw new common_1.NotFoundException('Không tìm thấy hội thoại.');
        const ok = t.userLowId.toString() === userId || t.userHighId.toString() === userId;
        if (!ok)
            throw new common_1.ForbiddenException();
        return t;
    }
    async listMessages(threadId, userId, page = 1, limit = 40) {
        const t = await this.assertThreadMember(threadId, userId);
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            this.messageModel
                .find({ threadId: new mongoose_2.Types.ObjectId(threadId) })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            this.messageModel.countDocuments({
                threadId: new mongoose_2.Types.ObjectId(threadId),
            }),
        ]);
        const courseIds = items
            .map((m) => m.shareCourseId)
            .filter(Boolean);
        const courses = courseIds.length > 0
            ? await this.courseModel
                .find({
                _id: { $in: courseIds },
                status: course_schema_1.CourseStatus.PUBLISHED,
            })
                .select('title slug coverImageId')
                .populate('coverImageId', 'url')
                .lean()
            : [];
        const cmap = Object.fromEntries(courses.map((c) => [
            c._id.toString(),
            {
                id: c._id.toString(),
                title: c.title,
                slug: c.slug,
                coverUrl: c.coverImageId?.url || null,
            },
        ]));
        const mapped = [...items].reverse().map((m) => ({
            id: m._id.toString(),
            senderId: m.senderId.toString(),
            body: m.body || null,
            imageUrls: m.imageUrls || [],
            shareCourse: m.shareCourseId
                ? cmap[m.shareCourseId.toString()] || null
                : null,
            createdAt: m.createdAt,
        }));
        await this.bumpReadCursor(threadId, t, userId);
        return { items: mapped, meta: { page, limit, total } };
    }
    async sendMessage(threadId, userId, dto) {
        const thread = await this.assertThreadMember(threadId, userId);
        const bodyTrim = (dto.body || '').trim();
        const imgs = (dto.imageUrls || []).filter(Boolean).slice(0, 8);
        let shareOid;
        if (dto.shareCourseId) {
            const c = await this.courseModel.findById(dto.shareCourseId).lean();
            if (!c || c.status !== course_schema_1.CourseStatus.PUBLISHED) {
                throw new common_1.BadRequestException('Khóa học chia sẻ không hợp lệ.');
            }
            shareOid = c._id;
        }
        if (!bodyTrim && imgs.length === 0 && !shareOid) {
            throw new common_1.BadRequestException('Nhập nội dung, ảnh hoặc chia sẻ khóa học.');
        }
        const msg = await this.messageModel.create({
            threadId: new mongoose_2.Types.ObjectId(threadId),
            senderId: new mongoose_2.Types.ObjectId(userId),
            body: bodyTrim || undefined,
            imageUrls: imgs,
            shareCourseId: shareOid,
        });
        const readField = this.readAtFieldForUser(thread, userId);
        const now = new Date();
        await this.threadModel.updateOne({ _id: new mongoose_2.Types.ObjectId(threadId) }, {
            $set: {
                lastMessageAt: now,
                lastMessageSenderId: new mongoose_2.Types.ObjectId(userId),
                [readField]: now,
            },
        });
        const messageView = await this.serializeChatMessageForClient(msg);
        const peerId = thread.userLowId.toString() === userId
            ? thread.userHighId.toString()
            : thread.userLowId.toString();
        try {
            await Promise.all([
                this.notificationsService.publishChatFanout({
                    receiverId: peerId,
                    threadId,
                    message: messageView,
                }),
                this.notificationsService.publishChatFanout({
                    receiverId: userId,
                    threadId,
                    message: messageView,
                }),
            ]);
        }
        catch (err) {
            this.logger.warn(`[Chat realtime] Redis publish failed: ${err?.message}`);
        }
        return {
            id: msg._id.toString(),
            senderId: userId,
            body: bodyTrim || null,
            imageUrls: imgs,
            shareCourseId: shareOid?.toString() || null,
            createdAt: msg.createdAt,
        };
    }
    async serializeChatMessageForClient(m) {
        let shareCourse = null;
        if (m.shareCourseId) {
            const c = await this.courseModel
                .findOne({
                _id: m.shareCourseId,
                status: course_schema_1.CourseStatus.PUBLISHED,
            })
                .select('title slug coverImageId')
                .populate('coverImageId', 'url')
                .lean();
            if (c) {
                const doc = c;
                shareCourse = {
                    id: doc._id.toString(),
                    title: doc.title,
                    slug: doc.slug,
                    coverUrl: doc.coverImageId?.url ?? null,
                };
            }
        }
        return {
            id: m._id.toString(),
            senderId: m.senderId.toString(),
            body: m.body ?? null,
            imageUrls: m.imageUrls || [],
            shareCourse,
            createdAt: m.createdAt ?? new Date(),
        };
    }
    serializeThread(t, viewerId) {
        const low = t.userLowId.toString();
        const high = t.userHighId.toString();
        const peerId = low === viewerId ? high : low;
        return {
            id: t._id.toString(),
            peerUserId: peerId,
            lastMessageAt: t.lastMessageAt,
        };
    }
};
exports.MessagingService = MessagingService;
exports.MessagingService = MessagingService = MessagingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(chat_thread_schema_1.ChatThread.name)),
    __param(1, (0, mongoose_1.InjectModel)(chat_message_schema_1.ChatMessage.name)),
    __param(2, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(3, (0, mongoose_1.InjectModel)(course_schema_1.Course.name)),
    __param(4, (0, mongoose_1.InjectModel)(enrollment_schema_1.Enrollment.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        notifications_service_1.NotificationsService])
], MessagingService);
//# sourceMappingURL=messaging.service.js.map