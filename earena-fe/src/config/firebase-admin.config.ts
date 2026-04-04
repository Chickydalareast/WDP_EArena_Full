import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';
import { Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';

dotenv.config();

const logger = new Logger('FirebaseAdminConfig');

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

let firebaseBucket: import('@google-cloud/storage').Bucket;

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

  firebaseBucket = admin.storage().bucket();
  logger.log(` [Firebase Storage] Đã kết nối thành công tới Bucket: [${storageBucket}]`);

} catch (error: any) {
  logger.error(` [Firebase Admin] Lỗi khởi tạo: ${error.message}`);
}

export { firebaseBucket, admin };