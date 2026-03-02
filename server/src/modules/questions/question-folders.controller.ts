import { Controller, Post, Get, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { QuestionFoldersService } from './question-folders.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../users/schemas/user.schema';

@Controller('question-folders')
@UseGuards(RolesGuard)
@Roles(UserRole.TEACHER, UserRole.ADMIN)
export class QuestionFoldersController {
  constructor(private readonly foldersService: QuestionFoldersService) {}

  @Post()
  async createFolder(
    @Body('name') name: string,
    @Body('subjectId') subjectId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.foldersService.createFolder(name, userId, subjectId);
  }

  @Get('my-folders')
  async getMyFolders(@CurrentUser('userId') userId: string) {
    return this.foldersService.getMyFolders(userId);
  }

  @Delete(':id')
  async deleteFolder(
    @Param('id') folderId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.foldersService.deleteFolder(folderId, userId);
  }
}