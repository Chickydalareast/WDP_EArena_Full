import { Controller, Post, Get, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { QuestionFoldersService } from './question-folders.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('question-folders')
export class QuestionFoldersController {
  constructor(private readonly foldersService: QuestionFoldersService) {}

  @Post()
  async createFolder(
    @Body('name') name: string,
    @Body('subjectId') subjectId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.foldersService.createFolder(name, userId, subjectId);
  }

  @Get('my-folders')
  async getMyFolders(@CurrentUser('id') userId: string) {
    return this.foldersService.getMyFolders(userId);
  }

  @Delete(':id')
  async deleteFolder(
    @Param('id') folderId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.foldersService.deleteFolder(folderId, userId);
  }
}