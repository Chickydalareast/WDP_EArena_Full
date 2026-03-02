import { Controller, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { CloneQuestionDto } from './dto/clone-question.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../users/schemas/user.schema';

@Controller('questions')
@UseGuards(RolesGuard)
@Roles(UserRole.TEACHER, UserRole.ADMIN)
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post()
  async create(
    @Body() dto: CreateQuestionDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.questionsService.createQuestion({
      ...dto,
      ownerId: userId, // TỬ HUYỆT Ở ĐÂY: Đổi teacherId thành ownerId
    });
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateQuestionDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.questionsService.updateQuestion(id, userId, dto);
  }

  @Post(':id/clone')
  async clone(
    @Param('id') id: string,
    @Body() dto: CloneQuestionDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.questionsService.cloneQuestion(id, userId, dto.destFolderId);
  }
}