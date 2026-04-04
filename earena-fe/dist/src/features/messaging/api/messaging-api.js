"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listThreads = listThreads;
exports.getUnreadCount = getUnreadCount;
exports.listShareableCourses = listShareableCourses;
exports.openThread = openThread;
exports.listMessages = listMessages;
exports.sendMessage = sendMessage;
const axios_client_1 = require("@/shared/lib/axios-client");
const api_endpoints_1 = require("@/config/api-endpoints");
async function listThreads() {
    return axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.MESSAGING.THREADS);
}
async function getUnreadCount() {
    return axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.MESSAGING.UNREAD_COUNT);
}
async function listShareableCourses() {
    return axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.MESSAGING.SHAREABLE_COURSES);
}
async function openThread(peerUserId) {
    return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.MESSAGING.OPEN_THREAD, { peerUserId });
}
async function listMessages(threadId, page = 1) {
    return axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.MESSAGING.MESSAGES(threadId), {
        params: { page, limit: 50 },
    });
}
async function sendMessage(threadId, body) {
    return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.MESSAGING.SEND(threadId), body);
}
//# sourceMappingURL=messaging-api.js.map