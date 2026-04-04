import { axiosClient } from '@/shared/lib/axios-client';
import type { ApiError } from '@/shared/lib/error-parser';
import { API_ENDPOINTS } from '@/config/api-endpoints';

export type CommunityPostType =
  | 'HOMEWORK_QUESTION'
  | 'RESOURCE_SHARE'
  | 'EXPERIENCE_SHARE'
  | 'COURSE_REVIEW'
  | 'EXAM_DISCUSSION'
  | 'COURSE_SHARE';

export type CommunityFeedSort = 'NEW' | 'HOT' | 'FOLLOWING' | 'FOR_YOU';

export type CommunityReactionKind =
  | 'HELPFUL'
  | 'LOVE'
  | 'QUALITY'
  | 'SPOT_ON'
  | 'THANKS';


function unwrapData<T>(payload: T | { data?: T } | undefined | null): T | undefined {
  if (payload && typeof payload === 'object' && 'data' in (payload as Record<string, unknown>)) {
    return (payload as { data?: T }).data;
  }
  return payload as T | undefined;
}

export async function getCommunityFeed(params: {
  sort?: CommunityFeedSort;
  type?: CommunityPostType;
  subjectId?: string;
  courseId?: string;
  examId?: string;
  q?: string;
  cursor?: string;
  limit?: number;
}) {
  const res = await axiosClient.get(API_ENDPOINTS.COMMUNITY.FEED, { params });
  return unwrapData(res) ?? { items: [], nextCursor: null };
}

export async function getCommunitySidebar() {
  const res = await axiosClient.get(API_ENDPOINTS.COMMUNITY.SIDEBAR);
  return unwrapData(res) ?? {};
}

export async function getCommunityPost(postId: string) {
  const res = await axiosClient.get(API_ENDPOINTS.COMMUNITY.POST(postId));
  return unwrapData(res);
}

export async function getCommunityPostComments(postId: string) {
  const res = await axiosClient.get(API_ENDPOINTS.COMMUNITY.POST_COMMENTS(postId));
  return unwrapData(res) ?? { comments: [] };
}

export async function getCommunityPostsByCourse(
  courseId: string,
  params?: { cursor?: string; limit?: number },
) {
  return axiosClient.get(API_ENDPOINTS.COMMUNITY.POSTS_BY_COURSE(courseId), {
    params,
  });
}

/**
 * Upload ảnh đính kèm community qua BE (multipart + cookie), giống tinh thần luồng đăng ký GV.
 * Tránh phụ thuộc GET /media/signature + POST trực tiếp Cloudinary từ trình duyệt.
 */
export async function uploadCommunityImage(file: File): Promise<{ url: string; name?: string }> {
  const fd = new FormData();
  fd.append('file', file, file.name || 'community-image');

  /**
   * Dùng axiosClient để đi qua interceptor refresh token, nhưng override header JSON mặc định
   * bằng multipart/form-data cho request này. Axios sẽ tự gắn boundary phù hợp trong browser.
   */
  const payload = (await axiosClient.request({
    method: 'post',
    url: API_ENDPOINTS.COMMUNITY.UPLOAD_IMAGE,
    data: fd,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    transformRequest: [(data) => data],
  })) as
    | {
        url?: string;
        name?: string;
      }
    | {
        data?: {
          url?: string;
          name?: string;
        };
      };

  const normalized = 'url' in (payload || {}) ? payload : payload?.data;

  if (!normalized?.url) {
    throw new Error('Phản hồi máy chủ không hợp lệ khi tải ảnh cộng đồng.');
  }

  return { url: normalized.url, name: normalized.name };
}

export async function createCommunityPost(body: {
  type: CommunityPostType;
  bodyJson: string;
  attachments?: { url: string; kind: 'IMAGE' | 'FILE'; name?: string; mime?: string }[];
  tags?: string[];
  subjectId?: string;
  courseId?: string;
  examId?: string;
}) {
  const res = await axiosClient.post(API_ENDPOINTS.COMMUNITY.POSTS, body);
  return unwrapData(res);
}

export async function updateCommunityPost(
  postId: string,
  body: {
    type?: CommunityPostType;
    bodyJson?: string;
    attachments?: { url: string; kind: 'IMAGE' | 'FILE'; name?: string; mime?: string }[];
    tags?: string[];
    subjectId?: string;
    courseId?: string;
    examId?: string;
  },
) {
  const res = await axiosClient.patch(API_ENDPOINTS.COMMUNITY.POST(postId), body);
  return unwrapData(res);
}

export async function deleteCommunityPost(postId: string) {
  return axiosClient.delete(API_ENDPOINTS.COMMUNITY.POST(postId));
}

export async function saveCommunityPost(postId: string) {
  return axiosClient.post(API_ENDPOINTS.COMMUNITY.POST_SAVE(postId));
}

export async function unsaveCommunityPost(postId: string) {
  return axiosClient.delete(API_ENDPOINTS.COMMUNITY.POST_SAVE(postId));
}

export async function reactCommunityPost(postId: string, kind: CommunityReactionKind) {
  return axiosClient.post(API_ENDPOINTS.COMMUNITY.POST_REACT(postId), { kind });
}

export async function unreactCommunityPost(postId: string) {
  return axiosClient.delete(API_ENDPOINTS.COMMUNITY.POST_REACT(postId));
}

export async function createCommunityComment(
  postId: string,
  body: {
    body?: string;
    parentCommentId?: string;
    mentionedUserIds?: string[];
    attachments?: { url: string; kind: 'IMAGE' | 'FILE'; name?: string; mime?: string }[];
  },
) {
  return axiosClient.post(API_ENDPOINTS.COMMUNITY.POST_COMMENTS(postId), body);
}

export async function reactCommunityComment(
  commentId: string,
  kind: CommunityReactionKind,
) {
  return axiosClient.post(API_ENDPOINTS.COMMUNITY.COMMENT_REACT(commentId), {
    kind,
  });
}

export async function setBestAnswer(postId: string, commentId: string) {
  return axiosClient.post(API_ENDPOINTS.COMMUNITY.POST_BEST_ANSWER(postId), {
    commentId,
  });
}

export async function reportCommunity(payload: {
  targetType: 'POST' | 'COMMENT';
  targetId: string;
  postId?: string;
  reason: string;
}) {
  return axiosClient.post(API_ENDPOINTS.COMMUNITY.REPORTS, payload);
}

export async function followCommunity(
  targetType: 'USER' | 'SUBJECT',
  targetId: string,
) {
  return axiosClient.post(API_ENDPOINTS.COMMUNITY.FOLLOWS, {
    targetType,
    targetId,
  });
}

export async function unfollowCommunity(
  targetType: 'USER' | 'SUBJECT',
  targetId: string,
) {
  return axiosClient.delete(
    API_ENDPOINTS.COMMUNITY.FOLLOW(targetType, targetId),
  );
}

export async function getCommunityProfile(userId: string) {
  const res = await axiosClient.get(API_ENDPOINTS.COMMUNITY.PROFILE(userId));
  return unwrapData(res);
}

export async function getAdminCommunityReports(params?: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  return axiosClient.get(API_ENDPOINTS.COMMUNITY_ADMIN.REPORTS, { params });
}

export async function resolveAdminCommunityReport(
  reportId: string,
  body: { status: string; resolutionNote?: string },
) {
  return axiosClient.patch(
    API_ENDPOINTS.COMMUNITY_ADMIN.REPORT_RESOLVE(reportId),
    body,
  );
}

export type TaxonomySubjectRow = { _id: string; name: string; code?: string };

export async function getTaxonomySubjects(): Promise<TaxonomySubjectRow[]> {
  const res = await axiosClient.get(API_ENDPOINTS.TAXONOMY.SUBJECTS);
  return res as unknown as TaxonomySubjectRow[];
}

export type CommunityFollowRow = { targetType: string; targetId: string };

export async function getCommunityFollowing(): Promise<CommunityFollowRow[]> {
  const res = await axiosClient.get(API_ENDPOINTS.COMMUNITY.ME_FOLLOWING);
  return res as unknown as CommunityFollowRow[];
}

export async function adminHideCommunityPost(postId: string) {
  return axiosClient.patch(API_ENDPOINTS.COMMUNITY_ADMIN.POST_HIDE(postId));
}

export async function adminShowCommunityPost(postId: string) {
  return axiosClient.patch(API_ENDPOINTS.COMMUNITY_ADMIN.POST_SHOW(postId));
}

export async function adminFeatureCommunityPost(postId: string, featured: boolean) {
  return axiosClient.post(API_ENDPOINTS.COMMUNITY_ADMIN.POST_FEATURE(postId), {
    featured,
  });
}

export async function adminLockCommunityPostComments(postId: string, locked: boolean) {
  return axiosClient.post(API_ENDPOINTS.COMMUNITY_ADMIN.POST_LOCK_COMMENTS(postId), {
    locked,
  });
}

export async function adminSetUserCommunityStatus(
  userId: string,
  body: {
    communityStatus: 'ACTIVE' | 'MUTED' | 'BANNED';
    mutedUntil?: string;
    moderationNote?: string;
  },
) {
  return axiosClient.patch(API_ENDPOINTS.COMMUNITY_ADMIN.USER_STATUS(userId), body);
}

export async function getAdminCommunityAudit(params?: { page?: number; limit?: number }) {
  return axiosClient.get(API_ENDPOINTS.COMMUNITY_ADMIN.AUDIT, { params });
}
