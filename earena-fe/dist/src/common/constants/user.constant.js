"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDefaultAvatar = exports.AVATAR_PROVIDER_URL = void 0;
exports.AVATAR_PROVIDER_URL = 'https://ui-avatars.com/api/';
const generateDefaultAvatar = (name) => {
    return `${exports.AVATAR_PROVIDER_URL}?name=${encodeURIComponent(name)}&background=random`;
};
exports.generateDefaultAvatar = generateDefaultAvatar;
//# sourceMappingURL=user.constant.js.map