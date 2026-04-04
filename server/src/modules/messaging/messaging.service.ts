import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ChatThread, ChatThreadDocument } from './schemas/chat-thread.schema';
import { ChatMessage, ChatMessageDocument } from './schemas/chat-message.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { UserRole } from '../../common/enums/user-role.enum';
import { Course, CourseDocument, CourseStatus } from '../courses/schemas/course.schema';
import {
  Enrollment,
  EnrollmentDocument,
  EnrollmentStatus,
} from '../courses/schemas/enrollment.schema';

function normalizePair(
  a: string,
  b: string,
): { low: Types.ObjectId; high: Types.ObjectId } {
  const oa = new Types.ObjectId(a);
  const ob = new Types.ObjectId(b);
  const sa = oa.toString();
  const sb = ob.toString();
  return sa < sb ? { low: oa, high: ob } : { low: ob, high: oa };
}

@Injectable()
export class MessagingService {
  constructor(
    @InjectModel(ChatThread.name)
    private readonly threadModel: Model<ChatThreadDocument>,
    @InjectModel(ChatMessage.name)
    private readonly messageModel: Model<ChatMessageDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Course.name) private readonly courseModel: Model<CourseDocument>,
    @InjectModel(Enrollment.name)
    private readonly enrollmentModel: Model<EnrollmentDocument>,
  ) {}

  private threadHasUnread(t: unknown, userId: string): boolean {
    const doc = t as {
      userLowId: Types.ObjectId;
      userHighId: Types.ObjectId;
      lastMessageAt: Date;
      lastMessageSenderId?: Types.ObjectId;
      readAtLow?: Date;
      readAtHigh?: Date;
    };
    const lms = doc.lastMessageSenderId?.toString();
    if (!lms) return false;
    if (lms === userId) return false;
    const isLow = doc.userLowId.toString() === userId;
    const readAt = isLow ? doc.readAtLow : doc.readAtHigh;
    const readMs = readAt ? new Date(readAt).getTime() : 0;
    return new Date(doc.lastMessageAt).getTime() > readMs;
  }

  private readAtFieldForUser(
    t: { userLowId: Types.ObjectId; userHighId: Types.ObjectId },
    userId: string,
  ): 'readAtLow' | 'readAtHigh' {
    return t.userLowId.toString() === userId ? 'readAtLow' : 'readAtHigh';
  }

  private async bumpReadCursor(
    threadId: string,
    t: { userLowId: Types.ObjectId; userHighId: Types.ObjectId },
    userId: string,
  ) {
    const field = this.readAtFieldForUser(t, userId);
    await this.threadModel.updateOne(
      { _id: new Types.ObjectId(threadId) },
      { $set: { [field]: new Date() } },
    );
  }

  private async assertTeacherStudentPair(aId: string, bId: string) {
    const [a, b] = await Promise.all([
      this.userModel.findById(aId).select('role').lean(),
      this.userModel.findById(bId).select('role').lean(),
    ]);
    if (!a || !b) throw new NotFoundException('Người dùng không tồn tại.');
    const roles = new Set([a.role, b.role]);
    if (!(roles.has(UserRole.TEACHER) && roles.has(UserRole.STUDENT))) {
      throw new ForbiddenException(
        'Chỉ hỗ trợ tin nhắn giữa học viên và giáo viên.',
      );
    }
  }

  async openOrGetThread(userId: string, peerUserId: string) {
    if (userId === peerUserId) {
      throw new BadRequestException('Không thể mở cuộc trò chuyện với chính mình.');
    }
    await this.assertTeacherStudentPair(userId, peerUserId);
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
    return this.serializeThread(thread as any, userId);
  }

  async listThreads(userId: string) {
    const uid = new Types.ObjectId(userId);
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
      .find({ _id: { $in: peerIds.map((id) => new Types.ObjectId(id)) } })
      .select('fullName avatar role')
      .lean();
    const pmap = Object.fromEntries(
      peers.map((p: any) => [
        p._id.toString(),
        {
          id: p._id.toString(),
          fullName: p.fullName,
          avatar: p.avatar,
          role: p.role,
        },
      ]),
    );

    return threads.map((t) => {
      const low = t.userLowId.toString();
      const high = t.userHighId.toString();
      const peerId = low === userId ? high : low;
      return {
        id: (t as any)._id.toString(),
        peer: pmap[peerId] || { id: peerId, fullName: 'Thành viên', avatar: '', role: '' },
        lastMessageAt: t.lastMessageAt,
        unread: this.threadHasUnread(t, userId),
      };
    });
  }

  async countUnreadThreads(userId: string) {
    const uid = new Types.ObjectId(userId);
    const threads = await this.threadModel
      .find({
        $or: [{ userLowId: uid }, { userHighId: uid }],
      })
      .select('userLowId userHighId lastMessageAt lastMessageSenderId readAtLow readAtHigh')
      .lean();
    let count = 0;
    for (const t of threads) {
      if (this.threadHasUnread(t, userId)) count += 1;
    }
    return { count };
  }

  async markThreadRead(threadId: string, userId: string) {
    const t = await this.assertThreadMember(threadId, userId);
    await this.bumpReadCursor(threadId, t, userId);
    return { ok: true };
  }

  async listShareableCourses(userId: string) {
    const u = await this.userModel.findById(userId).select('role').lean();
    if (!u) throw new NotFoundException('Người dùng không tồn tại.');

    if (u.role === UserRole.TEACHER) {
      const courses = await this.courseModel
        .find({
          teacherId: new Types.ObjectId(userId),
          status: CourseStatus.PUBLISHED,
        })
        .sort({ updatedAt: -1 })
        .limit(100)
        .populate('coverImageId', 'url')
        .select('title slug coverImageId')
        .lean();
      return {
        items: (courses as any[]).map((c) => ({
          id: c._id.toString(),
          title: c.title,
          slug: c.slug,
          coverUrl: c.coverImageId?.url ?? null,
        })),
      };
    }

    if (u.role === UserRole.STUDENT) {
      const enrollments = await this.enrollmentModel
        .find({
          userId: new Types.ObjectId(userId),
          status: EnrollmentStatus.ACTIVE,
        })
        .select('courseId')
        .lean();
      const courseIds = enrollments.map((e) => e.courseId);
      if (courseIds.length === 0) return { items: [] };
      const courses = await this.courseModel
        .find({
          _id: { $in: courseIds },
          status: CourseStatus.PUBLISHED,
        })
        .sort({ updatedAt: -1 })
        .limit(100)
        .populate('coverImageId', 'url')
        .select('title slug coverImageId')
        .lean();
      return {
        items: (courses as any[]).map((c) => ({
          id: c._id.toString(),
          title: c.title,
          slug: c.slug,
          coverUrl: c.coverImageId?.url ?? null,
        })),
      };
    }

    return { items: [] };
  }

  private async assertThreadMember(threadId: string, userId: string) {
    const t = await this.threadModel.findById(threadId).lean();
    if (!t) throw new NotFoundException('Không tìm thấy hội thoại.');
    const ok =
      t.userLowId.toString() === userId || t.userHighId.toString() === userId;
    if (!ok) throw new ForbiddenException();
    return t;
  }

  async listMessages(threadId: string, userId: string, page = 1, limit = 40) {
    const t = await this.assertThreadMember(threadId, userId);
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.messageModel
        .find({ threadId: new Types.ObjectId(threadId) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.messageModel.countDocuments({
        threadId: new Types.ObjectId(threadId),
      }),
    ]);

    const courseIds = items
      .map((m: any) => m.shareCourseId)
      .filter(Boolean) as Types.ObjectId[];
    const courses =
      courseIds.length > 0
        ? await this.courseModel
            .find({
              _id: { $in: courseIds },
              status: CourseStatus.PUBLISHED,
            })
            .select('title slug coverImageId')
            .populate('coverImageId', 'url')
            .lean()
        : [];
    const cmap = Object.fromEntries(
      (courses as any[]).map((c) => [
        c._id.toString(),
        {
          id: c._id.toString(),
          title: c.title,
          slug: c.slug,
          coverUrl: c.coverImageId?.url || null,
        },
      ]),
    );

    const mapped = [...items].reverse().map((m: any) => ({
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

  async sendMessage(
    threadId: string,
    userId: string,
    dto: {
      body?: string;
      imageUrls?: string[];
      shareCourseId?: string;
    },
  ) {
    const thread = await this.assertThreadMember(threadId, userId);
    const bodyTrim = (dto.body || '').trim();
    const imgs = (dto.imageUrls || []).filter(Boolean).slice(0, 8);
    let shareOid: Types.ObjectId | undefined;
    if (dto.shareCourseId) {
      const c = await this.courseModel.findById(dto.shareCourseId).lean();
      if (!c || c.status !== CourseStatus.PUBLISHED) {
        throw new BadRequestException('Khóa học chia sẻ không hợp lệ.');
      }
      shareOid = c._id as Types.ObjectId;
    }
    if (!bodyTrim && imgs.length === 0 && !shareOid) {
      throw new BadRequestException('Nhập nội dung, ảnh hoặc chia sẻ khóa học.');
    }

    const msg = await this.messageModel.create({
      threadId: new Types.ObjectId(threadId),
      senderId: new Types.ObjectId(userId),
      body: bodyTrim || undefined,
      imageUrls: imgs,
      shareCourseId: shareOid,
    });

    const readField = this.readAtFieldForUser(thread, userId);
    const now = new Date();
    await this.threadModel.updateOne(
      { _id: new Types.ObjectId(threadId) },
      {
        $set: {
          lastMessageAt: now,
          lastMessageSenderId: new Types.ObjectId(userId),
          [readField]: now,
        },
      },
    );

    return {
      id: msg._id.toString(),
      senderId: userId,
      body: bodyTrim || null,
      imageUrls: imgs,
      shareCourseId: shareOid?.toString() || null,
      createdAt: (msg as any).createdAt,
    };
  }

  private serializeThread(t: any, viewerId: string) {
    const low = t.userLowId.toString();
    const high = t.userHighId.toString();
    const peerId = low === viewerId ? high : low;
    return {
      id: t._id.toString(),
      peerUserId: peerId,
      lastMessageAt: t.lastMessageAt,
    };
  }
}
