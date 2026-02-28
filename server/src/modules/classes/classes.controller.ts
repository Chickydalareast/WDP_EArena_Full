import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { ClassesService } from './classes.service';
import {
  CreateClassDto,
  SearchClassDto,
  JoinByCodeDto,
  GetMembersDto,
  ReviewMemberDto
} from './dto';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

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
  async searchClasses(@Query() query: SearchClassDto) {
    return this.classesService.searchPublicClasses(query);
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
  @Public() // MỞ KHÓA API PREVIEW CHO KHÁCH
  async getClassPreview(@Param('id') classId: string) {
    return this.classesService.getClassPreview(classId);
  }

  @Get(':id/members')
  async getClassMembers(
    @Param('id') classId: string,
    @Query() query: GetMembersDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.classesService.getClassMembers(classId, userId, query.status);
  }

 @Get()
  @HttpCode(HttpStatus.OK)
  async getMyClasses(
    @CurrentUser('userId') userId: string,
  ) {
    return this.classesService.getClassesByTeacher(userId);
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