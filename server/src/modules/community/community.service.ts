import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import { UserRole } from 'src/common/enums/user-role.enum';
import { TeacherVerificationStatus } from '../users/schemas/user.schema';
import { CoursesRepository } from '../courses/courses.repository';
import { CourseStatus } from '../courses/schemas/course.schema';
import { ExamsRepository } from '../exams/exams.repository';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/constants/notification-event.constant';
import { UsersRepository } from '../users/users.repository';
import { SubjectsService } from '../taxonomy/subjects.service';

import { CommunityPost, CommunityPostDocument } from './schemas/community-post.schema';
import { CommunityComment, CommunityCommentDocument } from './schemas/community-comment.schema';
import { CommunityReaction, CommunityReactionDocument } from './schemas/community-reaction.schema';
import { CommunitySavedPost, CommunitySavedPostDocument } from './schemas/community-saved-post.schema';
import { CommunityReport, CommunityReportDocument } from './schemas/community-report.schema';
import { CommunityFollow, CommunityFollowDocument } from './schemas/community-follow.schema';
import { CommunityBlock, CommunityBlockDocument } from './schemas/community-block.schema';
import {
  CommunityUserProfile,
  CommunityUserProfileDocument,
} from './schemas/community-user-profile.schema';
import {
  CommunityModerationAudit,
  CommunityModerationAuditDocument,
} from './schemas/community-moderation-audit.schema';

import {
  CommunityPostStatus,
  CommunityPostType,
  CommunityReactionKind,
  CommunityReactionTarget,
  CommunityReportStatus,
  CommunityReportTarget,
  CommunityFollowTarget,
  CommunityUserCommunityStatus,
  COMMUNITY_BADGES,
} from './constants/community.constants';
import { CreateCommunityPostDto, UpdateCommunityPostDto } from './dto/create-community-post.dto';
import {
  CommunityFeedQueryDto,
  CommunityFeedSort,
} from './dto/community-feed-query.dto';
import { CreateCommunityCommentDto, UpdateCommunityCommentDto } from './dto/community-comment.dto';
import { CreateCommunityReportDto } from './dto/community-report.dto';
import {
  containsBannedTerm,
  computeHotScore,
  resolvePostBodyPlainForSave,
  mergeBreakdown,
} from './utils/community-text.util';

type Actor = {
  userId: string;
  role: UserRole;
  email?: string;
  teacherVerificationStatus?: string;
};

@Injectable()
export class CommunityService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(CommunityPost.name)
    private readonly postModel: Model<CommunityPostDocument>,
    @InjectModel(CommunityComment.name)
    private readonly commentModel: Model<CommunityCommentDocument>,
    @InjectModel(CommunityReaction.name)
    private readonly reactionModel: Model<CommunityReactionDocument>,
    @InjectModel(CommunitySavedPost.name)
    private readonly savedModel: Model<CommunitySavedPostDocument>,
    @InjectModel(CommunityReport.name)
    private readonly reportModel: Model<CommunityReportDocument>,
    @InjectModel(CommunityFollow.name)
    private readonly followModel: Model<CommunityFollowDocument>,
    @InjectModel(CommunityBlock.name)
    private readonly blockModel: Model<CommunityBlockDocument>,
    @InjectModel(CommunityUserProfile.name)
    private readonly profileModel: Model<CommunityUserProfileDocument>,
    @InjectModel(CommunityModerationAudit.name)
    private readonly auditModel: Model<CommunityModerationAuditDocument>,
    private readonly configService: ConfigService,
    private readonly coursesRepository: CoursesRepository,
    private readonly examsRepository: ExamsRepository,
    private readonly notificationsService: NotificationsService,
    private readonly usersRepository: UsersRepository,
    private readonly subjectsService: SubjectsService,
  ) {}

  private bannedWords(): string[] {
    const raw = this.configService.get<string>('COMMUNITY_BANNED_WORDS') || '';
    return raw
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  }

  private async audit(actorId: string, action: string, meta: Record<string, unknown> = {}) {
    await this.auditModel.create({
      actorId: new Types.ObjectId(actorId),
      action,
      meta,
    });
  }

  async ensureProfile(userId: string): Promise<CommunityUserProfileDocument> {
    let p = await this.profileModel.findOne({
      userId: new Types.ObjectId(userId),
    });
    if (!p) {
      p = await this.profileModel.create({
        userId: new Types.ObjectId(userId),
      });
    }
    return p;
  }

  private async assertCommunityNotRestricted(userId: string) {
    const p = await this.ensureProfile(userId);
    if (p.communityStatus === CommunityUserCommunityStatus.BANNED) {
      throw new ForbiddenException(
        'Tài khoản của bạn không thể tham gia cộng đồng.',
      );
    }
    if (
      p.communityStatus === CommunityUserCommunityStatus.MUTED &&
      p.mutedUntil &&
      p.mutedUntil > new Date()
    ) {
      throw new ForbiddenException('Tài khoản đang tạm khóa đăng bài trong cộng đồng.');
    }
  }

  private isVerifiedTeacher(actor: Actor) {
    return (
      actor.role === UserRole.TEACHER &&
      actor.teacherVerificationStatus === TeacherVerificationStatus.VERIFIED
    );
  }

  private async buildCourseSnapshot(courseId: string) {
    const raw = await this.coursesRepository.getCourseDetailById(courseId);
    if (!raw || (raw as { status?: CourseStatus }).status !== CourseStatus.PUBLISHED) {
      throw new BadRequestException('Khóa học không tồn tại hoặc chưa được công khai.');
    }
    const c = raw as unknown as Record<string, unknown>;
    const cover = c.coverImageId as { url?: string } | undefined;
    const tid = c.teacherId as Types.ObjectId | { _id?: Types.ObjectId; fullName?: string };
    const teacherIdStr =
      tid && typeof tid === 'object' && '_id' in tid && tid._id
        ? tid._id.toString()
        : (tid as Types.ObjectId).toString();
    const teacherUser = await this.usersRepository.findByIdSafe(teacherIdStr, {
      projection: 'fullName',
    });
    return {
      courseId: new Types.ObjectId(courseId),
      title: String(c.title),
      slug: String(c.slug),
      coverUrl: cover?.url,
      price: Number(c.price) || 0,
      discountPrice: c.discountPrice != null ? Number(c.discountPrice) : undefined,
      teacherName: (teacherUser as { fullName?: string } | null)?.fullName || 'Giáo viên',
      teacherId: new Types.ObjectId(teacherIdStr),
      averageRating: Number(c.averageRating) || 0,
      totalReviews: Number(c.totalReviews) || 0,
    };
  }

  async createPost(actor: Actor, dto: CreateCommunityPostDto) {
    await this.assertCommunityNotRestricted(actor.userId);
    const bodyPlain = resolvePostBodyPlainForSave(
      dto.bodyJson,
      dto.attachments,
    );
    if (bodyPlain === null) {
      throw new BadRequestException('Nội dung bài viết không hợp lệ.');
    }
    const bannedHit = containsBannedTerm(bodyPlain, this.bannedWords());
    if (bannedHit) {
      throw new BadRequestException('Nội dung chứa từ ngữ không được phép.');
    }

    if (dto.type === CommunityPostType.COURSE_SHARE && !dto.courseId) {
      throw new BadRequestException('Vui lòng chọn khóa học để chia sẻ.');
    }
    let courseSnapshot: Awaited<ReturnType<typeof this.buildCourseSnapshot>> | undefined;
    let courseOid: Types.ObjectId | undefined;
    if (dto.courseId) {
      courseSnapshot = await this.buildCourseSnapshot(dto.courseId);
      courseOid = new Types.ObjectId(dto.courseId);
    }

    if (dto.examId) {
      const exam = await this.examsRepository.findByIdSafe(dto.examId);
      if (!exam) throw new BadRequestException('Đề thi không tồn tại.');
    }

    const post = await this.postModel.create({
      authorId: new Types.ObjectId(actor.userId),
      type: dto.type,
      status: CommunityPostStatus.ACTIVE,
      bodyJson: dto.bodyJson,
      bodyPlain,
      attachments: dto.attachments || [],
      tags: (dto.tags || []).map((t) => t.replace(/^#/, '').trim()).filter(Boolean),
      subjectId: dto.subjectId ? new Types.ObjectId(dto.subjectId) : undefined,
      courseId: courseOid,
      examId: dto.examId ? new Types.ObjectId(dto.examId) : undefined,
      courseSnapshot,
      commentCount: 0,
      reactionCount: 0,
      saveCount: 0,
      reactionBreakdown: {},
      hotScore: 0,
    });

    const created = post as CommunityPostDocument;
    const createdAt =
      (created as unknown as { createdAt?: Date }).createdAt || new Date();
    created.hotScore = computeHotScore(0, 0, createdAt);
    await created.save();

    await this.profileModel.updateOne(
      { userId: new Types.ObjectId(actor.userId) },
      {
        $inc: { postsCount: 1 },
        $setOnInsert: { userId: new Types.ObjectId(actor.userId) },
      },
      { upsert: true },
    );

    const profAfter = await this.ensureProfile(actor.userId);
    const badges = new Set(profAfter.badges || []);
    badges.add(COMMUNITY_BADGES.FIRST_STEP);
    if (profAfter.postsCount >= 20) badges.add(COMMUNITY_BADGES.CONTRIBUTOR);
    if (this.isVerifiedTeacher(actor)) badges.add(COMMUNITY_BADGES.TEACHER_VOICE);
    await this.profileModel.updateOne(
      { _id: profAfter._id },
      { $set: { badges: [...badges] } },
    );

    return this.getPostById(created._id.toString(), actor.userId);
  }

  async updatePost(actor: Actor, postId: string, dto: UpdateCommunityPostDto) {
    const post = await this.postModel.findById(postId);
    if (!post || post.status === CommunityPostStatus.REMOVED) {
      throw new NotFoundException('Không tìm thấy bài viết.');
    }
    if (post.authorId.toString() !== actor.userId) {
      throw new ForbiddenException('Bạn không thể sửa bài viết này.');
    }
    if (dto.bodyJson) {
      const mergedAttachments =
        dto.attachments !== undefined ? dto.attachments : post.attachments;
      const bodyPlain = resolvePostBodyPlainForSave(
        dto.bodyJson,
        mergedAttachments,
      );
      if (bodyPlain === null) {
        throw new BadRequestException('Nội dung không hợp lệ.');
      }
      const bannedHit = containsBannedTerm(bodyPlain, this.bannedWords());
      if (bannedHit) {
        throw new BadRequestException('Nội dung chứa từ ngữ không được phép.');
      }
      post.bodyJson = dto.bodyJson;
      post.bodyPlain = bodyPlain;
    }
    if (dto.attachments) post.attachments = dto.attachments;
    if (dto.tags) {
      post.tags = dto.tags.map((t) => t.replace(/^#/, '').trim()).filter(Boolean);
    }
    if (dto.subjectId !== undefined) {
      post.subjectId = dto.subjectId
        ? new Types.ObjectId(dto.subjectId)
        : undefined;
    }
    const upCreated =
      (post as unknown as { createdAt?: Date }).createdAt || new Date();
    post.hotScore = computeHotScore(
      post.reactionCount,
      post.commentCount,
      upCreated,
    );
    await post.save();
    return this.getPostById(postId, actor.userId);
  }

  async deletePost(actor: Actor, postId: string) {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Không tìm thấy bài viết.');
    const isOwner = post.authorId.toString() === actor.userId;
    const isAdmin = actor.role === UserRole.ADMIN;
    if (!isOwner && !isAdmin) throw new ForbiddenException();
    post.status = CommunityPostStatus.REMOVED;
    await post.save();
    await this.audit(actor.userId, 'POST_REMOVED', { postId });
    return { success: true };
  }

  private async blockedAuthorIds(viewerId?: string): Promise<Types.ObjectId[]> {
    if (!viewerId) return [];
    const rows = await this.blockModel
      .find({ blockerId: new Types.ObjectId(viewerId) })
      .select('blockedUserId')
      .lean();
    return rows.map((r) => r.blockedUserId as Types.ObjectId);
  }

  async getFeed(query: CommunityFeedQueryDto, viewerId?: string | null) {
    const limit = Math.min(Math.max(query.limit || 20, 1), 50);
    const filter: Record<string, unknown> = { status: CommunityPostStatus.ACTIVE };
    const blocked = await this.blockedAuthorIds(viewerId || undefined);
    if (blocked.length) {
      filter.authorId = { $nin: blocked };
    }
    if (query.type) filter.type = query.type;
    if (query.subjectId) filter.subjectId = new Types.ObjectId(query.subjectId);
    if (query.courseId) filter.courseId = new Types.ObjectId(query.courseId);
    if (query.examId) filter.examId = new Types.ObjectId(query.examId);
    if (query.q?.trim()) {
      filter.$text = { $search: query.q.trim() };
    }

    let sort: Record<string, 1 | -1> = { createdAt: -1 };
    if (query.sort === CommunityFeedSort.HOT) {
      sort = { hotScore: -1, createdAt: -1 };
    } else if (query.sort === CommunityFeedSort.FOLLOWING && viewerId) {
      const follows = await this.followModel
        .find({ followerId: new Types.ObjectId(viewerId), targetType: CommunityFollowTarget.USER })
        .select('targetId')
        .lean();
      const ids = follows.map((f) => f.targetId);
      if (!ids.length) return { items: [], nextCursor: null };
      const blockedSet = new Set(blocked.map((b) => b.toString()));
      const allowed = ids.filter((id) => !blockedSet.has(id.toString()));
      if (!allowed.length) return { items: [], nextCursor: null };
      filter.authorId = { $in: allowed };
    } else if (query.sort === CommunityFeedSort.FOR_YOU && viewerId) {
      const prof = await this.profileModel
        .findOne({ userId: new Types.ObjectId(viewerId) })
        .lean();
      const mine = await this.postModel
        .find({ authorId: new Types.ObjectId(viewerId) })
        .select('subjectId')
        .limit(30)
        .lean();
      const subj = new Set<string>();
      mine.forEach((p) => {
        if (p.subjectId) subj.add(p.subjectId.toString());
      });
      if (subj.size) {
        filter.subjectId = { $in: [...subj].map((s) => new Types.ObjectId(s)) };
      }
    }

    const q = this.postModel.find(filter).sort(sort).limit(limit + 1);
    if (query.cursor) {
      const [created, id] = query.cursor.split('_');
      const cid = new Types.ObjectId(id);
      const cdate = new Date(created);
      if (query.sort === CommunityFeedSort.HOT) {
        const cur = await this.postModel.findById(cid).lean();
        if (cur) {
          const curCa = (cur as { createdAt?: Date }).createdAt;
          q.where({
            $or: [
              { hotScore: { $lt: cur.hotScore } },
              {
                hotScore: cur.hotScore,
                createdAt: { $lt: curCa },
              },
            ],
          });
        }
      } else {
        q.where({
          $or: [
            { createdAt: { $lt: cdate } },
            { createdAt: cdate, _id: { $lt: cid } },
          ],
        });
      }
    }

    const rows = await q.lean();
    const hasMore = rows.length > limit;
    const slice = hasMore ? rows.slice(0, limit) : rows;
    const items = await this.hydratePosts(slice, viewerId || undefined);
    const last = slice[slice.length - 1];
    const lastCa = last ? (last as any).createdAt as Date : null;
    const nextCursor =
      hasMore && last && lastCa
        ? `${lastCa.toISOString()}_${(last._id as Types.ObjectId).toString()}`
        : null;
    return { items, nextCursor };
  }

  async getRecommended(viewerId: string, limit = 20) {
    return this.getFeed(
      { sort: CommunityFeedSort.FOR_YOU, limit },
      viewerId,
    );
  }

  private async hydratePosts(posts: any[], viewerId?: string) {
    const authorIds = [...new Set(posts.map((p) => String(p.authorId)))];
    const users = await this.userModel
      .find({ _id: { $in: authorIds.map((id) => new Types.ObjectId(id)) } })
      .select('fullName avatar role teacherVerificationStatus')
      .lean();
    const umap = Object.fromEntries(
      users.map((u: any) => [
        String(u._id),
        {
          id: String(u._id),
          fullName: u.fullName,
          avatar: u.avatar,
          role: u.role,
          teacherVerificationStatus: u.teacherVerificationStatus,
        },
      ]),
    );

    let savedSet = new Set<string>();
    let reactionMap = new Map<string, CommunityReactionKind>();
    if (viewerId && posts.length) {
      const pids = posts.map((p) => p._id as Types.ObjectId);
      const [saved, reacts] = await Promise.all([
        this.savedModel
          .find({
            userId: new Types.ObjectId(viewerId),
            postId: { $in: pids },
          })
          .select('postId')
          .lean(),
        this.reactionModel
          .find({
            userId: new Types.ObjectId(viewerId),
            targetType: CommunityReactionTarget.POST,
            targetId: { $in: pids },
          })
          .lean(),
      ]);
      savedSet = new Set(saved.map((s) => s.postId.toString()));
      reacts.forEach((r) =>
        reactionMap.set(r.targetId.toString(), r.kind as CommunityReactionKind),
      );
    }

    const base = posts.map((p) => {
      const id = String(p._id);
      const author = umap[String(p.authorId)] || null;
      return {
        ...p,
        id,
        author,
        reactionBreakdown: mergeBreakdown(
          p.reactionBreakdown as Record<string, number>,
        ),
        savedByMe: viewerId ? savedSet.has(id) : false,
        myReaction: viewerId ? reactionMap.get(id) || null : null,
      };
    });

    const subjectIds = [
      ...new Set(
        posts
          .map((p) => p.subjectId)
          .filter(Boolean)
          .map((x: { toString: () => string }) => x.toString()),
      ),
    ];
    if (!subjectIds.length) {
      return base.map((h) => ({ ...h, subject: null as null | { id: string; name: string; code?: string } }));
    }
    const subjRows = await this.subjectsService.findSubjectsByIds(subjectIds);
    const smap = Object.fromEntries(
      (subjRows as { _id: Types.ObjectId; name: string; code?: string }[]).map((s) => [
        String(s._id),
        { id: String(s._id), name: s.name, code: s.code },
      ]),
    );
    return base.map((h) => {
      const sid = (h as { subjectId?: Types.ObjectId }).subjectId;
      const key = sid ? String(sid) : '';
      return { ...h, subject: key && smap[key] ? smap[key] : null };
    });
  }

  async getPostById(postId: string, viewerId?: string | null) {
    const post = await this.postModel.findById(postId).lean();
    if (!post || post.status === CommunityPostStatus.REMOVED) {
      throw new NotFoundException('Không tìm thấy bài viết.');
    }
    if (post.status === CommunityPostStatus.HIDDEN && !viewerId) {
      throw new NotFoundException('Không tìm thấy bài viết.');
    }
    const [hydrated] = await this.hydratePosts([post], viewerId || undefined);
    return hydrated;
  }

  async listPostsByCourse(courseId: string, viewerId?: string | null, cursor?: string, limit = 20) {
    return this.getFeed(
      { courseId, cursor, limit, sort: CommunityFeedSort.NEW },
      viewerId || undefined,
    );
  }

  async savePost(actor: Actor, postId: string) {
    const post = await this.postModel.findById(postId);
    if (!post || post.status !== CommunityPostStatus.ACTIVE) {
      throw new NotFoundException();
    }
    const uid = new Types.ObjectId(actor.userId);
    const existed = await this.savedModel.findOne({ userId: uid, postId: post._id });
    if (existed) return { saved: true };
    await this.savedModel.create({ userId: uid, postId: post._id });
    await this.postModel.updateOne({ _id: post._id }, { $inc: { saveCount: 1 } });
    return { saved: true };
  }

  async unsavePost(actor: Actor, postId: string) {
    const res = await this.savedModel.deleteOne({
      userId: new Types.ObjectId(actor.userId),
      postId: new Types.ObjectId(postId),
    });
    if (res.deletedCount) {
      await this.postModel.updateOne(
        { _id: new Types.ObjectId(postId) },
        { $inc: { saveCount: -1 } },
      );
    }
    return { saved: false };
  }

  async listSaved(actor: Actor, cursor?: string, limit = 20) {
    const q = this.savedModel
      .find({ userId: new Types.ObjectId(actor.userId) })
      .sort({ createdAt: -1 })
      .limit(limit + 1);
    if (cursor) {
      const [iso, id] = cursor.split('_');
      q.where({
        $or: [
          { createdAt: { $lt: new Date(iso) } },
          { createdAt: new Date(iso), _id: { $lt: new Types.ObjectId(id) } },
        ],
      });
    }
    const saves = await q.lean();
    const hasMore = saves.length > limit;
    const slice = hasMore ? saves.slice(0, limit) : saves;
    const postIds = slice.map((s) => s.postId);
    const posts = await this.postModel
      .find({
        _id: { $in: postIds },
        status: CommunityPostStatus.ACTIVE,
      })
      .lean();
    const order = new Map(postIds.map((id, i) => [id.toString(), i]));
    posts.sort(
      (a, b) =>
        (order.get(a._id.toString()) || 0) - (order.get(b._id.toString()) || 0),
    );
    const items = await this.hydratePosts(posts, actor.userId);
    const last = slice[slice.length - 1];
    const lastSavedCa = last ? (last as any).createdAt as Date : null;
    const nextCursor =
      hasMore && last && lastSavedCa
        ? `${lastSavedCa.toISOString()}_${(last._id as Types.ObjectId).toString()}`
        : null;
    return { items, nextCursor };
  }

  private async recomputePostHot(postId: Types.ObjectId) {
    const post = await this.postModel.findById(postId);
    if (!post) return;
    const rcCreated =
      (post as unknown as { createdAt?: Date }).createdAt || new Date();
    post.hotScore = computeHotScore(
      post.reactionCount,
      post.commentCount,
      rcCreated,
    );
    await post.save();
    if (post.hotScore > 50) {
      await this.profileModel.updateOne(
        { userId: post.authorId },
        { $addToSet: { badges: COMMUNITY_BADGES.HOT_POST } },
      );
    }
  }

  async setPostReaction(actor: Actor, postId: string, kind: CommunityReactionKind) {
    const post = await this.postModel.findById(postId);
    if (!post || post.status !== CommunityPostStatus.ACTIVE) {
      throw new NotFoundException();
    }
    const uid = new Types.ObjectId(actor.userId);
    const tid = post._id as Types.ObjectId;
    const existing = await this.reactionModel.findOne({
      userId: uid,
      targetType: CommunityReactionTarget.POST,
      targetId: tid,
    });
    const breakdown = mergeBreakdown(post.reactionBreakdown as Record<string, number>);
    if (existing) {
      if (existing.kind === kind) {
        return this.getPostById(postId, actor.userId);
      }
      breakdown[existing.kind as CommunityReactionKind] = Math.max(
        0,
        breakdown[existing.kind as CommunityReactionKind] - 1,
      );
      existing.kind = kind;
      await existing.save();
    } else {
      await this.reactionModel.create({
        userId: uid,
        targetType: CommunityReactionTarget.POST,
        targetId: tid,
        kind,
      });
      post.reactionCount += 1;
    }
    breakdown[kind] += 1;
    post.reactionBreakdown = breakdown as CommunityPost['reactionBreakdown'];
    await post.save();
    await this.recomputePostHot(tid);
    return this.getPostById(postId, actor.userId);
  }

  async removePostReaction(actor: Actor, postId: string) {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException();
    const uid = new Types.ObjectId(actor.userId);
    const tid = post._id as Types.ObjectId;
    const existing = await this.reactionModel.findOneAndDelete({
      userId: uid,
      targetType: CommunityReactionTarget.POST,
      targetId: tid,
    });
    if (!existing) return this.getPostById(postId, actor.userId);
    const breakdown = mergeBreakdown(post.reactionBreakdown as Record<string, number>);
    breakdown[existing.kind as CommunityReactionKind] = Math.max(
      0,
      breakdown[existing.kind as CommunityReactionKind] - 1,
    );
    post.reactionBreakdown = breakdown as CommunityPost['reactionBreakdown'];
    post.reactionCount = Math.max(0, post.reactionCount - 1);
    await post.save();
    await this.recomputePostHot(tid);
    return this.getPostById(postId, actor.userId);
  }

  async listComments(postId: string, viewerId?: string | null) {
    const post = await this.postModel.findById(postId);
    if (!post || post.status === CommunityPostStatus.REMOVED) {
      throw new NotFoundException();
    }
    const comments = await this.commentModel
      .find({ postId: post._id, isRemoved: false })
      .sort({ parentCommentId: 1, createdAt: 1 })
      .lean();

    const authorIds = [...new Set(comments.map((c) => c.authorId.toString()))];
    const users = await this.userModel
      .find({ _id: { $in: authorIds.map((id) => new Types.ObjectId(id)) } })
      .select('fullName avatar role teacherVerificationStatus')
      .lean();
    const umap = Object.fromEntries(
      users.map((u: any) => [
        String(u._id),
        {
          id: String(u._id),
          fullName: u.fullName,
          avatar: u.avatar,
          role: u.role,
          teacherVerificationStatus: u.teacherVerificationStatus,
        },
      ]),
    );

    let reactMap = new Map<string, CommunityReactionKind>();
    if (viewerId) {
      const reacts = await this.reactionModel
        .find({
          userId: new Types.ObjectId(viewerId),
          targetType: CommunityReactionTarget.COMMENT,
          targetId: { $in: comments.map((c) => c._id) },
        })
        .lean();
      reacts.forEach((r) =>
        reactMap.set(r.targetId.toString(), r.kind as CommunityReactionKind),
      );
    }

    const shaped = comments.map((c) => ({
      ...c,
      id: c._id.toString(),
      parentCommentId: c.parentCommentId ? c.parentCommentId.toString() : null,
      author: umap[c.authorId.toString()] || null,
      reactionBreakdown: mergeBreakdown(
        c.reactionBreakdown as Record<string, number>,
      ),
      myReaction: viewerId ? reactMap.get(c._id.toString()) || null : null,
    }));

    const bestId = post.bestAnswerCommentId?.toString();
    const pinnedId = post.pinnedCommentId?.toString();
    shaped.sort((a, b) => {
      const aid = a.id;
      const bid = b.id;
      if (bestId && aid === bestId) return -1;
      if (bestId && bid === bestId) return 1;
      if (pinnedId && aid === pinnedId) return -1;
      if (pinnedId && bid === pinnedId) return 1;
      return (
        new Date((a as any).createdAt as Date).getTime() -
        new Date((b as any).createdAt as Date).getTime()
      );
    });

    return { comments: shaped, bestAnswerCommentId: bestId || null, pinnedCommentId: pinnedId || null };
  }

  async createComment(actor: Actor, postId: string, dto: CreateCommunityCommentDto) {
    await this.assertCommunityNotRestricted(actor.userId);
    const post = await this.postModel.findById(postId);
    if (!post || post.status !== CommunityPostStatus.ACTIVE) {
      throw new NotFoundException();
    }
    if (post.commentsLocked && actor.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Bài viết đã khóa bình luận.');
    }
    const attachments = dto.attachments || [];
    let bodyTrim = (dto.body ?? '').trim();
    const hasImageAttachment = attachments.some(
      (a) =>
        a.kind === 'IMAGE' &&
        typeof a.url === 'string' &&
        a.url.trim().length > 0,
    );
    if (!bodyTrim && !hasImageAttachment) {
      throw new BadRequestException('Nội dung bình luận không hợp lệ.');
    }
    if (!bodyTrim && hasImageAttachment) {
      bodyTrim = '[Đính kèm ảnh]';
    }
    const bannedHit = containsBannedTerm(bodyTrim, this.bannedWords());
    if (bannedHit) throw new BadRequestException('Nội dung không hợp lệ.');

    let parent: CommunityCommentDocument | null = null;
    if (dto.parentCommentId) {
      parent = await this.commentModel.findById(dto.parentCommentId);
      if (!parent || parent.postId.toString() !== postId || parent.isRemoved) {
        throw new BadRequestException('Comment cha không hợp lệ.');
      }
    }

    const isTA =
      actor.role === UserRole.TEACHER &&
      actor.teacherVerificationStatus === TeacherVerificationStatus.VERIFIED;

    const comment = await this.commentModel.create({
      postId: post._id,
      authorId: new Types.ObjectId(actor.userId),
      parentCommentId: parent ? parent._id : null,
      body: bodyTrim,
      attachments,
      mentionedUserIds: (dto.mentionedUserIds || []).map((id) => new Types.ObjectId(id)),
      isTeacherAnswer: isTA,
      reactionBreakdown: {},
      reactionCount: 0,
    });

    await this.postModel.updateOne({ _id: post._id }, { $inc: { commentCount: 1 } });
    await this.profileModel.updateOne(
      { userId: new Types.ObjectId(actor.userId) },
      { $inc: { commentsCount: 1 }, $setOnInsert: { userId: new Types.ObjectId(actor.userId) } },
      { upsert: true },
    );
    await this.recomputePostHot(post._id as Types.ObjectId);

    const notifyUserId = parent
      ? parent.authorId.toString()
      : post.authorId.toString();
    if (notifyUserId !== actor.userId) {
      await this.notificationsService.createAndDispatch({
        receiverId: notifyUserId,
        senderId: actor.userId,
        type: NotificationType.COMMUNITY,
        title: 'Hoạt động trong Cộng đồng',
        message: parent
          ? 'Có người trả lời bình luận của bạn.'
          : 'Có bình luận mới trên bài viết của bạn.',
        payload: {
          url: `/community/post/${postId}`,
          postId,
          commentId: comment._id.toString(),
        },
      });
    }

    return comment;
  }

  async updateComment(actor: Actor, commentId: string, dto: UpdateCommunityCommentDto) {
    const c = await this.commentModel.findById(commentId);
    if (!c || c.isRemoved) throw new NotFoundException();
    if (c.authorId.toString() !== actor.userId) throw new ForbiddenException();
    const bannedHit = containsBannedTerm(dto.body, this.bannedWords());
    if (bannedHit) throw new BadRequestException('Nội dung không hợp lệ.');
    c.body = dto.body.trim();
    await c.save();
    return c;
  }

  async deleteComment(actor: Actor, commentId: string) {
    const c = await this.commentModel.findById(commentId);
    if (!c || c.isRemoved) throw new NotFoundException();
    const isOwner = c.authorId.toString() === actor.userId;
    const isAdmin = actor.role === UserRole.ADMIN;
    if (!isOwner && !isAdmin) throw new ForbiddenException();
    c.isRemoved = true;
    await c.save();
    await this.postModel.updateOne(
      { _id: c.postId },
      { $inc: { commentCount: -1 } },
    );
    await this.recomputePostHot(c.postId as Types.ObjectId);
    return { success: true };
  }

  async setCommentReaction(
    actor: Actor,
    commentId: string,
    kind: CommunityReactionKind,
  ) {
    const c = await this.commentModel.findById(commentId);
    if (!c || c.isRemoved) throw new NotFoundException();
    const uid = new Types.ObjectId(actor.userId);
    const tid = c._id as Types.ObjectId;
    const existing = await this.reactionModel.findOne({
      userId: uid,
      targetType: CommunityReactionTarget.COMMENT,
      targetId: tid,
    });
    const breakdown = mergeBreakdown(c.reactionBreakdown as Record<string, number>);
    const adjustHelpful = async (delta: number) => {
      if (delta === 0) return;
      await this.profileModel.updateOne(
        { userId: c.authorId },
        { $inc: { helpfulReceived: delta, reputation: delta * 2 } },
        { upsert: true },
      );
      if (delta > 0) {
        const prof = await this.ensureProfile(c.authorId.toString());
        if (prof.helpfulReceived >= 10) {
          await this.profileModel.updateOne(
            { _id: prof._id },
            { $addToSet: { badges: COMMUNITY_BADGES.HELPFUL_10 } },
          );
        }
      }
    };

    if (existing) {
      if (existing.kind === kind) return { ok: true };
      if (existing.kind === CommunityReactionKind.HELPFUL) await adjustHelpful(-1);
      breakdown[existing.kind as CommunityReactionKind] = Math.max(
        0,
        breakdown[existing.kind as CommunityReactionKind] - 1,
      );
      existing.kind = kind;
      await existing.save();
      if (kind === CommunityReactionKind.HELPFUL) await adjustHelpful(1);
    } else {
      await this.reactionModel.create({
        userId: uid,
        targetType: CommunityReactionTarget.COMMENT,
        targetId: tid,
        kind,
      });
      c.reactionCount += 1;
      if (kind === CommunityReactionKind.HELPFUL) await adjustHelpful(1);
    }
    breakdown[kind] += 1;
    c.reactionBreakdown = breakdown as CommunityComment['reactionBreakdown'];
    await c.save();
    return { ok: true };
  }

  async removeCommentReaction(actor: Actor, commentId: string) {
    const c = await this.commentModel.findById(commentId);
    if (!c || c.isRemoved) throw new NotFoundException();
    const existing = await this.reactionModel.findOneAndDelete({
      userId: new Types.ObjectId(actor.userId),
      targetType: CommunityReactionTarget.COMMENT,
      targetId: c._id,
    });
    if (!existing) return { ok: true };
    if (existing.kind === CommunityReactionKind.HELPFUL) {
      await this.profileModel.updateOne(
        { userId: c.authorId },
        { $inc: { helpfulReceived: -1, reputation: -2 } },
      );
    }
    const breakdown = mergeBreakdown(c.reactionBreakdown as Record<string, number>);
    breakdown[existing.kind as CommunityReactionKind] = Math.max(
      0,
      breakdown[existing.kind as CommunityReactionKind] - 1,
    );
    c.reactionBreakdown = breakdown as CommunityComment['reactionBreakdown'];
    c.reactionCount = Math.max(0, c.reactionCount - 1);
    await c.save();
    return { ok: true };
  }

  async setBestAnswer(actor: Actor, postId: string, commentId: string) {
    const post = await this.postModel.findById(postId);
    if (!post || post.status !== CommunityPostStatus.ACTIVE) {
      throw new NotFoundException();
    }
    const comment = await this.commentModel.findById(commentId);
    if (!comment || comment.isRemoved || comment.postId.toString() !== postId) {
      throw new BadRequestException();
    }
    const isAuthor = post.authorId.toString() === actor.userId;
    const isTeacherOrAdmin =
      this.isVerifiedTeacher(actor) || actor.role === UserRole.ADMIN;
    if (!isAuthor && !isTeacherOrAdmin) {
      throw new ForbiddenException('Chỉ chủ bài hoặc giáo viên/Admin mới đánh dấu hay nhất.');
    }
    if (post.type !== CommunityPostType.HOMEWORK_QUESTION && !isTeacherOrAdmin) {
      throw new BadRequestException('Chỉ bài dạng hỏi bài mới cần best answer từ chủ bài.');
    }

    const prev = post.bestAnswerCommentId;
    post.bestAnswerCommentId = comment._id as Types.ObjectId;
    await post.save();

    if (!prev || prev.toString() !== commentId) {
      await this.profileModel.updateOne(
        { userId: comment.authorId },
        { $inc: { reputation: 50 } },
        { upsert: true },
      );
      await this.notificationsService.createAndDispatch({
        receiverId: comment.authorId.toString(),
        senderId: actor.userId,
        type: NotificationType.COMMUNITY,
        title: 'Cộng đồng',
        message: 'Bình luận của bạn được chọn là câu trả lời hay nhất.',
        payload: { url: `/community/post/${postId}`, postId, commentId },
      });
    }
    return this.listComments(postId, actor.userId);
  }

  async pinComment(actor: Actor, postId: string, commentId: string) {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException();
    const comment = await this.commentModel.findById(commentId);
    if (!comment || comment.postId.toString() !== postId || comment.isRemoved) {
      throw new BadRequestException();
    }
    const isAuthor = post.authorId.toString() === actor.userId;
    const isTeacherOrAdmin =
      this.isVerifiedTeacher(actor) || actor.role === UserRole.ADMIN;
    if (!isAuthor && !isTeacherOrAdmin) throw new ForbiddenException();
    post.pinnedCommentId = comment._id as Types.ObjectId;
    comment.isPinned = true;
    await post.save();
    await comment.save();
    return this.listComments(postId, actor.userId);
  }

  async unpinComment(actor: Actor, postId: string) {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException();
    const isAuthor = post.authorId.toString() === actor.userId;
    const isTeacherOrAdmin =
      this.isVerifiedTeacher(actor) || actor.role === UserRole.ADMIN;
    if (!isAuthor && !isTeacherOrAdmin) throw new ForbiddenException();
    if (post.pinnedCommentId) {
      await this.commentModel.updateOne(
        { _id: post.pinnedCommentId },
        { $set: { isPinned: false } },
      );
      post.pinnedCommentId = null;
      await post.save();
    }
    return this.listComments(postId, actor.userId);
  }

  async createReport(actor: Actor, dto: CreateCommunityReportDto) {
    let postOid: Types.ObjectId | undefined;
    if (dto.postId) {
      postOid = new Types.ObjectId(dto.postId);
    } else if (dto.targetType === CommunityReportTarget.COMMENT) {
      const c = await this.commentModel
        .findById(dto.targetId)
        .select('postId')
        .lean();
      if (c?.postId) postOid = c.postId as Types.ObjectId;
    }
    await this.reportModel.create({
      reporterId: new Types.ObjectId(actor.userId),
      targetType: dto.targetType,
      targetId: new Types.ObjectId(dto.targetId),
      postId: postOid,
      reason: dto.reason.trim(),
      status: CommunityReportStatus.PENDING,
    });
    return { success: true };
  }

  async follow(actor: Actor, targetType: CommunityFollowTarget, targetId: string) {
    const fl = {
      followerId: new Types.ObjectId(actor.userId),
      targetType,
      targetId: new Types.ObjectId(targetId),
    };
    const existed = await this.followModel.findOne(fl);
    await this.followModel.updateOne(fl, { $setOnInsert: fl }, { upsert: true });
    if (
      !existed &&
      targetType === CommunityFollowTarget.USER &&
      targetId !== actor.userId
    ) {
      await this.notificationsService.createAndDispatch({
        receiverId: targetId,
        senderId: actor.userId,
        type: NotificationType.COMMUNITY,
        title: 'Cộng đồng',
        message: 'Có người bắt đầu theo dõi bạn.',
        payload: { url: `/community/profile/${actor.userId}` },
      });
    }
    return { following: true };
  }

  async unfollow(actor: Actor, targetType: CommunityFollowTarget, targetId: string) {
    await this.followModel.deleteOne({
      followerId: new Types.ObjectId(actor.userId),
      targetType,
      targetId: new Types.ObjectId(targetId),
    });
    return { following: false };
  }

  async listFollowing(actor: Actor) {
    return this.followModel
      .find({ followerId: new Types.ObjectId(actor.userId) })
      .sort({ createdAt: -1 })
      .lean();
  }

  async blockUser(actor: Actor, blockedUserId: string) {
    if (blockedUserId === actor.userId) throw new BadRequestException();
    await this.blockModel.updateOne(
      {
        blockerId: new Types.ObjectId(actor.userId),
        blockedUserId: new Types.ObjectId(blockedUserId),
      },
      {
        $setOnInsert: {
          blockerId: new Types.ObjectId(actor.userId),
          blockedUserId: new Types.ObjectId(blockedUserId),
        },
      },
      { upsert: true },
    );
    return { blocked: true };
  }

  async unblockUser(actor: Actor, blockedUserId: string) {
    await this.blockModel.deleteOne({
      blockerId: new Types.ObjectId(actor.userId),
      blockedUserId: new Types.ObjectId(blockedUserId),
    });
    return { blocked: false };
  }

  async getProfile(userId: string, viewerId?: string | null) {
    const user = await this.usersRepository.findByIdSafe(userId, {
      projection: 'fullName avatar role bio teacherVerificationStatus status',
    });
    if (!user || (user as { status?: string }).status !== 'ACTIVE') {
      throw new NotFoundException();
    }
    const prof = await this.ensureProfile(userId);
    const posts = await this.postModel
      .find({ authorId: new Types.ObjectId(userId), status: CommunityPostStatus.ACTIVE })
      .sort({ createdAt: -1 })
      .limit(15)
      .lean();
    const hydrated = await this.hydratePosts(posts, viewerId || undefined);

    let following = false;
    if (viewerId && viewerId !== userId) {
      const f = await this.followModel.exists({
        followerId: new Types.ObjectId(viewerId),
        targetType: CommunityFollowTarget.USER,
        targetId: new Types.ObjectId(userId),
      });
      following = !!f;
    }

    return {
      user: {
        id: userId,
        fullName: (user as { fullName?: string }).fullName,
        avatar: (user as { avatar?: string }).avatar,
        role: (user as { role?: string }).role,
        teacherVerificationStatus: (user as { teacherVerificationStatus?: string })
          .teacherVerificationStatus,
        bio: (user as { bio?: string }).bio,
      },
      community: {
        reputation: prof.reputation,
        badges: prof.badges,
        postsCount: prof.postsCount,
        commentsCount: prof.commentsCount,
        helpfulReceived: prof.helpfulReceived,
      },
      posts: hydrated,
      following,
    };
  }

  async sidebar(viewerId?: string | null) {
    const [featured, contributors, hotCourses, subjectActivity] = await Promise.all([
      this.postModel
        .find({ status: CommunityPostStatus.ACTIVE, isFeatured: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      this.profileModel.find({ reputation: { $gt: 0 } }).sort({ reputation: -1 }).limit(8).lean(),
      this.postModel.aggregate([
        { $match: { type: CommunityPostType.COURSE_SHARE, status: CommunityPostStatus.ACTIVE } },
        { $group: { _id: '$courseId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
      this.postModel.aggregate([
        {
          $match: {
            status: CommunityPostStatus.ACTIVE,
            subjectId: { $exists: true, $ne: null },
          },
        },
        { $group: { _id: '$subjectId', postCount: { $sum: 1 } } },
        { $sort: { postCount: -1 } },
        { $limit: 16 },
      ]),
    ]);
    const featHydrated = await this.hydratePosts(featured, viewerId || undefined);
    const userIds = contributors.map((c) => c.userId);
    const users = await this.userModel
      .find({ _id: { $in: userIds } })
      .select('fullName avatar')
      .lean();
    const umap = Object.fromEntries(users.map((u: any) => [String(u._id), u]));
    const contrib = contributors.map((c) => ({
      userId: c.userId.toString(),
      reputation: c.reputation,
      badges: c.badges,
      user: umap[c.userId.toString()] || null,
    }));

    const subjIds = subjectActivity.map((r: { _id: Types.ObjectId }) => r._id.toString());
    const subjRows = subjIds.length ? await this.subjectsService.findSubjectsByIds(subjIds) : [];
    const subjMap = Object.fromEntries(
      (subjRows as { _id: Types.ObjectId; name: string; code?: string }[]).map((s) => [
        String(s._id),
        s,
      ]),
    );
    const subjectsDirectory = (subjectActivity as { _id: Types.ObjectId; postCount: number }[]).map(
      (r) => {
        const id = r._id.toString();
        const s = subjMap[id] as { name?: string; code?: string } | undefined;
        return {
          subjectId: id,
          postCount: r.postCount,
          name: s?.name || 'Môn học',
          code: s?.code,
        };
      },
    );

    return {
      featuredPosts: featHydrated,
      topContributors: contrib,
      hotCourseShareCounts: hotCourses,
      subjectsDirectory,
    };
  }

  // --- Admin ---
  async adminHidePost(actorId: string, postId: string) {
    await this.postModel.updateOne(
      { _id: new Types.ObjectId(postId) },
      { $set: { status: CommunityPostStatus.HIDDEN } },
    );
    await this.audit(actorId, 'POST_HIDDEN', { postId });
    return { ok: true };
  }

  async adminShowPost(actorId: string, postId: string) {
    await this.postModel.updateOne(
      { _id: new Types.ObjectId(postId) },
      { $set: { status: CommunityPostStatus.ACTIVE } },
    );
    await this.audit(actorId, 'POST_SHOWN', { postId });
    return { ok: true };
  }

  async adminFeaturePost(actorId: string, postId: string, featured: boolean) {
    await this.postModel.updateOne(
      { _id: new Types.ObjectId(postId) },
      { $set: { isFeatured: featured } },
    );
    await this.audit(actorId, featured ? 'POST_FEATURED' : 'POST_UNFEATURED', { postId });
    return { ok: true };
  }

  async adminLockComments(actorId: string, postId: string, locked: boolean) {
    await this.postModel.updateOne(
      { _id: new Types.ObjectId(postId) },
      { $set: { commentsLocked: locked } },
    );
    await this.audit(actorId, locked ? 'COMMENTS_LOCKED' : 'COMMENTS_UNLOCKED', { postId });
    return { ok: true };
  }

  async adminListReports(status?: CommunityReportStatus, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    const [raw, total] = await Promise.all([
      this.reportModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      this.reportModel.countDocuments(filter),
    ]);

    const reporterIds = [...new Set(raw.map((r) => r.reporterId.toString()))];
    const reporters = await this.userModel
      .find({ _id: { $in: reporterIds.map((id) => new Types.ObjectId(id)) } })
      .select('fullName email')
      .lean();
    const repMap = Object.fromEntries(
      reporters.map((u: any) => [
        String(u._id),
        { fullName: u.fullName, email: u.email },
      ]),
    );

    const postTargets = raw
      .filter((r) => r.targetType === CommunityReportTarget.POST)
      .map((r) => r.targetId.toString());
    const commentTargets = raw
      .filter((r) => r.targetType === CommunityReportTarget.COMMENT)
      .map((r) => r.targetId.toString());

    const posts = postTargets.length
      ? await this.postModel
          .find({ _id: { $in: postTargets.map((id) => new Types.ObjectId(id)) } })
          .select('bodyPlain authorId status')
          .lean()
      : [];
    const postMap = Object.fromEntries(posts.map((p: any) => [String(p._id), p]));

    const comments = commentTargets.length
      ? await this.commentModel
          .find({ _id: { $in: commentTargets.map((id) => new Types.ObjectId(id)) } })
          .select('body postId isRemoved')
          .lean()
      : [];
    const comMap = Object.fromEntries(comments.map((c: any) => [String(c._id), c]));

    const items = raw.map((r) => {
      const id = String(r._id);
      const reporter = repMap[r.reporterId.toString()] || null;
      let targetPreview: Record<string, unknown> | null = null;
      if (r.targetType === CommunityReportTarget.POST) {
        const p = postMap[r.targetId.toString()] as any;
        targetPreview = p
          ? {
              kind: 'POST' as const,
              postId: r.targetId.toString(),
              excerpt: (p.bodyPlain || '').slice(0, 200),
              authorId: p.authorId?.toString(),
              status: p.status,
            }
          : { kind: 'POST' as const, postId: r.targetId.toString(), excerpt: '', missing: true };
      } else {
        const c = comMap[r.targetId.toString()] as any;
        targetPreview = c
          ? {
              kind: 'COMMENT' as const,
              commentId: r.targetId.toString(),
              postId: c.postId?.toString(),
              excerpt: (c.body || '').slice(0, 200),
              isRemoved: c.isRemoved,
            }
          : {
              kind: 'COMMENT' as const,
              commentId: r.targetId.toString(),
              postId: r.postId?.toString(),
              excerpt: '',
              missing: true,
            };
      }
      return {
        id,
        reporterId: r.reporterId.toString(),
        reporter,
        targetType: r.targetType,
        targetId: r.targetId.toString(),
        postId: r.postId?.toString() || (targetPreview as any)?.postId,
        reason: r.reason,
        status: r.status,
        createdAt: (r as any).createdAt,
        resolutionNote: r.resolutionNote,
        targetPreview,
      };
    });

    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async adminResolveReport(
    actorId: string,
    reportId: string,
    status: CommunityReportStatus,
    note?: string,
  ) {
    await this.reportModel.updateOne(
      { _id: new Types.ObjectId(reportId) },
      {
        $set: {
          status,
          resolvedBy: new Types.ObjectId(actorId),
          resolutionNote: note,
        },
      },
    );
    await this.audit(actorId, 'REPORT_RESOLVED', { reportId, status });
    return { ok: true };
  }

  async adminSetUserCommunityStatus(
    actorId: string,
    userId: string,
    dto: import('./dto/community-admin.dto').SetUserCommunityStatusDto,
  ) {
    await this.profileModel.updateOne(
      { userId: new Types.ObjectId(userId) },
      {
        $set: {
          communityStatus: dto.communityStatus,
          mutedUntil: dto.mutedUntil ? new Date(dto.mutedUntil) : null,
          moderationNote: dto.moderationNote,
        },
        $setOnInsert: { userId: new Types.ObjectId(userId) },
      },
      { upsert: true },
    );
    await this.audit(actorId, 'USER_COMMUNITY_STATUS', { userId, ...dto });
    return { ok: true };
  }

  async adminAuditLog(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.auditModel.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      this.auditModel.countDocuments({}),
    ]);
    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  /** Gọi từ Bull worker digest */
  async runWeeklyDigestBatch() {
    const weekAgo = new Date(Date.now() - 7 * 86400000);
    const users = await this.profileModel
      .find({
        $or: [
          { lastDigestNotifiedAt: null },
          { lastDigestNotifiedAt: { $lt: weekAgo } },
        ],
        postsCount: { $gte: 0 },
      })
      .limit(200)
      .lean();

    for (const p of users) {
      const hot = await this.postModel
        .find({ status: CommunityPostStatus.ACTIVE, createdAt: { $gte: weekAgo } })
        .sort({ hotScore: -1 })
        .limit(3)
        .select('bodyPlain')
        .lean();
      const summary = hot.map((h) => h.bodyPlain?.slice(0, 80)).join(' · ');
      await this.notificationsService.createAndDispatch({
        receiverId: p.userId.toString(),
        senderId: null,
        type: NotificationType.COMMUNITY,
        title: 'Tóm tắt tuần — Cộng đồng',
        message: summary || 'Khám phá các thảo luận mới trên EArena Community.',
        payload: { url: '/community' },
      });
      await this.profileModel.updateOne(
        { _id: p._id },
        { $set: { lastDigestNotifiedAt: new Date() } },
      );
    }
    return { processed: users.length };
  }
}
