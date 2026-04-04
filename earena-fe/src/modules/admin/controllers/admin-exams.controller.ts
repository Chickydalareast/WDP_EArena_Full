import { Body, Controller, Delete, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { AdminService } from '../admin.service';
import { AdminListExamsQueryDto, AdminSetExamPublishDto } from '../dto/admin-exams.dto';
import { UserRole } from 'src/common/enums/user-role.enum';

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

  // @Patch(':id/publish')
  // async setPublish(@Param('id') id: string, @Body() dto: AdminSetExamPublishDto) {
  //   return this.adminService.setExamPublish(id, dto.isPublished);
  // }

  // @Delete(':id')
  // async delete(@Param('id') id: string) {
  //   return this.adminService.deleteExam(id);
  // }

  @Get(':examId/paper')
  async getPaperDetailByExamId(@Param('examId') examId: string) {
    const data = await this.adminService.getExamPaperDetailByExamId(examId);
    return {
      message: 'Lấy chi tiết cấu trúc đề thi thành công',
      data
    };
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
