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
exports.admin = exports.firebaseBucket = void 0;
const admin = __importStar(require("firebase-admin"));
exports.admin = admin;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const common_1 = require("@nestjs/common");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const logger = new common_1.Logger('FirebaseAdminConfig');
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;
let firebaseBucket;
try {
    if (!serviceAccountPath || !storageBucket) {
        throw new Error('Thiếu biến môi trường FIREBASE_SERVICE_ACCOUNT_PATH hoặc FIREBASE_STORAGE_BUCKET');
    }
    const resolvedPath = path.resolve(process.cwd(), serviceAccountPath);
    if (!fs.existsSync(resolvedPath)) {
        throw new Error(`Không tìm thấy file Private Key tại đường dẫn: ${resolvedPath}`);
    }
    if (!admin.apps.length) {
        const serviceAccount = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            storageBucket: storageBucket,
        });
        logger.log(' [Firebase Admin] Đã khởi tạo SDK thành công.');
    }
    exports.firebaseBucket = firebaseBucket = admin.storage().bucket();
    logger.log(` [Firebase Storage] Đã kết nối thành công tới Bucket: [${storageBucket}]`);
}
catch (error) {
    logger.error(` [Firebase Admin] Lỗi khởi tạo: ${error.message}`);
}
//# sourceMappingURL=firebase-admin.config.js.map