import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

import { GetQuestionsDto } from './dto/get-questions.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { CloneQuestionDto } from './dto/clone-question.dto';
import { UpdatePassageDto } from './dto/update-passage.dto';
import { BulkCreateQuestionDto } from './dto/bulk-create-question.dto';
import { BulkStandardizeQuestionDto } from './dto/bulk-standardize-question.dto';
import { MoveQuestionsDto } from './dto/move-questions.dto';
import { BulkCloneQuestionDto } from './dto/bulk-clone-question.dto';
import { BulkDeleteQuestionDto } from './dto/bulk-delete-question.dto';
import { SuggestFolderDto } from './dto/suggest-folder.dto';
import { OrganizeQuestionsDto } from './dto/organize-questions.dto';
import { AutoTagQuestionsDto } from './dto/auto-tag-questions.dto';
import { ActiveFiltersDto } from './dto/active-filters.dto';
import {
  BulkPublishQuestionPayload,
  GetActiveFiltersPayload,
} from './interfaces/question.interface';
import { BulkPublishQuestionDto } from './dto/bulk-publish-question.dto';

@Controller('questions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TEACHER, UserRole.ADMIN)
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  async getQuestions(
    @CurrentUser('userId') userId: string,
    @Query() query: GetQuestionsDto,
  ) {
    return this.questionsService.getQuestionsPaginated(userId, {
      page: query.page || 1,
      limit: query.limit || 10,
      folderIds: query.folderIds,
      topicIds: query.topicIds,
      difficultyLevels: query.difficultyLevels,
      tags: query.tags,
      search: query.search,
      isDraft: query.isDraft,
    });
  }

  @Post()
  async createQuestion(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateQuestionDto,
  ) {
    return this.questionsService.createQuestion({
      ownerId: userId,
      folderId: dto.folderId,
      topicId: dto.topicId,
      type: dto.type,
      difficultyLevel: dto.difficultyLevel,
      content: dto.content,
      explanation: dto.explanation,
      orderIndex: dto.orderIndex,
      answers: dto.answers,
      parentPassageId: dto.parentPassageId,
      tags: dto.tags,
      isDraft: dto.isDraft,
      attachedMedia: dto.attachedMedia,
    });
  }

  @Post('bulk-create')
  async bulkCreateQuestions(
    @CurrentUser('userId') userId: string,
    @Body() dto: BulkCreateQuestionDto,
  ) {
    return this.questionsService.bulkCreateQuestions({
      ownerId: userId,
      folderId: dto.folderId,
      questions: dto.questions,
    });
  }

  @Patch('bulk-standardize')
  async bulkStandardizeQuestions(
    @CurrentUser('userId') userId: string,
    @Body() dto: BulkStandardizeQuestionDto,
  ) {
    return this.questionsService.bulkStandardizeQuestions(userId, {
      questionIds: dto.questionIds,
      topicId: dto.topicId,
      difficultyLevel: dto.difficultyLevel,
      autoOrganize: dto.autoOrganize,
    });
  }

  @Patch('bulk-move')
  async moveQuestions(
    @CurrentUser('userId') userId: string,
    @Body() dto: MoveQuestionsDto,
  ) {
    return this.questionsService.moveQuestions(userId, {
      questionIds: dto.questionIds,
      destFolderId: dto.destFolderId,
    });
  }

  @Post('bulk-clone')
  async bulkCloneQuestions(
    @CurrentUser('userId') userId: string,
    @Body() dto: BulkCloneQuestionDto,
  ) {
    return this.questionsService.bulkCloneQuestions(userId, {
      questionIds: dto.questionIds,
      destFolderId: dto.destFolderId,
    });
  }

  @Post('bulk-delete')
  async bulkDeleteQuestions(
    @CurrentUser('userId') userId: string,
    @Body() dto: BulkDeleteQuestionDto,
  ) {
    return this.questionsService.bulkDeleteQuestions(userId, {
      questionIds: dto.questionIds,
    });
  }

  @Post('suggest-folders')
  async suggestFoldersForMove(
    @CurrentUser('userId') userId: string,
    @Body() dto: SuggestFolderDto,
  ) {
    return this.questionsService.suggestFoldersForMove(userId, {
      questionIds: dto.questionIds,
    });
  }

  @Patch('bulk-publish')
  @HttpCode(HttpStatus.OK)
  async bulkPublishQuestions(
    @CurrentUser('userId') userId: string,
    @Body() dto: BulkPublishQuestionDto,
  ) {
    const payload: BulkPublishQuestionPayload = {
      questionIds: dto.questionIds,
    };
    return this.questionsService.bulkPublishQuestions(userId, payload);
  }

  @Patch(':id')
  async updateQuestion(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: UpdateQuestionDto,
  ) {
    return this.questionsService.updateQuestion(id, userId, {
      folderId: dto.folderId,
      topicId: dto.topicId,
      type: dto.type,
      difficultyLevel: dto.difficultyLevel,
      content: dto.content,
      explanation: dto.explanation,
      orderIndex: dto.orderIndex,
      answers: dto.answers,
      parentPassageId: dto.parentPassageId,
      tags: dto.tags,
      isDraft: dto.isDraft,
      attachedMedia: dto.attachedMedia,
    });
  }

  @Delete(':id')
  async deleteQuestion(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.questionsService.deleteQuestion(id, userId);
  }

  @Post(':id/clone')
  async cloneQuestion(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CloneQuestionDto,
  ) {
    return this.questionsService.cloneQuestion(id, userId, {
      destFolderId: dto.destFolderId,
    });
  }

  @Put(':id/passage')
  async updatePassageWithDiffing(
    @Param('id') passageId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: UpdatePassageDto,
  ) {
    return this.questionsService.updatePassageWithDiffing(passageId, userId, {
      content: dto.content,
      explanation: dto.explanation,
      difficultyLevel: dto.difficultyLevel,
      tags: dto.tags,
      attachedMedia: dto.attachedMedia,
      subQuestions: dto.subQuestions,
    });
  }

  @Post('organize/preview')
  async previewOrganizeQuestions(
    @CurrentUser('userId') userId: string,
    @Body() dto: OrganizeQuestionsDto,
  ) {
    return this.questionsService.previewOrganize(userId, {
      questionIds: dto.questionIds,
      strategy: dto.strategy,
      baseFolderId: dto.baseFolderId,
    });
  }

  @Post('organize/execute')
  async executeOrganizeQuestions(
    @CurrentUser('userId') userId: string,
    @Body() dto: OrganizeQuestionsDto,
  ) {
    return this.questionsService.executeOrganize(userId, {
      questionIds: dto.questionIds,
      strategy: dto.strategy,
      baseFolderId: dto.baseFolderId,
    });
  }

  @Post('bulk-auto-tag')
  async bulkAutoTagQuestions(
    @CurrentUser('userId') userId: string,
    @Body() dto: AutoTagQuestionsDto,
  ) {
    return this.questionsService.dispatchAutoTagJob(userId, {
      questionIds: dto.questionIds,
    });
  }

  // @Post('active-filters/query')
  // @HttpCode(HttpStatus.OK)
  // async getActiveFilters(
  //   @CurrentUser('userId') userId: string,
  //   @Body() dto: ActiveFiltersDto
  // ) {
  //   return this.questionsService.getActiveFilters(userId, {
  //     folderIds: dto.folderIds,
  //     topicIds: dto.topicIds,
  //     difficulties: dto.difficulties,
  //     tags: dto.tags
  //   });
  // }

  @Post('active-filters')
  @HttpCode(HttpStatus.OK)
  async getActiveFilters(
    @CurrentUser('userId') userId: string,
    @Body() dto: ActiveFiltersDto,
  ) {
    const payload: GetActiveFiltersPayload = {
      folderIds: dto.folderIds,
      topicIds: dto.topicIds,
      difficulties: dto.difficulties,
      tags: dto.tags,
      isDraft: dto.isDraft,
    };

    const data = await this.questionsService.getActiveFilters(userId, payload);

    return {
      message: 'Lấy bộ lọc động thành công.',
      data,
    };
  }
}
