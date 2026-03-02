import { Body, Controller, Delete, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { UserRole } from '../../users/schemas/user.schema';
import { AdminService } from '../admin.service';
import { AdminListClassesQueryDto, AdminSetClassLockDto } from '../dto/admin-classes.dto';

@Controller('admin/classes')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminClassesController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  async list(@Query() query: AdminListClassesQueryDto) {
    return this.adminService.listClasses({
      page: query.page || 1,
      limit: query.limit || 20,
      search: query.search,
      teacherId: query.teacherId,
    });
  }

  @Patch(':id/lock')
  async setLock(@Param('id') id: string, @Body() dto: AdminSetClassLockDto) {
    return this.adminService.setClassLocked(id, dto.isLocked);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.adminService.deleteClass(id);
  }
}
