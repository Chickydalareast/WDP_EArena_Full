import { Body, Controller, Delete, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { UserRole } from '../../users/schemas/user.schema';
import { AdminService } from '../admin.service';
import { AdminListQuestionsQueryDto, AdminSetQuestionArchiveDto } from '../dto/admin-questions.dto';

@Controller('admin/questions')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminQuestionsController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  async list(@Query() query: AdminListQuestionsQueryDto) {
    return this.adminService.listQuestions({
      page: query.page || 1,
      limit: query.limit || 20,
      search: query.search,
      ownerId: query.ownerId,
      folderId: query.folderId,
      topicId: query.topicId,
    });
  }

  @Patch(':id/archive')
  async archive(@Param('id') id: string, @Body() dto: AdminSetQuestionArchiveDto) {
    return this.adminService.setQuestionArchived(id, dto.isArchived);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.adminService.deleteQuestion(id);
  }
}
