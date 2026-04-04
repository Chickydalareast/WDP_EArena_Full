import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Types } from 'mongoose';
import { PayOS } from '@payos/node';
import { PaymentTransactionsRepository } from './payment-transactions.repository';
import { PaymentStatus } from './schemas/payment-transaction.schema';
import { WalletsService } from '../wallets/wallets.service';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private payosClient: PayOS | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly paymentTransactionsRepo: PaymentTransactionsRepository,
    private readonly walletsService: WalletsService,
  ) {
    this.initializePayOS();
  }

  private initializePayOS() {
    try {
      const clientId = this.configService.get<string>('PAYOS_CLIENT_ID');
      const apiKey = this.configService.get<string>('PAYOS_API_KEY');
      const checksumKey =
        this.configService.get<string>('PAYOS_CHECKSUM_KEY') ||
        this.configService.get<string>('PAYOS_CLIENT_SECRET');

      if (clientId && apiKey && checksumKey) {
        this.payosClient = new PayOS({
          clientId,
          apiKey,
          checksumKey,
        });
        this.logger.log('PayOS client initialized successfully');
      } else {
        this.logger.warn(
          'PayOS credentials not configured. Payment will use mock mode.',
        );
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `Failed to initialize PayOS: ${msg}. Running in mock mode.`,
      );
      this.payosClient = null;
    }
  }

  /** Mã đơn duy nhất cho PayOS (số nguyên). */
  private generateOrderCode(): number {
    const ts = Date.now();
    const rnd = Math.floor(Math.random() * 100_000);
    return ts * 1000 + rnd;
  }

  async createPaymentLink(
    userId: string,
    amount: number,
    returnPath?: string,
  ): Promise<{ checkoutUrl: string; orderCode: string }> {
    if (amount < 1000) {
      throw new BadRequestException('Số tiền nạp tối thiểu là 1,000 VND');
    }

    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
    const walletPath = returnPath ?? '/student/wallet';
    const base = frontendUrl.replace(/\/$/, '');
    const returnUrl = `${base}${walletPath}`;
    const cancelUrl = returnUrl;
    const orderCode = this.generateOrderCode();

    if (!this.payosClient) {
      this.logger.warn('PayOS not configured, returning mock response');
      return {
        checkoutUrl: `${base}${walletPath}?mockPayment=true&amount=${amount}&orderCode=${orderCode}`,
        orderCode: String(orderCode),
      };
    }

    try {
      const paymentLink = await this.payosClient.paymentRequests.create({
        orderCode,
        amount,
        description: `Nap EArena #${String(orderCode).slice(-5)}`,
        returnUrl,
        cancelUrl,
      });

      await this.paymentTransactionsRepo.create({
        orderCode,
        userId: new Types.ObjectId(userId),
        amount,
        status: PaymentStatus.PENDING,
        checkoutUrl: paymentLink.checkoutUrl,
        payosOrderId: paymentLink.paymentLinkId,
      });

      this.logger.log(
        `Created payment link for order ${orderCode}: ${paymentLink.checkoutUrl}`,
      );

      return {
        checkoutUrl: paymentLink.checkoutUrl,
        orderCode: String(orderCode),
      };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to create PayOS payment link: ${msg}`);
      throw new BadRequestException(
        'Không thể tạo liên kết thanh toán. Vui lòng thử lại.',
      );
    }
  }

  async handleWebhook(
    payload: Record<string, unknown>,
  ): Promise<{ success: boolean; message: string }> {
    if (!this.payosClient) {
      this.logger.warn('PayOS not configured, webhook ignored');
      return { success: false, message: 'PayOS not configured' };
    }

    let data: Awaited<ReturnType<PayOS['webhooks']['verify']>>;
    try {
      data = await this.payosClient.webhooks.verify(
        payload as Parameters<PayOS['webhooks']['verify']>[0],
      );
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Webhook verify failed: ${msg}`);
      return { success: false, message: 'Invalid webhook' };
    }

    const orderCodeNum =
      typeof data.orderCode === 'number'
        ? data.orderCode
        : parseInt(String(data.orderCode), 10);

    if (Number.isNaN(orderCodeNum)) {
      return { success: false, message: 'Invalid orderCode' };
    }

    this.logger.log(`Webhook verified for order ${orderCodeNum}`);

    const payment =
      await this.paymentTransactionsRepo.findByOrderCode(orderCodeNum);

    if (!payment) {
      this.logger.warn(`Payment not found for order code: ${orderCodeNum}`);
      return { success: false, message: 'Payment not found' };
    }

    if (data.amount !== payment.amount) {
      this.logger.error(
        `Amount mismatch for order ${orderCodeNum}: webhook=${data.amount} db=${payment.amount}`,
      );
      return { success: false, message: 'Amount mismatch' };
    }

    if (data.code !== '00') {
      this.logger.log(
        `Order ${orderCodeNum} webhook code=${data.code}, not crediting wallet`,
      );
      return { success: true, message: 'Webhook received (non-success code)' };
    }

    if (payment.status === PaymentStatus.SUCCESS) {
      return { success: true, message: 'Payment already processed' };
    }

    await this.walletsService.processDeposit({
      userId: payment.userId.toString(),
      amount: payment.amount,
      referenceId: payment._id.toString(),
      description: `Nạp tiền qua PayOS - Mã GD: ${orderCodeNum}`,
    });

    await this.paymentTransactionsRepo.updateStatus(
      orderCodeNum,
      PaymentStatus.SUCCESS,
      {
        payosTransactionId: data.reference ?? data.paymentLinkId,
      },
    );

    this.logger.log(`Credited wallet for PayOS order ${orderCodeNum}`);
    return { success: true, message: 'Payment processed successfully' };
  }

  /**
   * Sau khi người dùng quay lại từ PayOS (returnUrl), gọi API PayOS để xác nhận PAID rồi cộng ví.
   * Dùng khi webhook không tới được server (localhost / firewall).
   */
  async confirmReturnFromPayOs(
    userId: string,
    orderCode: number,
  ): Promise<{ message: string; balance: number }> {
    const payment =
      await this.paymentTransactionsRepo.findByOrderCode(orderCode);

    if (!payment || payment.userId.toString() !== userId) {
      throw new NotFoundException('Không tìm thấy giao dịch thanh toán.');
    }

    if (payment.status === PaymentStatus.SUCCESS) {
      const w = await this.walletsService.getMyWallet(userId);
      return {
        message: 'Giao dịch đã được ghi nhận trước đó',
        balance: w.balance,
      };
    }

    if (!this.payosClient) {
      throw new BadRequestException('PayOS chưa được cấu hình.');
    }

    const link = await this.payosClient.paymentRequests.get(orderCode);

    if (link.status !== 'PAID') {
      throw new BadRequestException(
        `Thanh toán chưa hoàn tất (trạng thái: ${link.status}).`,
      );
    }

    if (link.amount !== payment.amount) {
      throw new BadRequestException('Số tiền không khớp với đơn hàng.');
    }

    const deposit = await this.walletsService.processDeposit({
      userId: payment.userId.toString(),
      amount: payment.amount,
      referenceId: payment._id.toString(),
      description: `Nạp tiền qua PayOS - Mã GD: ${orderCode}`,
    });

    await this.paymentTransactionsRepo.updateStatus(orderCode, PaymentStatus.SUCCESS, {
      payosTransactionId: link.id,
    });

    this.logger.log(`confirm-return: credited wallet for order ${orderCode}`);
    return { message: deposit.message, balance: deposit.balance };
  }

  async getPaymentStatus(orderCode: string): Promise<PaymentStatus | null> {
    const payment = await this.paymentTransactionsRepo.findByOrderCode(
      parseInt(orderCode, 10),
    );
    return payment?.status ?? null;
  }
}
