import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { UserRole } from '../../users/schemas/user.schema';
import { AdminService } from '../admin.service';
import { AdminBusinessMetricsQueryDto } from '../dto/admin-business.dto';

@Controller('admin/business')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminBusinessController {
  constructor(private readonly adminService: AdminService) {}

  @Get('metrics')
  async metrics(@Query() query: AdminBusinessMetricsQueryDto) {
    return this.adminService.getBusinessMetrics({ from: query.from, to: query.to });
  }
}
