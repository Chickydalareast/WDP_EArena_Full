"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileService = void 0;
const axios_client_1 = require("@/shared/lib/axios-client");
const cloudinary_direct_image_upload_1 = require("@/shared/lib/cloudinary-direct-image-upload");
exports.profileService = {
    uploadAvatar: async (file) => {
        const { url } = await (0, cloudinary_direct_image_upload_1.uploadImageDirectToCloudinary)(file, 'avatar');
        return url;
    },
    updateProfile: async (payload) => {
        return axios_client_1.axiosClient.patch('/users/me/profile', payload);
    },
};
//# sourceMappingURL=profile.service.js.map