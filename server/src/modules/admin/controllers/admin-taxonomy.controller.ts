import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { AdminService } from '../admin.service';
import { AdminCreateSubjectDto, AdminCreateTopicDto, AdminUpdateSubjectDto, AdminUpdateTopicDto } from '../dto/admin-taxonomy.dto';
import { UserRole } from 'src/common/enums/user-role.enum';

@Controller('admin/taxonomy')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminTaxonomyController {
  constructor(private readonly adminService: AdminService) {}

  @Get('subjects')
  async listSubjects() {
    return this.adminService.listSubjects();
  }

  @Post('subjects')
  async createSubject(@Body() dto: AdminCreateSubjectDto) {
    return this.adminService.createSubject(dto);
  }

  @Patch('subjects/:id')
  async updateSubject(@Param('id') id: string, @Body() dto: AdminUpdateSubjectDto) {
    return this.adminService.updateSubject(id, dto);
  }

  @Get('subjects/:subjectId/topics')
  async listTopics(@Param('subjectId') subjectId: string) {
    return this.adminService.listTopicsBySubject(subjectId);
  }

  @Post('topics')
  async createTopic(@Body() dto: AdminCreateTopicDto) {
    return this.adminService.createTopic(dto);
  }

  @Patch('topics/:id')
  async updateTopic(@Param('id') id: string, @Body() dto: AdminUpdateTopicDto) {
    return this.adminService.updateTopic(id, dto as any);
  }

  @Delete('topics/:id')
  async deleteTopic(@Param('id') id: string) {
    return this.adminService.deleteTopic(id);
  }
}
