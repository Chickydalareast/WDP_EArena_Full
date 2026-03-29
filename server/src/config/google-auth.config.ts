import { google } from 'googleapis';
import { Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';

dotenv.config();

const logger = new Logger('GoogleAuthConfig');

const clientId = process.env.PROVIDER_GOOGLE_CLIENT_ID;
const clientSecret = process.env.PROVIDER_GOOGLE_CLIENT_SECRET;
const refreshToken = process.env.PROVIDER_GOOGLE_REFRESH_TOKEN;

const oauth2Client = new google.auth.OAuth2(
  clientId,
  clientSecret
);

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
} else {
  logger.error(' [Google Auth] Thiếu biến môi trường! Vui lòng kiểm tra lại file .env');
}

export { oauth2Client };