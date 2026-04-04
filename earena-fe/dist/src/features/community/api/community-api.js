"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommunityFeed = getCommunityFeed;
exports.getCommunitySidebar = getCommunitySidebar;
exports.getCommunityPost = getCommunityPost;
exports.getCommunityPostComments = getCommunityPostComments;
exports.getCommunityPostsByCourse = getCommunityPostsByCourse;
exports.uploadCommunityImage = uploadCommunityImage;
exports.createCommunityPost = createCommunityPost;
exports.saveCommunityPost = saveCommunityPost;
exports.unsaveCommunityPost = unsaveCommunityPost;
exports.reactCommunityPost = reactCommunityPost;
exports.unreactCommunityPost = unreactCommunityPost;
exports.createCommunityComment = createCommunityComment;
exports.reactCommunityComment = reactCommunityComment;
exports.setBestAnswer = setBestAnswer;
exports.reportCommunity = reportCommunity;
exports.followCommunity = followCommunity;
exports.unfollowCommunity = unfollowCommunity;
exports.getCommunityProfile = getCommunityProfile;
exports.getAdminCommunityReports = getAdminCommunityReports;
exports.resolveAdminCommunityReport = resolveAdminCommunityReport;
exports.getTaxonomySubjects = getTaxonomySubjects;
exports.getCommunityFollowing = getCommunityFollowing;
exports.adminHideCommunityPost = adminHideCommunityPost;
exports.adminShowCommunityPost = adminShowCommunityPost;
exports.adminFeatureCommunityPost = adminFeatureCommunityPost;
exports.adminLockCommunityPostComments = adminLockCommunityPostComments;
exports.adminSetUserCommunityStatus = adminSetUserCommunityStatus;
exports.getAdminCommunityAudit = getAdminCommunityAudit;
const axios_client_1 = require("@/shared/lib/axios-client");
const api_endpoints_1 = require("@/config/api-endpoints");
const env_1 = require("@/config/env");
async function getCommunityFeed(params) {
    return axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.COMMUNITY.FEED, { params });
}
async function getCommunitySidebar() {
    return axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.COMMUNITY.SIDEBAR);
}
async function getCommunityPost(postId) {
    return axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.COMMUNITY.POST(postId));
}
async function getCommunityPostComments(postId) {
    return axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.COMMUNITY.POST_COMMENTS(postId));
}
async function getCommunityPostsByCourse(courseId, params) {
    return axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.COMMUNITY.POSTS_BY_COURSE(courseId), {
        params,
    });
}
function parseUploadJsonPayload(raw) {
    if (!raw || typeof raw !== 'object')
        return null;
    const o = raw;
    const inner = o.data;
    if (inner && typeof inner === 'object' && inner !== null) {
        const d = inner;
        if (typeof d.url === 'string') {
            return { url: d.url, name: typeof d.name === 'string' ? d.name : undefined };
        }
    }
    if (typeof o.url === 'string') {
        return { url: o.url, name: typeof o.name === 'string' ? o.name : undefined };
    }
    return null;
}
async function uploadCommunityImage(file) {
    const base = env_1.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
    const path = api_endpoints_1.API_ENDPOINTS.COMMUNITY.UPLOAD_IMAGE;
    const postOnce = (fd, signal) => fetch(`${base}${path}`, {
        method: 'POST',
        body: fd,
        credentials: 'include',
        cache: 'no-store',
        headers: { Accept: 'application/json' },
        signal,
    });
    const runWithTimeout = async (fn) => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 120_000);
        try {
            return await fn(controller.signal);
        }
        finally {
            clearTimeout(id);
        }
    };
    let res = await runWithTimeout(async (signal) => {
        const fd = new FormData();
        fd.append('file', file);
        return postOnce(fd, signal);
    });
    if (res.status === 401) {
        await fetch(`${base}${api_endpoints_1.API_ENDPOINTS.AUTH.REFRESH}`, {
            method: 'POST',
            credentials: 'include',
            headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
            body: '{}',
        });
        res = await runWithTimeout(async (signal) => {
            const fd = new FormData();
            fd.append('file', file);
            return postOnce(fd, signal);
        });
    }
    let raw;
    try {
        raw = await res.json();
    }
    catch {
        raw = null;
    }
    if (!res.ok) {
        const msg = raw?.message;
        const text = typeof msg === 'string'
            ? msg
            : Array.isArray(msg)
                ? msg.join(', ')
                : `Upload thất bại (${res.status})`;
        throw new Error(text);
    }
    const payload = parseUploadJsonPayload(raw);
    if (!payload) {
        throw new Error('Phản hồi máy chủ không hợp lệ.');
    }
    return payload;
}
async function createCommunityPost(body) {
    return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.COMMUNITY.POSTS, body);
}
async function saveCommunityPost(postId) {
    return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.COMMUNITY.POST_SAVE(postId));
}
async function unsaveCommunityPost(postId) {
    return axios_client_1.axiosClient.delete(api_endpoints_1.API_ENDPOINTS.COMMUNITY.POST_SAVE(postId));
}
async function reactCommunityPost(postId, kind) {
    return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.COMMUNITY.POST_REACT(postId), { kind });
}
async function unreactCommunityPost(postId) {
    return axios_client_1.axiosClient.delete(api_endpoints_1.API_ENDPOINTS.COMMUNITY.POST_REACT(postId));
}
async function createCommunityComment(postId, body) {
    return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.COMMUNITY.POST_COMMENTS(postId), body);
}
async function reactCommunityComment(commentId, kind) {
    return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.COMMUNITY.COMMENT_REACT(commentId), {
        kind,
    });
}
async function setBestAnswer(postId, commentId) {
    return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.COMMUNITY.POST_BEST_ANSWER(postId), {
        commentId,
    });
}
async function reportCommunity(payload) {
    return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.COMMUNITY.REPORTS, payload);
}
async function followCommunity(targetType, targetId) {
    return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.COMMUNITY.FOLLOWS, {
        targetType,
        targetId,
    });
}
async function unfollowCommunity(targetType, targetId) {
    return axios_client_1.axiosClient.delete(api_endpoints_1.API_ENDPOINTS.COMMUNITY.FOLLOW(targetType, targetId));
}
async function getCommunityProfile(userId) {
    return axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.COMMUNITY.PROFILE(userId));
}
async function getAdminCommunityReports(params) {
    return axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.COMMUNITY_ADMIN.REPORTS, { params });
}
async function resolveAdminCommunityReport(reportId, body) {
    return axios_client_1.axiosClient.patch(api_endpoints_1.API_ENDPOINTS.COMMUNITY_ADMIN.REPORT_RESOLVE(reportId), body);
}
async function getTaxonomySubjects() {
    const res = await axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.TAXONOMY.SUBJECTS);
    return res;
}
async function getCommunityFollowing() {
    const res = await axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.COMMUNITY.ME_FOLLOWING);
    return res;
}
async function adminHideCommunityPost(postId) {
    return axios_client_1.axiosClient.patch(api_endpoints_1.API_ENDPOINTS.COMMUNITY_ADMIN.POST_HIDE(postId));
}
async function adminShowCommunityPost(postId) {
    return axios_client_1.axiosClient.patch(api_endpoints_1.API_ENDPOINTS.COMMUNITY_ADMIN.POST_SHOW(postId));
}
async function adminFeatureCommunityPost(postId, featured) {
    return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.COMMUNITY_ADMIN.POST_FEATURE(postId), {
        featured,
    });
}
async function adminLockCommunityPostComments(postId, locked) {
    return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.COMMUNITY_ADMIN.POST_LOCK_COMMENTS(postId), {
        locked,
    });
}
async function adminSetUserCommunityStatus(userId, body) {
    return axios_client_1.axiosClient.patch(api_endpoints_1.API_ENDPOINTS.COMMUNITY_ADMIN.USER_STATUS(userId), body);
}
async function getAdminCommunityAudit(params) {
    return axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.COMMUNITY_ADMIN.AUDIT, { params });
}
//# sourceMappingURL=community-api.js.map