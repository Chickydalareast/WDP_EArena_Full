import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { QuestionFoldersService } from './question-folders.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateQuestionFolderDto } from './dto/create-question-folder.dto';
import { UpdateQuestionFolderDto } from './dto/update-question-folder.dto';

@Controller('question-folders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TEACHER, UserRole.ADMIN)
export class QuestionFoldersController {
  constructor(
    private readonly questionFoldersService: QuestionFoldersService,
  ) {}

  @Post()
  async createFolder(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateQuestionFolderDto,
  ) {
    return this.questionFoldersService.createFolder(userId, {
      name: dto.name,
      description: dto.description,
      parentId: dto.parentId,
    });
  }

  @Get()
  async getMyFolders(@CurrentUser('userId') userId: string) {
    return this.questionFoldersService.getMyFolders(userId);
  }

  @Patch(':id')
  async updateFolder(
    @Param('id') folderId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: UpdateQuestionFolderDto,
  ) {
    return this.questionFoldersService.updateFolder(folderId, userId, {
      name: dto.name,
      description: dto.description,
      parentId: dto.parentId,
    });
  }

  @Delete(':id')
  async deleteFolder(
    @Param('id') folderId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.questionFoldersService.deleteFolder(folderId, userId);
  }
}
