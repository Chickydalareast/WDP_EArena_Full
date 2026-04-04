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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunityService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const user_schema_1 = require("../users/schemas/user.schema");
const config_1 = require("@nestjs/config");
const mongoose_2 = require("mongoose");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
const user_schema_2 = require("../users/schemas/user.schema");
const courses_repository_1 = require("../courses/courses.repository");
const course_schema_1 = require("../courses/schemas/course.schema");
const exams_repository_1 = require("../exams/exams.repository");
const notifications_service_1 = require("../notifications/notifications.service");
const notification_event_constant_1 = require("../notifications/constants/notification-event.constant");
const users_repository_1 = require("../users/users.repository");
const subjects_service_1 = require("../taxonomy/subjects.service");
const storage_provider_interface_1 = require("../media/interfaces/storage-provider.interface");
const community_post_schema_1 = require("./schemas/community-post.schema");
const community_comment_schema_1 = require("./schemas/community-comment.schema");
const community_reaction_schema_1 = require("./schemas/community-reaction.schema");
const community_saved_post_schema_1 = require("./schemas/community-saved-post.schema");
const community_report_schema_1 = require("./schemas/community-report.schema");
const community_follow_schema_1 = require("./schemas/community-follow.schema");
const community_block_schema_1 = require("./schemas/community-block.schema");
const community_user_profile_schema_1 = require("./schemas/community-user-profile.schema");
const community_moderation_audit_schema_1 = require("./schemas/community-moderation-audit.schema");
const community_constants_1 = require("./constants/community.constants");
const community_feed_query_dto_1 = require("./dto/community-feed-query.dto");
const community_text_util_1 = require("./utils/community-text.util");
let CommunityService = class CommunityService {
    userModel;
    postModel;
    commentModel;
    reactionModel;
    savedModel;
    reportModel;
    followModel;
    blockModel;
    profileModel;
    auditModel;
    configService;
    coursesRepository;
    examsRepository;
    notificationsService;
    usersRepository;
    subjectsService;
    cloudinaryProvider;
    constructor(userModel, postModel, commentModel, reactionModel, savedModel, reportModel, followModel, blockModel, profileModel, auditModel, configService, coursesRepository, examsRepository, notificationsService, usersRepository, subjectsService, cloudinaryProvider) {
        this.userModel = userModel;
        this.postModel = postModel;
        this.commentModel = commentModel;
        this.reactionModel = reactionModel;
        this.savedModel = savedModel;
        this.reportModel = reportModel;
        this.followModel = followModel;
        this.blockModel = blockModel;
        this.profileModel = profileModel;
        this.auditModel = auditModel;
        this.configService = configService;
        this.coursesRepository = coursesRepository;
        this.examsRepository = examsRepository;
        this.notificationsService = notificationsService;
        this.usersRepository = usersRepository;
        this.subjectsService = subjectsService;
        this.cloudinaryProvider = cloudinaryProvider;
    }
    communityImageFolder = 'earena/community';
    async uploadAttachmentImage(userId, file) {
        await this.assertCommunityNotRestricted(userId);
        if (!file?.buffer?.length) {
            throw new common_1.BadRequestException('File ảnh không hợp lệ.');
        }
        const mime = (file.mimetype || '').toLowerCase();
        const name = file.originalname || 'image';
        if (mime === 'image/svg+xml') {
            throw new common_1.BadRequestException('Không chấp nhận ảnh SVG.');
        }
        const allowedMime = new Set([
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif',
            'image/bmp',
            'image/heic',
            'image/heif',
            'image/avif',
        ]);
        const extOk = /\.(jpe?g|png|gif|webp|bmp|heic|heif|avif)$/i.test(name);
        const mimeOk = (mime.startsWith('image/') && allowedMime.has(mime)) ||
            (!mime && extOk) ||
            (mime === 'application/octet-stream' && extOk);
        if (!mimeOk) {
            throw new common_1.BadRequestException('Chỉ chấp nhận ảnh JPEG, PNG, WebP, GIF, BMP, HEIC hoặc AVIF.');
        }
        const folder = `${this.communityImageFolder}/${userId}`;
        const meta = await this.cloudinaryProvider.uploadImageBuffer(file.buffer, folder);
        return { url: meta.url, name };
    }
    bannedWords() {
        const raw = this.configService.get('COMMUNITY_BANNED_WORDS') || '';
        return raw
            .split(',')
            .map((s) => s.trim().toLowerCase())
            .filter(Boolean);
    }
    async audit(actorId, action, meta = {}) {
        await this.auditModel.create({
            actorId: new mongoose_2.Types.ObjectId(actorId),
            action,
            meta,
        });
    }
    async ensureProfile(userId) {
        let p = await this.profileModel.findOne({
            userId: new mongoose_2.Types.ObjectId(userId),
        });
        if (!p) {
            p = await this.profileModel.create({
                userId: new mongoose_2.Types.ObjectId(userId),
            });
        }
        return p;
    }
    async assertCommunityNotRestricted(userId) {
        const p = await this.ensureProfile(userId);
        if (p.communityStatus === community_constants_1.CommunityUserCommunityStatus.BANNED) {
            throw new common_1.ForbiddenException('Tài khoản của bạn không thể tham gia cộng đồng.');
        }
        if (p.communityStatus === community_constants_1.CommunityUserCommunityStatus.MUTED &&
            p.mutedUntil &&
            p.mutedUntil > new Date()) {
            throw new common_1.ForbiddenException('Tài khoản đang tạm khóa đăng bài trong cộng đồng.');
        }
    }
    isVerifiedTeacher(actor) {
        return (actor.role === user_role_enum_1.UserRole.TEACHER &&
            actor.teacherVerificationStatus === user_schema_2.TeacherVerificationStatus.VERIFIED);
    }
    async buildCourseSnapshot(courseId) {
        const raw = await this.coursesRepository.getCourseDetailById(courseId);
        if (!raw || raw.status !== course_schema_1.CourseStatus.PUBLISHED) {
            throw new common_1.BadRequestException('Khóa học không tồn tại hoặc chưa được công khai.');
        }
        const c = raw;
        const cover = c.coverImageId;
        const tid = c.teacherId;
        const teacherIdStr = tid && typeof tid === 'object' && '_id' in tid && tid._id
            ? tid._id.toString()
            : tid.toString();
        const teacherUser = await this.usersRepository.findByIdSafe(teacherIdStr, {
            projection: 'fullName',
        });
        return {
            courseId: new mongoose_2.Types.ObjectId(courseId),
            title: String(c.title),
            slug: String(c.slug),
            coverUrl: cover?.url,
            price: Number(c.price) || 0,
            discountPrice: c.discountPrice != null ? Number(c.discountPrice) : undefined,
            teacherName: teacherUser?.fullName || 'Giáo viên',
            teacherId: new mongoose_2.Types.ObjectId(teacherIdStr),
            averageRating: Number(c.averageRating) || 0,
            totalReviews: Number(c.totalReviews) || 0,
        };
    }
    async createPost(actor, dto) {
        await this.assertCommunityNotRestricted(actor.userId);
        const bodyPlain = (0, community_text_util_1.resolvePostBodyPlainForSave)(dto.bodyJson, dto.attachments);
        if (bodyPlain === null) {
            throw new common_1.BadRequestException('Nội dung bài viết không hợp lệ.');
        }
        const bannedHit = (0, community_text_util_1.containsBannedTerm)(bodyPlain, this.bannedWords());
        if (bannedHit) {
            throw new common_1.BadRequestException('Nội dung chứa từ ngữ không được phép.');
        }
        if (dto.type === community_constants_1.CommunityPostType.COURSE_SHARE && !dto.courseId) {
            throw new common_1.BadRequestException('Vui lòng chọn khóa học để chia sẻ.');
        }
        let courseSnapshot;
        let courseOid;
        if (dto.courseId) {
            courseSnapshot = await this.buildCourseSnapshot(dto.courseId);
            courseOid = new mongoose_2.Types.ObjectId(dto.courseId);
        }
        if (dto.examId) {
            const exam = await this.examsRepository.findByIdSafe(dto.examId);
            if (!exam)
                throw new common_1.BadRequestException('Đề thi không tồn tại.');
        }
        const post = await this.postModel.create({
            authorId: new mongoose_2.Types.ObjectId(actor.userId),
            type: dto.type,
            status: community_constants_1.CommunityPostStatus.ACTIVE,
            bodyJson: dto.bodyJson,
            bodyPlain,
            attachments: dto.attachments || [],
            tags: (dto.tags || []).map((t) => t.replace(/^#/, '').trim()).filter(Boolean),
            subjectId: dto.subjectId ? new mongoose_2.Types.ObjectId(dto.subjectId) : undefined,
            courseId: courseOid,
            examId: dto.examId ? new mongoose_2.Types.ObjectId(dto.examId) : undefined,
            courseSnapshot,
            commentCount: 0,
            reactionCount: 0,
            saveCount: 0,
            reactionBreakdown: {},
            hotScore: 0,
        });
        const created = post;
        const createdAt = created.createdAt || new Date();
        created.hotScore = (0, community_text_util_1.computeHotScore)(0, 0, createdAt);
        await created.save();
        await this.profileModel.updateOne({ userId: new mongoose_2.Types.ObjectId(actor.userId) }, {
            $inc: { postsCount: 1 },
            $setOnInsert: { userId: new mongoose_2.Types.ObjectId(actor.userId) },
        }, { upsert: true });
        const profAfter = await this.ensureProfile(actor.userId);
        const badges = new Set(profAfter.badges || []);
        badges.add(community_constants_1.COMMUNITY_BADGES.FIRST_STEP);
        if (profAfter.postsCount >= 20)
            badges.add(community_constants_1.COMMUNITY_BADGES.CONTRIBUTOR);
        if (this.isVerifiedTeacher(actor))
            badges.add(community_constants_1.COMMUNITY_BADGES.TEACHER_VOICE);
        await this.profileModel.updateOne({ _id: profAfter._id }, { $set: { badges: [...badges] } });
        return this.getPostById(created._id.toString(), actor.userId);
    }
    async updatePost(actor, postId, dto) {
        const post = await this.postModel.findById(postId);
        if (!post || post.status === community_constants_1.CommunityPostStatus.REMOVED) {
            throw new common_1.NotFoundException('Không tìm thấy bài viết.');
        }
        if (post.authorId.toString() !== actor.userId) {
            throw new common_1.ForbiddenException('Bạn không thể sửa bài viết này.');
        }
        if (dto.bodyJson) {
            const mergedAttachments = dto.attachments !== undefined ? dto.attachments : post.attachments;
            const bodyPlain = (0, community_text_util_1.resolvePostBodyPlainForSave)(dto.bodyJson, mergedAttachments);
            if (bodyPlain === null) {
                throw new common_1.BadRequestException('Nội dung không hợp lệ.');
            }
            const bannedHit = (0, community_text_util_1.containsBannedTerm)(bodyPlain, this.bannedWords());
            if (bannedHit) {
                throw new common_1.BadRequestException('Nội dung chứa từ ngữ không được phép.');
            }
            post.bodyJson = dto.bodyJson;
            post.bodyPlain = bodyPlain;
        }
        if (dto.attachments)
            post.attachments = dto.attachments;
        if (dto.tags) {
            post.tags = dto.tags.map((t) => t.replace(/^#/, '').trim()).filter(Boolean);
        }
        if (dto.subjectId !== undefined) {
            post.subjectId = dto.subjectId
                ? new mongoose_2.Types.ObjectId(dto.subjectId)
                : undefined;
        }
        const upCreated = post.createdAt || new Date();
        post.hotScore = (0, community_text_util_1.computeHotScore)(post.reactionCount, post.commentCount, upCreated);
        await post.save();
        return this.getPostById(postId, actor.userId);
    }
    async deletePost(actor, postId) {
        const post = await this.postModel.findById(postId);
        if (!post)
            throw new common_1.NotFoundException('Không tìm thấy bài viết.');
        const isOwner = post.authorId.toString() === actor.userId;
        const isAdmin = actor.role === user_role_enum_1.UserRole.ADMIN;
        if (!isOwner && !isAdmin)
            throw new common_1.ForbiddenException();
        post.status = community_constants_1.CommunityPostStatus.REMOVED;
        await post.save();
        await this.audit(actor.userId, 'POST_REMOVED', { postId });
        return { success: true };
    }
    async blockedAuthorIds(viewerId) {
        if (!viewerId)
            return [];
        const rows = await this.blockModel
            .find({ blockerId: new mongoose_2.Types.ObjectId(viewerId) })
            .select('blockedUserId')
            .lean();
        return rows.map((r) => r.blockedUserId);
    }
    async getFeed(query, viewerId) {
        const limit = Math.min(Math.max(query.limit || 20, 1), 50);
        const filter = { status: community_constants_1.CommunityPostStatus.ACTIVE };
        const blocked = await this.blockedAuthorIds(viewerId || undefined);
        if (blocked.length) {
            filter.authorId = { $nin: blocked };
        }
        if (query.type)
            filter.type = query.type;
        if (query.subjectId)
            filter.subjectId = new mongoose_2.Types.ObjectId(query.subjectId);
        if (query.courseId)
            filter.courseId = new mongoose_2.Types.ObjectId(query.courseId);
        if (query.examId)
            filter.examId = new mongoose_2.Types.ObjectId(query.examId);
        if (query.q?.trim()) {
            filter.$text = { $search: query.q.trim() };
        }
        let sort = { createdAt: -1 };
        if (query.sort === community_feed_query_dto_1.CommunityFeedSort.HOT) {
            sort = { hotScore: -1, createdAt: -1 };
        }
        else if (query.sort === community_feed_query_dto_1.CommunityFeedSort.FOLLOWING && viewerId) {
            const follows = await this.followModel
                .find({ followerId: new mongoose_2.Types.ObjectId(viewerId), targetType: community_constants_1.CommunityFollowTarget.USER })
                .select('targetId')
                .lean();
            const ids = follows.map((f) => f.targetId);
            if (!ids.length)
                return { items: [], nextCursor: null };
            const blockedSet = new Set(blocked.map((b) => b.toString()));
            const allowed = ids.filter((id) => !blockedSet.has(id.toString()));
            if (!allowed.length)
                return { items: [], nextCursor: null };
            filter.authorId = { $in: allowed };
        }
        else if (query.sort === community_feed_query_dto_1.CommunityFeedSort.FOR_YOU && viewerId) {
            const prof = await this.profileModel
                .findOne({ userId: new mongoose_2.Types.ObjectId(viewerId) })
                .lean();
            const mine = await this.postModel
                .find({ authorId: new mongoose_2.Types.ObjectId(viewerId) })
                .select('subjectId')
                .limit(30)
                .lean();
            const subj = new Set();
            mine.forEach((p) => {
                if (p.subjectId)
                    subj.add(p.subjectId.toString());
            });
            if (subj.size) {
                filter.subjectId = { $in: [...subj].map((s) => new mongoose_2.Types.ObjectId(s)) };
            }
        }
        const q = this.postModel.find(filter).sort(sort).limit(limit + 1);
        if (query.cursor) {
            const [created, id] = query.cursor.split('_');
            const cid = new mongoose_2.Types.ObjectId(id);
            const cdate = new Date(created);
            if (query.sort === community_feed_query_dto_1.CommunityFeedSort.HOT) {
                const cur = await this.postModel.findById(cid).lean();
                if (cur) {
                    const curCa = cur.createdAt;
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
            }
            else {
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
        const lastCa = last ? last.createdAt : null;
        const nextCursor = hasMore && last && lastCa
            ? `${lastCa.toISOString()}_${last._id.toString()}`
            : null;
        return { items, nextCursor };
    }
    async getRecommended(viewerId, limit = 20) {
        return this.getFeed({ sort: community_feed_query_dto_1.CommunityFeedSort.FOR_YOU, limit }, viewerId);
    }
    async hydratePosts(posts, viewerId) {
        const authorIds = [...new Set(posts.map((p) => String(p.authorId)))];
        const users = await this.userModel
            .find({ _id: { $in: authorIds.map((id) => new mongoose_2.Types.ObjectId(id)) } })
            .select('fullName avatar role teacherVerificationStatus')
            .lean();
        const umap = Object.fromEntries(users.map((u) => [
            String(u._id),
            {
                id: String(u._id),
                fullName: u.fullName,
                avatar: u.avatar,
                role: u.role,
                teacherVerificationStatus: u.teacherVerificationStatus,
            },
        ]));
        let savedSet = new Set();
        let reactionMap = new Map();
        if (viewerId && posts.length) {
            const pids = posts.map((p) => p._id);
            const [saved, reacts] = await Promise.all([
                this.savedModel
                    .find({
                    userId: new mongoose_2.Types.ObjectId(viewerId),
                    postId: { $in: pids },
                })
                    .select('postId')
                    .lean(),
                this.reactionModel
                    .find({
                    userId: new mongoose_2.Types.ObjectId(viewerId),
                    targetType: community_constants_1.CommunityReactionTarget.POST,
                    targetId: { $in: pids },
                })
                    .lean(),
            ]);
            savedSet = new Set(saved.map((s) => s.postId.toString()));
            reacts.forEach((r) => reactionMap.set(r.targetId.toString(), r.kind));
        }
        const base = posts.map((p) => {
            const id = String(p._id);
            const author = umap[String(p.authorId)] || null;
            return {
                ...p,
                id,
                author,
                reactionBreakdown: (0, community_text_util_1.mergeBreakdown)(p.reactionBreakdown),
                savedByMe: viewerId ? savedSet.has(id) : false,
                myReaction: viewerId ? reactionMap.get(id) || null : null,
            };
        });
        const subjectIds = [
            ...new Set(posts
                .map((p) => p.subjectId)
                .filter(Boolean)
                .map((x) => x.toString())),
        ];
        if (!subjectIds.length) {
            return base.map((h) => ({ ...h, subject: null }));
        }
        const subjRows = await this.subjectsService.findSubjectsByIds(subjectIds);
        const smap = Object.fromEntries(subjRows.map((s) => [
            String(s._id),
            { id: String(s._id), name: s.name, code: s.code },
        ]));
        return base.map((h) => {
            const sid = h.subjectId;
            const key = sid ? String(sid) : '';
            return { ...h, subject: key && smap[key] ? smap[key] : null };
        });
    }
    async getPostById(postId, viewerId) {
        const post = await this.postModel.findById(postId).lean();
        if (!post || post.status === community_constants_1.CommunityPostStatus.REMOVED) {
            throw new common_1.NotFoundException('Không tìm thấy bài viết.');
        }
        if (post.status === community_constants_1.CommunityPostStatus.HIDDEN && !viewerId) {
            throw new common_1.NotFoundException('Không tìm thấy bài viết.');
        }
        const [hydrated] = await this.hydratePosts([post], viewerId || undefined);
        return hydrated;
    }
    async listPostsByCourse(courseId, viewerId, cursor, limit = 20) {
        return this.getFeed({ courseId, cursor, limit, sort: community_feed_query_dto_1.CommunityFeedSort.NEW }, viewerId || undefined);
    }
    async savePost(actor, postId) {
        const post = await this.postModel.findById(postId);
        if (!post || post.status !== community_constants_1.CommunityPostStatus.ACTIVE) {
            throw new common_1.NotFoundException();
        }
        const uid = new mongoose_2.Types.ObjectId(actor.userId);
        const existed = await this.savedModel.findOne({ userId: uid, postId: post._id });
        if (existed)
            return { saved: true };
        await this.savedModel.create({ userId: uid, postId: post._id });
        await this.postModel.updateOne({ _id: post._id }, { $inc: { saveCount: 1 } });
        return { saved: true };
    }
    async unsavePost(actor, postId) {
        const res = await this.savedModel.deleteOne({
            userId: new mongoose_2.Types.ObjectId(actor.userId),
            postId: new mongoose_2.Types.ObjectId(postId),
        });
        if (res.deletedCount) {
            await this.postModel.updateOne({ _id: new mongoose_2.Types.ObjectId(postId) }, { $inc: { saveCount: -1 } });
        }
        return { saved: false };
    }
    async listSaved(actor, cursor, limit = 20) {
        const q = this.savedModel
            .find({ userId: new mongoose_2.Types.ObjectId(actor.userId) })
            .sort({ createdAt: -1 })
            .limit(limit + 1);
        if (cursor) {
            const [iso, id] = cursor.split('_');
            q.where({
                $or: [
                    { createdAt: { $lt: new Date(iso) } },
                    { createdAt: new Date(iso), _id: { $lt: new mongoose_2.Types.ObjectId(id) } },
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
            status: community_constants_1.CommunityPostStatus.ACTIVE,
        })
            .lean();
        const order = new Map(postIds.map((id, i) => [id.toString(), i]));
        posts.sort((a, b) => (order.get(a._id.toString()) || 0) - (order.get(b._id.toString()) || 0));
        const items = await this.hydratePosts(posts, actor.userId);
        const last = slice[slice.length - 1];
        const lastSavedCa = last ? last.createdAt : null;
        const nextCursor = hasMore && last && lastSavedCa
            ? `${lastSavedCa.toISOString()}_${last._id.toString()}`
            : null;
        return { items, nextCursor };
    }
    async recomputePostHot(postId) {
        const post = await this.postModel.findById(postId);
        if (!post)
            return;
        const rcCreated = post.createdAt || new Date();
        post.hotScore = (0, community_text_util_1.computeHotScore)(post.reactionCount, post.commentCount, rcCreated);
        await post.save();
        if (post.hotScore > 50) {
            await this.profileModel.updateOne({ userId: post.authorId }, { $addToSet: { badges: community_constants_1.COMMUNITY_BADGES.HOT_POST } });
        }
    }
    async setPostReaction(actor, postId, kind) {
        const post = await this.postModel.findById(postId);
        if (!post || post.status !== community_constants_1.CommunityPostStatus.ACTIVE) {
            throw new common_1.NotFoundException();
        }
        const uid = new mongoose_2.Types.ObjectId(actor.userId);
        const tid = post._id;
        const existing = await this.reactionModel.findOne({
            userId: uid,
            targetType: community_constants_1.CommunityReactionTarget.POST,
            targetId: tid,
        });
        const breakdown = (0, community_text_util_1.mergeBreakdown)(post.reactionBreakdown);
        if (existing) {
            if (existing.kind === kind) {
                return this.getPostById(postId, actor.userId);
            }
            breakdown[existing.kind] = Math.max(0, breakdown[existing.kind] - 1);
            existing.kind = kind;
            await existing.save();
        }
        else {
            await this.reactionModel.create({
                userId: uid,
                targetType: community_constants_1.CommunityReactionTarget.POST,
                targetId: tid,
                kind,
            });
            post.reactionCount += 1;
        }
        breakdown[kind] += 1;
        post.reactionBreakdown = breakdown;
        await post.save();
        await this.recomputePostHot(tid);
        return this.getPostById(postId, actor.userId);
    }
    async removePostReaction(actor, postId) {
        const post = await this.postModel.findById(postId);
        if (!post)
            throw new common_1.NotFoundException();
        const uid = new mongoose_2.Types.ObjectId(actor.userId);
        const tid = post._id;
        const existing = await this.reactionModel.findOneAndDelete({
            userId: uid,
            targetType: community_constants_1.CommunityReactionTarget.POST,
            targetId: tid,
        });
        if (!existing)
            return this.getPostById(postId, actor.userId);
        const breakdown = (0, community_text_util_1.mergeBreakdown)(post.reactionBreakdown);
        breakdown[existing.kind] = Math.max(0, breakdown[existing.kind] - 1);
        post.reactionBreakdown = breakdown;
        post.reactionCount = Math.max(0, post.reactionCount - 1);
        await post.save();
        await this.recomputePostHot(tid);
        return this.getPostById(postId, actor.userId);
    }
    async listComments(postId, viewerId) {
        const post = await this.postModel.findById(postId);
        if (!post || post.status === community_constants_1.CommunityPostStatus.REMOVED) {
            throw new common_1.NotFoundException();
        }
        const comments = await this.commentModel
            .find({ postId: post._id, isRemoved: false })
            .sort({ parentCommentId: 1, createdAt: 1 })
            .lean();
        const authorIds = [...new Set(comments.map((c) => c.authorId.toString()))];
        const users = await this.userModel
            .find({ _id: { $in: authorIds.map((id) => new mongoose_2.Types.ObjectId(id)) } })
            .select('fullName avatar role teacherVerificationStatus')
            .lean();
        const umap = Object.fromEntries(users.map((u) => [
            String(u._id),
            {
                id: String(u._id),
                fullName: u.fullName,
                avatar: u.avatar,
                role: u.role,
                teacherVerificationStatus: u.teacherVerificationStatus,
            },
        ]));
        let reactMap = new Map();
        if (viewerId) {
            const reacts = await this.reactionModel
                .find({
                userId: new mongoose_2.Types.ObjectId(viewerId),
                targetType: community_constants_1.CommunityReactionTarget.COMMENT,
                targetId: { $in: comments.map((c) => c._id) },
            })
                .lean();
            reacts.forEach((r) => reactMap.set(r.targetId.toString(), r.kind));
        }
        const shaped = comments.map((c) => ({
            ...c,
            id: c._id.toString(),
            parentCommentId: c.parentCommentId ? c.parentCommentId.toString() : null,
            author: umap[c.authorId.toString()] || null,
            reactionBreakdown: (0, community_text_util_1.mergeBreakdown)(c.reactionBreakdown),
            myReaction: viewerId ? reactMap.get(c._id.toString()) || null : null,
        }));
        const bestId = post.bestAnswerCommentId?.toString();
        const pinnedId = post.pinnedCommentId?.toString();
        shaped.sort((a, b) => {
            const aid = a.id;
            const bid = b.id;
            if (bestId && aid === bestId)
                return -1;
            if (bestId && bid === bestId)
                return 1;
            if (pinnedId && aid === pinnedId)
                return -1;
            if (pinnedId && bid === pinnedId)
                return 1;
            return (new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime());
        });
        return { comments: shaped, bestAnswerCommentId: bestId || null, pinnedCommentId: pinnedId || null };
    }
    async createComment(actor, postId, dto) {
        await this.assertCommunityNotRestricted(actor.userId);
        const post = await this.postModel.findById(postId);
        if (!post || post.status !== community_constants_1.CommunityPostStatus.ACTIVE) {
            throw new common_1.NotFoundException();
        }
        if (post.commentsLocked && actor.role !== user_role_enum_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('Bài viết đã khóa bình luận.');
        }
        const attachments = dto.attachments || [];
        let bodyTrim = (dto.body ?? '').trim();
        const hasImageAttachment = attachments.some((a) => a.kind === 'IMAGE' &&
            typeof a.url === 'string' &&
            a.url.trim().length > 0);
        if (!bodyTrim && !hasImageAttachment) {
            throw new common_1.BadRequestException('Nội dung bình luận không hợp lệ.');
        }
        if (!bodyTrim && hasImageAttachment) {
            bodyTrim = '[Đính kèm ảnh]';
        }
        const bannedHit = (0, community_text_util_1.containsBannedTerm)(bodyTrim, this.bannedWords());
        if (bannedHit)
            throw new common_1.BadRequestException('Nội dung không hợp lệ.');
        let parent = null;
        if (dto.parentCommentId) {
            parent = await this.commentModel.findById(dto.parentCommentId);
            if (!parent || parent.postId.toString() !== postId || parent.isRemoved) {
                throw new common_1.BadRequestException('Comment cha không hợp lệ.');
            }
        }
        const isTA = actor.role === user_role_enum_1.UserRole.TEACHER &&
            actor.teacherVerificationStatus === user_schema_2.TeacherVerificationStatus.VERIFIED;
        const comment = await this.commentModel.create({
            postId: post._id,
            authorId: new mongoose_2.Types.ObjectId(actor.userId),
            parentCommentId: parent ? parent._id : null,
            body: bodyTrim,
            attachments,
            mentionedUserIds: (dto.mentionedUserIds || []).map((id) => new mongoose_2.Types.ObjectId(id)),
            isTeacherAnswer: isTA,
            reactionBreakdown: {},
            reactionCount: 0,
        });
        await this.postModel.updateOne({ _id: post._id }, { $inc: { commentCount: 1 } });
        await this.profileModel.updateOne({ userId: new mongoose_2.Types.ObjectId(actor.userId) }, { $inc: { commentsCount: 1 }, $setOnInsert: { userId: new mongoose_2.Types.ObjectId(actor.userId) } }, { upsert: true });
        await this.recomputePostHot(post._id);
        const notifyUserId = parent
            ? parent.authorId.toString()
            : post.authorId.toString();
        if (notifyUserId !== actor.userId) {
            await this.notificationsService.createAndDispatch({
                receiverId: notifyUserId,
                senderId: actor.userId,
                type: notification_event_constant_1.NotificationType.COMMUNITY,
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
    async updateComment(actor, commentId, dto) {
        const c = await this.commentModel.findById(commentId);
        if (!c || c.isRemoved)
            throw new common_1.NotFoundException();
        if (c.authorId.toString() !== actor.userId)
            throw new common_1.ForbiddenException();
        const bannedHit = (0, community_text_util_1.containsBannedTerm)(dto.body, this.bannedWords());
        if (bannedHit)
            throw new common_1.BadRequestException('Nội dung không hợp lệ.');
        c.body = dto.body.trim();
        await c.save();
        return c;
    }
    async deleteComment(actor, commentId) {
        const c = await this.commentModel.findById(commentId);
        if (!c || c.isRemoved)
            throw new common_1.NotFoundException();
        const isOwner = c.authorId.toString() === actor.userId;
        const isAdmin = actor.role === user_role_enum_1.UserRole.ADMIN;
        if (!isOwner && !isAdmin)
            throw new common_1.ForbiddenException();
        c.isRemoved = true;
        await c.save();
        await this.postModel.updateOne({ _id: c.postId }, { $inc: { commentCount: -1 } });
        await this.recomputePostHot(c.postId);
        return { success: true };
    }
    async setCommentReaction(actor, commentId, kind) {
        const c = await this.commentModel.findById(commentId);
        if (!c || c.isRemoved)
            throw new common_1.NotFoundException();
        const uid = new mongoose_2.Types.ObjectId(actor.userId);
        const tid = c._id;
        const existing = await this.reactionModel.findOne({
            userId: uid,
            targetType: community_constants_1.CommunityReactionTarget.COMMENT,
            targetId: tid,
        });
        const breakdown = (0, community_text_util_1.mergeBreakdown)(c.reactionBreakdown);
        const adjustHelpful = async (delta) => {
            if (delta === 0)
                return;
            await this.profileModel.updateOne({ userId: c.authorId }, { $inc: { helpfulReceived: delta, reputation: delta * 2 } }, { upsert: true });
            if (delta > 0) {
                const prof = await this.ensureProfile(c.authorId.toString());
                if (prof.helpfulReceived >= 10) {
                    await this.profileModel.updateOne({ _id: prof._id }, { $addToSet: { badges: community_constants_1.COMMUNITY_BADGES.HELPFUL_10 } });
                }
            }
        };
        if (existing) {
            if (existing.kind === kind)
                return { ok: true };
            if (existing.kind === community_constants_1.CommunityReactionKind.HELPFUL)
                await adjustHelpful(-1);
            breakdown[existing.kind] = Math.max(0, breakdown[existing.kind] - 1);
            existing.kind = kind;
            await existing.save();
            if (kind === community_constants_1.CommunityReactionKind.HELPFUL)
                await adjustHelpful(1);
        }
        else {
            await this.reactionModel.create({
                userId: uid,
                targetType: community_constants_1.CommunityReactionTarget.COMMENT,
                targetId: tid,
                kind,
            });
            c.reactionCount += 1;
            if (kind === community_constants_1.CommunityReactionKind.HELPFUL)
                await adjustHelpful(1);
        }
        breakdown[kind] += 1;
        c.reactionBreakdown = breakdown;
        await c.save();
        return { ok: true };
    }
    async removeCommentReaction(actor, commentId) {
        const c = await this.commentModel.findById(commentId);
        if (!c || c.isRemoved)
            throw new common_1.NotFoundException();
        const existing = await this.reactionModel.findOneAndDelete({
            userId: new mongoose_2.Types.ObjectId(actor.userId),
            targetType: community_constants_1.CommunityReactionTarget.COMMENT,
            targetId: c._id,
        });
        if (!existing)
            return { ok: true };
        if (existing.kind === community_constants_1.CommunityReactionKind.HELPFUL) {
            await this.profileModel.updateOne({ userId: c.authorId }, { $inc: { helpfulReceived: -1, reputation: -2 } });
        }
        const breakdown = (0, community_text_util_1.mergeBreakdown)(c.reactionBreakdown);
        breakdown[existing.kind] = Math.max(0, breakdown[existing.kind] - 1);
        c.reactionBreakdown = breakdown;
        c.reactionCount = Math.max(0, c.reactionCount - 1);
        await c.save();
        return { ok: true };
    }
    async setBestAnswer(actor, postId, commentId) {
        const post = await this.postModel.findById(postId);
        if (!post || post.status !== community_constants_1.CommunityPostStatus.ACTIVE) {
            throw new common_1.NotFoundException();
        }
        const comment = await this.commentModel.findById(commentId);
        if (!comment || comment.isRemoved || comment.postId.toString() !== postId) {
            throw new common_1.BadRequestException();
        }
        const isAuthor = post.authorId.toString() === actor.userId;
        const isTeacherOrAdmin = this.isVerifiedTeacher(actor) || actor.role === user_role_enum_1.UserRole.ADMIN;
        if (!isAuthor && !isTeacherOrAdmin) {
            throw new common_1.ForbiddenException('Chỉ chủ bài hoặc giáo viên/Admin mới đánh dấu hay nhất.');
        }
        if (post.type !== community_constants_1.CommunityPostType.HOMEWORK_QUESTION && !isTeacherOrAdmin) {
            throw new common_1.BadRequestException('Chỉ bài dạng hỏi bài mới cần best answer từ chủ bài.');
        }
        const prev = post.bestAnswerCommentId;
        post.bestAnswerCommentId = comment._id;
        await post.save();
        if (!prev || prev.toString() !== commentId) {
            await this.profileModel.updateOne({ userId: comment.authorId }, { $inc: { reputation: 50 } }, { upsert: true });
            await this.notificationsService.createAndDispatch({
                receiverId: comment.authorId.toString(),
                senderId: actor.userId,
                type: notification_event_constant_1.NotificationType.COMMUNITY,
                title: 'Cộng đồng',
                message: 'Bình luận của bạn được chọn là câu trả lời hay nhất.',
                payload: { url: `/community/post/${postId}`, postId, commentId },
            });
        }
        return this.listComments(postId, actor.userId);
    }
    async pinComment(actor, postId, commentId) {
        const post = await this.postModel.findById(postId);
        if (!post)
            throw new common_1.NotFoundException();
        const comment = await this.commentModel.findById(commentId);
        if (!comment || comment.postId.toString() !== postId || comment.isRemoved) {
            throw new common_1.BadRequestException();
        }
        const isAuthor = post.authorId.toString() === actor.userId;
        const isTeacherOrAdmin = this.isVerifiedTeacher(actor) || actor.role === user_role_enum_1.UserRole.ADMIN;
        if (!isAuthor && !isTeacherOrAdmin)
            throw new common_1.ForbiddenException();
        post.pinnedCommentId = comment._id;
        comment.isPinned = true;
        await post.save();
        await comment.save();
        return this.listComments(postId, actor.userId);
    }
    async unpinComment(actor, postId) {
        const post = await this.postModel.findById(postId);
        if (!post)
            throw new common_1.NotFoundException();
        const isAuthor = post.authorId.toString() === actor.userId;
        const isTeacherOrAdmin = this.isVerifiedTeacher(actor) || actor.role === user_role_enum_1.UserRole.ADMIN;
        if (!isAuthor && !isTeacherOrAdmin)
            throw new common_1.ForbiddenException();
        if (post.pinnedCommentId) {
            await this.commentModel.updateOne({ _id: post.pinnedCommentId }, { $set: { isPinned: false } });
            post.pinnedCommentId = null;
            await post.save();
        }
        return this.listComments(postId, actor.userId);
    }
    async createReport(actor, dto) {
        let postOid;
        if (dto.postId) {
            postOid = new mongoose_2.Types.ObjectId(dto.postId);
        }
        else if (dto.targetType === community_constants_1.CommunityReportTarget.COMMENT) {
            const c = await this.commentModel
                .findById(dto.targetId)
                .select('postId')
                .lean();
            if (c?.postId)
                postOid = c.postId;
        }
        await this.reportModel.create({
            reporterId: new mongoose_2.Types.ObjectId(actor.userId),
            targetType: dto.targetType,
            targetId: new mongoose_2.Types.ObjectId(dto.targetId),
            postId: postOid,
            reason: dto.reason.trim(),
            status: community_constants_1.CommunityReportStatus.PENDING,
        });
        return { success: true };
    }
    async follow(actor, targetType, targetId) {
        const fl = {
            followerId: new mongoose_2.Types.ObjectId(actor.userId),
            targetType,
            targetId: new mongoose_2.Types.ObjectId(targetId),
        };
        const existed = await this.followModel.findOne(fl);
        await this.followModel.updateOne(fl, { $setOnInsert: fl }, { upsert: true });
        if (!existed &&
            targetType === community_constants_1.CommunityFollowTarget.USER &&
            targetId !== actor.userId) {
            await this.notificationsService.createAndDispatch({
                receiverId: targetId,
                senderId: actor.userId,
                type: notification_event_constant_1.NotificationType.COMMUNITY,
                title: 'Cộng đồng',
                message: 'Có người bắt đầu theo dõi bạn.',
                payload: { url: `/community/profile/${actor.userId}` },
            });
        }
        return { following: true };
    }
    async unfollow(actor, targetType, targetId) {
        await this.followModel.deleteOne({
            followerId: new mongoose_2.Types.ObjectId(actor.userId),
            targetType,
            targetId: new mongoose_2.Types.ObjectId(targetId),
        });
        return { following: false };
    }
    async listFollowing(actor) {
        return this.followModel
            .find({ followerId: new mongoose_2.Types.ObjectId(actor.userId) })
            .sort({ createdAt: -1 })
            .lean();
    }
    async blockUser(actor, blockedUserId) {
        if (blockedUserId === actor.userId)
            throw new common_1.BadRequestException();
        await this.blockModel.updateOne({
            blockerId: new mongoose_2.Types.ObjectId(actor.userId),
            blockedUserId: new mongoose_2.Types.ObjectId(blockedUserId),
        }, {
            $setOnInsert: {
                blockerId: new mongoose_2.Types.ObjectId(actor.userId),
                blockedUserId: new mongoose_2.Types.ObjectId(blockedUserId),
            },
        }, { upsert: true });
        return { blocked: true };
    }
    async unblockUser(actor, blockedUserId) {
        await this.blockModel.deleteOne({
            blockerId: new mongoose_2.Types.ObjectId(actor.userId),
            blockedUserId: new mongoose_2.Types.ObjectId(blockedUserId),
        });
        return { blocked: false };
    }
    async getProfile(userId, viewerId) {
        const user = await this.usersRepository.findByIdSafe(userId, {
            projection: 'fullName avatar role bio teacherVerificationStatus status',
        });
        if (!user || user.status !== 'ACTIVE') {
            throw new common_1.NotFoundException();
        }
        const prof = await this.ensureProfile(userId);
        const posts = await this.postModel
            .find({ authorId: new mongoose_2.Types.ObjectId(userId), status: community_constants_1.CommunityPostStatus.ACTIVE })
            .sort({ createdAt: -1 })
            .limit(15)
            .lean();
        const hydrated = await this.hydratePosts(posts, viewerId || undefined);
        let following = false;
        if (viewerId && viewerId !== userId) {
            const f = await this.followModel.exists({
                followerId: new mongoose_2.Types.ObjectId(viewerId),
                targetType: community_constants_1.CommunityFollowTarget.USER,
                targetId: new mongoose_2.Types.ObjectId(userId),
            });
            following = !!f;
        }
        return {
            user: {
                id: userId,
                fullName: user.fullName,
                avatar: user.avatar,
                role: user.role,
                teacherVerificationStatus: user
                    .teacherVerificationStatus,
                bio: user.bio,
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
    async sidebar(viewerId) {
        const [featured, contributors, hotCourses, subjectActivity] = await Promise.all([
            this.postModel
                .find({ status: community_constants_1.CommunityPostStatus.ACTIVE, isFeatured: true })
                .sort({ createdAt: -1 })
                .limit(5)
                .lean(),
            this.profileModel.find({ reputation: { $gt: 0 } }).sort({ reputation: -1 }).limit(8).lean(),
            this.postModel.aggregate([
                { $match: { type: community_constants_1.CommunityPostType.COURSE_SHARE, status: community_constants_1.CommunityPostStatus.ACTIVE } },
                { $group: { _id: '$courseId', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 5 },
            ]),
            this.postModel.aggregate([
                {
                    $match: {
                        status: community_constants_1.CommunityPostStatus.ACTIVE,
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
        const umap = Object.fromEntries(users.map((u) => [String(u._id), u]));
        const contrib = contributors.map((c) => ({
            userId: c.userId.toString(),
            reputation: c.reputation,
            badges: c.badges,
            user: umap[c.userId.toString()] || null,
        }));
        const subjIds = subjectActivity.map((r) => r._id.toString());
        const subjRows = subjIds.length ? await this.subjectsService.findSubjectsByIds(subjIds) : [];
        const subjMap = Object.fromEntries(subjRows.map((s) => [
            String(s._id),
            s,
        ]));
        const subjectsDirectory = subjectActivity.map((r) => {
            const id = r._id.toString();
            const s = subjMap[id];
            return {
                subjectId: id,
                postCount: r.postCount,
                name: s?.name || 'Môn học',
                code: s?.code,
            };
        });
        return {
            featuredPosts: featHydrated,
            topContributors: contrib,
            hotCourseShareCounts: hotCourses,
            subjectsDirectory,
        };
    }
    async adminHidePost(actorId, postId) {
        await this.postModel.updateOne({ _id: new mongoose_2.Types.ObjectId(postId) }, { $set: { status: community_constants_1.CommunityPostStatus.HIDDEN } });
        await this.audit(actorId, 'POST_HIDDEN', { postId });
        return { ok: true };
    }
    async adminShowPost(actorId, postId) {
        await this.postModel.updateOne({ _id: new mongoose_2.Types.ObjectId(postId) }, { $set: { status: community_constants_1.CommunityPostStatus.ACTIVE } });
        await this.audit(actorId, 'POST_SHOWN', { postId });
        return { ok: true };
    }
    async adminFeaturePost(actorId, postId, featured) {
        await this.postModel.updateOne({ _id: new mongoose_2.Types.ObjectId(postId) }, { $set: { isFeatured: featured } });
        await this.audit(actorId, featured ? 'POST_FEATURED' : 'POST_UNFEATURED', { postId });
        return { ok: true };
    }
    async adminLockComments(actorId, postId, locked) {
        await this.postModel.updateOne({ _id: new mongoose_2.Types.ObjectId(postId) }, { $set: { commentsLocked: locked } });
        await this.audit(actorId, locked ? 'COMMENTS_LOCKED' : 'COMMENTS_UNLOCKED', { postId });
        return { ok: true };
    }
    async adminListReports(status, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const filter = {};
        if (status)
            filter.status = status;
        const [raw, total] = await Promise.all([
            this.reportModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            this.reportModel.countDocuments(filter),
        ]);
        const reporterIds = [...new Set(raw.map((r) => r.reporterId.toString()))];
        const reporters = await this.userModel
            .find({ _id: { $in: reporterIds.map((id) => new mongoose_2.Types.ObjectId(id)) } })
            .select('fullName email')
            .lean();
        const repMap = Object.fromEntries(reporters.map((u) => [
            String(u._id),
            { fullName: u.fullName, email: u.email },
        ]));
        const postTargets = raw
            .filter((r) => r.targetType === community_constants_1.CommunityReportTarget.POST)
            .map((r) => r.targetId.toString());
        const commentTargets = raw
            .filter((r) => r.targetType === community_constants_1.CommunityReportTarget.COMMENT)
            .map((r) => r.targetId.toString());
        const posts = postTargets.length
            ? await this.postModel
                .find({ _id: { $in: postTargets.map((id) => new mongoose_2.Types.ObjectId(id)) } })
                .select('bodyPlain authorId status')
                .lean()
            : [];
        const postMap = Object.fromEntries(posts.map((p) => [String(p._id), p]));
        const comments = commentTargets.length
            ? await this.commentModel
                .find({ _id: { $in: commentTargets.map((id) => new mongoose_2.Types.ObjectId(id)) } })
                .select('body postId isRemoved')
                .lean()
            : [];
        const comMap = Object.fromEntries(comments.map((c) => [String(c._id), c]));
        const items = raw.map((r) => {
            const id = String(r._id);
            const reporter = repMap[r.reporterId.toString()] || null;
            let targetPreview = null;
            if (r.targetType === community_constants_1.CommunityReportTarget.POST) {
                const p = postMap[r.targetId.toString()];
                targetPreview = p
                    ? {
                        kind: 'POST',
                        postId: r.targetId.toString(),
                        excerpt: (p.bodyPlain || '').slice(0, 200),
                        authorId: p.authorId?.toString(),
                        status: p.status,
                    }
                    : { kind: 'POST', postId: r.targetId.toString(), excerpt: '', missing: true };
            }
            else {
                const c = comMap[r.targetId.toString()];
                targetPreview = c
                    ? {
                        kind: 'COMMENT',
                        commentId: r.targetId.toString(),
                        postId: c.postId?.toString(),
                        excerpt: (c.body || '').slice(0, 200),
                        isRemoved: c.isRemoved,
                    }
                    : {
                        kind: 'COMMENT',
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
                postId: r.postId?.toString() || targetPreview?.postId,
                reason: r.reason,
                status: r.status,
                createdAt: r.createdAt,
                resolutionNote: r.resolutionNote,
                targetPreview,
            };
        });
        return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }
    async adminResolveReport(actorId, reportId, status, note) {
        await this.reportModel.updateOne({ _id: new mongoose_2.Types.ObjectId(reportId) }, {
            $set: {
                status,
                resolvedBy: new mongoose_2.Types.ObjectId(actorId),
                resolutionNote: note,
            },
        });
        await this.audit(actorId, 'REPORT_RESOLVED', { reportId, status });
        return { ok: true };
    }
    async adminSetUserCommunityStatus(actorId, userId, dto) {
        await this.profileModel.updateOne({ userId: new mongoose_2.Types.ObjectId(userId) }, {
            $set: {
                communityStatus: dto.communityStatus,
                mutedUntil: dto.mutedUntil ? new Date(dto.mutedUntil) : null,
                moderationNote: dto.moderationNote,
            },
            $setOnInsert: { userId: new mongoose_2.Types.ObjectId(userId) },
        }, { upsert: true });
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
                .find({ status: community_constants_1.CommunityPostStatus.ACTIVE, createdAt: { $gte: weekAgo } })
                .sort({ hotScore: -1 })
                .limit(3)
                .select('bodyPlain')
                .lean();
            const summary = hot.map((h) => h.bodyPlain?.slice(0, 80)).join(' · ');
            await this.notificationsService.createAndDispatch({
                receiverId: p.userId.toString(),
                senderId: null,
                type: notification_event_constant_1.NotificationType.COMMUNITY,
                title: 'Tóm tắt tuần — Cộng đồng',
                message: summary || 'Khám phá các thảo luận mới trên EArena Community.',
                payload: { url: '/community' },
            });
            await this.profileModel.updateOne({ _id: p._id }, { $set: { lastDigestNotifiedAt: new Date() } });
        }
        return { processed: users.length };
    }
};
exports.CommunityService = CommunityService;
exports.CommunityService = CommunityService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(community_post_schema_1.CommunityPost.name)),
    __param(2, (0, mongoose_1.InjectModel)(community_comment_schema_1.CommunityComment.name)),
    __param(3, (0, mongoose_1.InjectModel)(community_reaction_schema_1.CommunityReaction.name)),
    __param(4, (0, mongoose_1.InjectModel)(community_saved_post_schema_1.CommunitySavedPost.name)),
    __param(5, (0, mongoose_1.InjectModel)(community_report_schema_1.CommunityReport.name)),
    __param(6, (0, mongoose_1.InjectModel)(community_follow_schema_1.CommunityFollow.name)),
    __param(7, (0, mongoose_1.InjectModel)(community_block_schema_1.CommunityBlock.name)),
    __param(8, (0, mongoose_1.InjectModel)(community_user_profile_schema_1.CommunityUserProfile.name)),
    __param(9, (0, mongoose_1.InjectModel)(community_moderation_audit_schema_1.CommunityModerationAudit.name)),
    __param(16, (0, common_1.Inject)(storage_provider_interface_1.CLOUDINARY_PROVIDER)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        config_1.ConfigService,
        courses_repository_1.CoursesRepository,
        exams_repository_1.ExamsRepository,
        notifications_service_1.NotificationsService,
        users_repository_1.UsersRepository,
        subjects_service_1.SubjectsService, Object])
], CommunityService);
//# sourceMappingURL=community.service.js.map