import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards
} from '@nestjs/common';
import { ClassesService } from './classes.service';
import {
  CreateClassDto,
  SearchClassDto,
  JoinByCodeDto,
  GetMembersDto,
  ReviewMemberDto,
  UpdateClassDto
} from './dto';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { RateLimit } from '../../common/decorators/rate-limit.decorator';
import { OptionalAuth } from '../../common/decorators/optional-auth.decorator';

@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) { }

  @Post()
  async createClass(
    @Body() dto: CreateClassDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.classesService.createClass({
      ...dto,
      teacherId: userId,
    });
  }

  @Get('search')
  @Public()
  @RateLimit({ points: 10, duration: 10 })
  async searchClasses(@Query() query: SearchClassDto) {
    return this.classesService.searchPublicClasses({
      ...query,
      page: Math.max(1, Number(query.page) || 1),
      limit: Math.max(1, Number(query.limit) || 20),
    });
  }

  @Post(':id/request-join')
  @HttpCode(HttpStatus.OK)
  async requestJoin(
    @Param('id') classId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.classesService.requestJoin(classId, userId);
  }

  @Post('join-by-code')
  @HttpCode(HttpStatus.OK)
  async joinByCode(
    @Body() dto: JoinByCodeDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.classesService.joinByCode(dto.code, userId);
  }

  @Patch(':id/review-member')
  @HttpCode(HttpStatus.OK)
  async reviewMember(
    @Param('id') classId: string,
    @Body() dto: ReviewMemberDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.classesService.reviewMember(classId, userId, dto.studentId, dto.status);
  }

  @Get(':id/preview')
  @OptionalAuth() 
  async getClassPreview(
    @Param('id') classId: string,
    @CurrentUser('userId') userId?: string, 
  ) {
    return this.classesService.getClassPreview(classId, userId);
  }

  @Get(':id/members')
  async getClassMembers(
    @Param('id') classId: string,
    @Query() query: GetMembersDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.classesService.getClassMembers(classId, userId, {
      status: query.status,
      page: Math.max(1, Number(query.page) || 1),
      limit: Math.max(1, Number(query.limit) || 20)
    });
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getMyClasses(@CurrentUser('userId') userId: string) {
    return this.classesService.getMyClasses(userId);
  }

  @Get(':id/detail')
  @HttpCode(HttpStatus.OK)
  async getClassDetailForTeacher(
    @Param('id') classId: string,
    @CurrentUser('userId') userId: string
  ) {
    return this.classesService.getClassDetailForTeacher(classId, userId);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updateClass(
    @Param('id') classId: string,
    @Body() dto: UpdateClassDto,
    @CurrentUser('userId') userId: string
  ) {
    const payload = { ...dto };
    return this.classesService.updateClass(classId, userId, payload);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteClass(
    @Param('id') classId: string,
    @CurrentUser('userId') userId: string
  ) {
    return this.classesService.deleteClass(classId, userId);
  }

  @Delete(':id/members/:studentId')
  @HttpCode(HttpStatus.OK)
  async kickStudent(
    @Param('id') classId: string,
    @Param('studentId') studentId: string,
    @CurrentUser('userId') userId: string
  ) {
    return this.classesService.kickStudent(classId, userId, studentId);
  }

  @Get('joined')
  async getJoinedClasses(
    @CurrentUser('userId') userId: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.classesService.getJoinedClasses(
      userId,
      Math.max(1, Number(page) || 1),
      Math.max(1, Number(limit) || 20)
    );
  }

  @Get(':id/workspace')
  async getStudentWorkspace(
    @Param('id') classId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.classesService.getStudentWorkspace(classId, userId);
  }

  @Delete(':id/leave')
  @HttpCode(HttpStatus.OK)
  async leaveClass(
    @Param('id') classId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.classesService.leaveClass(classId, userId);
  }

  @Patch(':id/reset-code')
  @HttpCode(HttpStatus.OK)
  async resetClassCode(
    @Param('id') classId: string,
    @CurrentUser('userId') userId: string
  ) {
    return this.classesService.resetClassCode(classId, userId);
  }

  // Tạm thời comment API này lại vì chúng ta đang gác ExamsModule sang một bên
  /*
  @Get(':id/assignments')
  async getClassAssignments(
    @Param('id') classId: string,
    @CurrentUser('userId') userId: string, 
  ) {
    return this.classesService.getClassAssignments(classId, userId);
  }
  */
}