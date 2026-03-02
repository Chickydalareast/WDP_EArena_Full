import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { UserRole } from '../../users/schemas/user.schema';
import { AdminService } from '../admin.service';
import { AdminListTeacherVerificationQueryDto, AdminUpdateTeacherVerificationDto } from '../dto/admin-teachers.dto';

@Controller('admin/teachers')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminTeachersController {
  constructor(private readonly adminService: AdminService) {}

  @Get('verification')
  async list(@Query() query: AdminListTeacherVerificationQueryDto) {
    return this.adminService.listTeacherVerifications({
      page: query.page || 1,
      limit: query.limit || 20,
      status: query.status,
      search: query.search,
    });
  }

  @Patch(':id/verification')
  async verify(
    @CurrentUser('userId') adminId: string,
    @Param('id') id: string,
    @Body() dto: AdminUpdateTeacherVerificationDto,
  ) {
    return this.adminService.updateTeacherVerification(adminId, id, dto);
  }
}
