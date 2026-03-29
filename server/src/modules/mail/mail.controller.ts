import { Controller, Post, Body } from '@nestjs/common';
import { MailService } from './mail.service';
import { Public } from '../../common/decorators/public.decorator'; // Giả sử bạn đã có decorator này để bypass Auth

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Public() // Mở công khai để test cho nhanh, không cần login
  @Post('test')
  async testMail(@Body() body: { email: string }) {
    const email = body.email || 'email_cua_ban@gmail.com'; // Default nếu không gửi body
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Sinh số ngẫu nhiên
    
    // Gọi hàm gửi mail (Non-blocking)
    const result = await this.mailService.sendUserOtp(email, 'Test User', otp);
    
    return {
      success: result,
      message: 'Job sent to Redis Queue',
      debug: { email, otp }
    };
  }
}