import { Controller, Post, Get, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { QuestionFoldersService } from './question-folders.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
<<<<<<< HEAD

@Controller('question-folders')
=======
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../users/schemas/user.schema';

@Controller('question-folders')
@UseGuards(RolesGuard)
@Roles(UserRole.TEACHER, UserRole.ADMIN)
>>>>>>> feature/admin-full
export class QuestionFoldersController {
  constructor(private readonly foldersService: QuestionFoldersService) {}

  @Post()
  async createFolder(
    @Body('name') name: string,
    @Body('subjectId') subjectId: string,
<<<<<<< HEAD
    @CurrentUser('id') userId: string,
=======
    @CurrentUser('userId') userId: string,
>>>>>>> feature/admin-full
  ) {
    return this.foldersService.createFolder(name, userId, subjectId);
  }

  @Get('my-folders')
<<<<<<< HEAD
  async getMyFolders(@CurrentUser('id') userId: string) {
=======
  async getMyFolders(@CurrentUser('userId') userId: string) {
>>>>>>> feature/admin-full
    return this.foldersService.getMyFolders(userId);
  }

  @Delete(':id')
  async deleteFolder(
    @Param('id') folderId: string,
<<<<<<< HEAD
    @CurrentUser('id') userId: string,
=======
    @CurrentUser('userId') userId: string,
>>>>>>> feature/admin-full
  ) {
    return this.foldersService.deleteFolder(folderId, userId);
  }
}