import { Controller, Get, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { UserRole } from '../../../common/enums/user-role.enum';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { WalletsService } from '../../wallets/wallets.service';
import { ProcessWithdrawalDto } from '../../wallets/dto/withdraw.dto';
import { ProcessWithdrawalPayload, GetWithdrawalRequestsPayload } from '../../wallets/interfaces/withdrawal.interface';
import { AdminGetWithdrawalsQueryDto } from '../dto/admin-wallets.dto';

@Controller('admin/wallets')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminWalletsController {
    constructor(private readonly walletsService: WalletsService) { }

    @Get('withdrawals')
    async getWithdrawalRequests(@Query() query: AdminGetWithdrawalsQueryDto) {
        const payload: GetWithdrawalRequestsPayload = {
            status: query.status,
            page: query.page ?? 1,
            limit: query.limit ?? 10,
        };

        const data = await this.walletsService.getWithdrawalRequestsForAdmin(payload);

        return {
            message: 'Lấy danh sách yêu cầu rút tiền thành công.',
            data: data.items,
            meta: data.meta,
        };
    }

    @Patch('withdrawals/:id/process')
    async processWithdrawal(
        @Param('id') id: string,
        @Body() dto: ProcessWithdrawalDto,
        @CurrentUser('userId') adminId: string
    ) {
        const payload: ProcessWithdrawalPayload = {
            requestId: id,
            adminId,
            action: dto.action,
            rejectionReason: dto.rejectionReason,
        };

        return this.walletsService.processWithdrawalRequest(payload);
    }
}