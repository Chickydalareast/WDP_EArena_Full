import { Body, Controller, Delete, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { UserRole } from '../../users/schemas/user.schema';
import { AdminService } from '../admin.service';
import { AdminListExamsQueryDto, AdminSetExamPublishDto } from '../dto/admin-exams.dto';

@Controller('admin/exams')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminExamsController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  async list(@Query() query: AdminListExamsQueryDto) {
    return this.adminService.listExams({
      page: query.page || 1,
      limit: query.limit || 20,
      search: query.search,
      type: query.type,
      teacherId: query.teacherId,
    });
  }

  @Patch(':id/publish')
  async setPublish(@Param('id') id: string, @Body() dto: AdminSetExamPublishDto) {
    return this.adminService.setExamPublish(id, dto.isPublished);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.adminService.deleteExam(id);
  }
}
