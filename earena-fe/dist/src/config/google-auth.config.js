"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.oauth2Client = void 0;
const googleapis_1 = require("googleapis");
const common_1 = require("@nestjs/common");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const logger = new common_1.Logger('GoogleAuthConfig');
const clientId = process.env.PROVIDER_GOOGLE_CLIENT_ID;
const clientSecret = process.env.PROVIDER_GOOGLE_CLIENT_SECRET;
const refreshToken = process.env.PROVIDER_GOOGLE_REFRESH_TOKEN;
const oauth2Client = new googleapis_1.google.auth.OAuth2(clientId, clientSecret);
exports.oauth2Client = oauth2Client;
if (clientId && clientSecret && refreshToken) {
    oauth2Client.setCredentials({
        refresh_token: refreshToken,
    });
    logger.log(' [Google Auth] Khởi tạo OAuth2 Client thành công với Refresh Token.');
    oauth2Client.on('tokens', (tokens) => {
        if (tokens.refresh_token) {
            logger.debug('🔄 [Google Auth] Đã nhận được Refresh Token mới (Lưu vào DB nếu cần).');
        }
        logger.debug('🔄 [Google Auth] Access Token vừa được tự động làm mới.');
    });
}
else {
    logger.error(' [Google Auth] Thiếu biến môi trường! Vui lòng kiểm tra lại file .env');
}
//# sourceMappingURL=google-auth.config.js.map