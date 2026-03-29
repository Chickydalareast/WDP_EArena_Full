import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { MockDepositDto, GetTransactionsDto } from './dto/wallets.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/user-role.enum';
import { CreateWithdrawalDto } from './dto/withdraw.dto';
import { CreateWithdrawalPayload } from './interfaces/withdrawal.interface';

@Controller('wallets')
@UseGuards(JwtAuthGuard)
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Get('me')
  async getMyWallet(@CurrentUser('userId') userId: string) {
    const data = await this.walletsService.getMyWallet(userId);
    return { message: 'Lấy thông tin ví thành công', data };
  }

  @Get('transactions')
  async getMyTransactions(
    @Query() query: GetTransactionsDto,
    @CurrentUser('userId') userId: string
  ) {
    const payload = {
      userId,
      page: query.page || 1,
      limit: query.limit || 10,
    };
    
    const result = await this.walletsService.getMyTransactions(payload);
    
    return { 
      message: 'Lấy lịch sử giao dịch thành công', 
      data: result.data,
      meta: result.meta 
    };
  }

  @Post('mock-deposit')
  async mockDeposit(
    @Body() dto: MockDepositDto, 
    @CurrentUser('userId') userId: string
  ) {
    const data = await this.walletsService.mockDeposit({ userId, amount: dto.amount });
    return data;
  }

  @Post('withdraw')
  @Roles(UserRole.TEACHER)
  async requestWithdrawal(
    @Body() dto: CreateWithdrawalDto,
    @CurrentUser('userId') userId: string
  ) {
    const payload: CreateWithdrawalPayload = {
      teacherId: userId,
      amount: dto.amount,
      bankName: dto.bankName,
      accountNumber: dto.accountNumber,
      accountName: dto.accountName,
    };
    
    return this.walletsService.requestWithdrawal(payload);
  }
}