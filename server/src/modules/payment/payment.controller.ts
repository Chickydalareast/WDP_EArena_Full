import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CreatePaymentLinkDto } from './dto/create-payment-link.dto';
import { ConfirmPayOsReturnDto } from './dto/confirm-payos-return.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-embedded-link')
  @UseGuards(JwtAuthGuard)
  async createPaymentLink(
    @Body() dto: CreatePaymentLinkDto,
    @CurrentUser('userId') userId: string,
  ) {
    const result = await this.paymentService.createPaymentLink(
      userId,
      dto.amount,
      dto.returnPath,
    );
    return {
      message: 'Tạo liên kết thanh toán thành công',
      ...result,
    };
  }

  @Get('status/:orderCode')
  @UseGuards(JwtAuthGuard)
  async getPaymentStatus(@Param('orderCode') orderCode: string) {
    const status = await this.paymentService.getPaymentStatus(orderCode);
    return { status };
  }

  @Post('confirm-return')
  @UseGuards(JwtAuthGuard)
  async confirmPayOsReturn(
    @Body() dto: ConfirmPayOsReturnDto,
    @CurrentUser('userId') userId: string,
  ) {
    const data = await this.paymentService.confirmReturnFromPayOs(
      userId,
      dto.orderCode,
    );
    return {
      message: data.message,
      data: { balance: data.balance },
    };
  }

  @Public()
  @Post('webhook')
  async handleWebhook(@Body() payload: Record<string, unknown>) {
    return this.paymentService.handleWebhook(payload);
  }
}
