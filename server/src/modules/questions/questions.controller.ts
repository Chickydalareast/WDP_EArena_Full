<<<<<<< HEAD
import { Controller, Post, Put, Body, Param } from '@nestjs/common';
=======
import { Controller, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
>>>>>>> feature/admin-full
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { CloneQuestionDto } from './dto/clone-question.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
<<<<<<< HEAD

@Controller('questions')
=======
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../users/schemas/user.schema';

@Controller('questions')
@UseGuards(RolesGuard)
@Roles(UserRole.TEACHER, UserRole.ADMIN)
>>>>>>> feature/admin-full
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post()
  async create(
    @Body() dto: CreateQuestionDto,
<<<<<<< HEAD
    @CurrentUser('id') userId: string,
=======
    @CurrentUser('userId') userId: string,
>>>>>>> feature/admin-full
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
<<<<<<< HEAD
    @CurrentUser('id') userId: string,
=======
    @CurrentUser('userId') userId: string,
>>>>>>> feature/admin-full
  ) {
    return this.questionsService.updateQuestion(id, userId, dto);
  }

  @Post(':id/clone')
  async clone(
    @Param('id') id: string,
    @Body() dto: CloneQuestionDto,
<<<<<<< HEAD
    @CurrentUser('id') userId: string,
=======
    @CurrentUser('userId') userId: string,
>>>>>>> feature/admin-full
  ) {
    return this.questionsService.cloneQuestion(id, userId, dto.destFolderId);
  }
}