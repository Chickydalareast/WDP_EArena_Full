import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { UserRole } from '../../users/schemas/user.schema';
import { AdminService } from '../admin.service';
import { AdminCreateUserDto, AdminListUsersQueryDto, AdminResetPasswordDto, AdminUpdateUserRoleDto, AdminUpdateUserStatusDto } from '../dto/admin-users.dto';

@Controller('admin/users')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminUsersController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  async list(@Query() query: AdminListUsersQueryDto) {
    return this.adminService.listUsers({
      page: query.page || 1,
      limit: query.limit || 20,
      search: query.search,
      role: query.role,
      status: query.status,
    });
  }

  @Post()
  async create(@Body() dto: AdminCreateUserDto) {
    return this.adminService.createUser(dto);
  }

  @Patch(':id/role')
  async updateRole(@Param('id') id: string, @Body() dto: AdminUpdateUserRoleDto) {
    return this.adminService.updateUserRole(id, dto.role);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() dto: AdminUpdateUserStatusDto) {
    return this.adminService.updateUserStatus(id, dto.status);
  }

  @Post(':id/reset-password')
  async resetPassword(@Param('id') id: string, @Body() dto: AdminResetPasswordDto) {
    return this.adminService.resetUserPassword(id, dto.newPassword);
  }

  @Delete(':id')
  async deactivate(@Param('id') id: string) {
    return this.adminService.deactivateUser(id);
  }
}
