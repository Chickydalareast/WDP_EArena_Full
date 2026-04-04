"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediaTicketService = void 0;
const axios_1 = __importDefault(require("axios"));
const axios_client_1 = require("@/shared/lib/axios-client");
const api_endpoints_1 = require("@/config/api-endpoints");
exports.mediaTicketService = {
    requestVideoTicket: async (payload) => {
        return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.MEDIA.VIDEO_TICKET, payload);
    },
    uploadDirectToDrive: async (uploadUrl, file, onProgress, cancelSignal) => {
        await axios_1.default.put(uploadUrl, file, {
            headers: { 'Content-Type': file.type },
            signal: cancelSignal,
            onUploadProgress: (progressEvent) => {
                if (progressEvent.total && onProgress) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percentCompleted);
                }
            },
        });
    },
    confirmUpload: async (payload) => {
        return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.MEDIA.CONFIRM_UPLOAD, payload);
    },
    getCloudinarySignature: async (context) => {
        return axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.MEDIA.SIGNATURE, {
            params: { context },
        });
    },
    uploadDirectToCloudinary: async (file, signatureData, onProgress) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', signatureData.apiKey);
        formData.append('timestamp', signatureData.timestamp.toString());
        formData.append('signature', signatureData.signature);
        formData.append('folder', signatureData.folder);
        const cloudRes = await axios_1.default.post(`https://api.cloudinary.com/v1_1/${signatureData.cloudName}/auto/upload`, formData, {
            onUploadProgress: (progressEvent) => {
                if (progressEvent.total && onProgress) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percentCompleted);
                }
            },
        });
        return cloudRes.data;
    },
    syncCloudinary: async (payload) => {
        return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.MEDIA.SYNC_CLOUDINARY, payload);
    }
};
//# sourceMappingURL=media-ticket.service.js.map