import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { SyncHeartbeatDto } from '../dto/learning-tracking.dto';
import { LearningTrackingService } from '../services/learning-tracking.service';
import { SyncHeartbeatPayload } from '../interfaces/learning-tracking.interface';
import { UserRole } from 'src/common/enums/user-role.enum';
import { Roles } from 'src/common/decorators/roles.decorator';
import { GetCourseMembersQueryDto } from '../dto/get-course-members.dto';
import { IGetCourseMembersParams, IStudentAnalyticsParams, IStudentLessonAttemptsParams } from '../interfaces/teacher-tracking.interface';
import { StudentTrackingParamDto } from '../dto/student-tracking-params.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('learning')
@UseGuards(JwtAuthGuard)
export class LearningTrackingController {
  constructor(private readonly trackingService: LearningTrackingService) { }

  @Post('heartbeat')
  @HttpCode(HttpStatus.OK)
  async syncHeartbeat(
    @Body() dto: SyncHeartbeatDto,
    @CurrentUser('userId') userId: string,
  ) {
    const payload: SyncHeartbeatPayload = {
      userId,
      courseId: dto.courseId,
      lessonId: dto.lessonId,
      delta: dto.delta,
      lastPosition: dto.lastPosition,
      isEnded: dto.isEnded,
    };

    await this.trackingService.recordHeartbeat(payload);
    return { message: 'ACK' };
  }

  @Get(':courseId/tracking/members')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async getCourseMembers(
    @Param('courseId') courseId: string,
    @Query() queryDto: GetCourseMembersQueryDto,
    @CurrentUser('userId') teacherId: string,
  ) {
    const serviceParams: IGetCourseMembersParams = {
      courseId,
      teacherId,
      page: Number(queryDto.page || 1),
      limit: Number(queryDto.limit || 10),
      search: queryDto.search,
      sortBy: queryDto.sortBy,
      sortOrder: queryDto.sortOrder,
    };

    return this.trackingService.getCourseMembersList(serviceParams);
  }

  @Get(':courseId/tracking/members/:studentId/exams')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async getStudentExamAnalytics(
    @Param() params: StudentTrackingParamDto, 
    @Query() queryDto: PaginationDto,
    @CurrentUser('userId') teacherId: string,
  ) {
    const serviceParams: IStudentAnalyticsParams = {
      courseId: params.courseId,
      teacherId,
      studentId: params.studentId,
      page: Number(queryDto.page || 1),
      limit: Number(queryDto.limit || 10),
    };

    return this.trackingService.getStudentExamsOverview(serviceParams);
  }

  @Get(':courseId/tracking/members/:studentId/lessons/:lessonId/attempts')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async getStudentLessonAttemptsDetails(
    @Param() params: StudentTrackingParamDto,
    @Query() queryDto: PaginationDto,
    @CurrentUser('userId') teacherId: string,
  ) {
    const serviceParams: IStudentLessonAttemptsParams = {
      courseId: params.courseId,
      teacherId,
      studentId: params.studentId,
      lessonId: params.lessonId!,
      page: Number(queryDto.page || 1),
      limit: Number(queryDto.limit || 10),
    };

    return this.trackingService.getStudentLessonAttempts(serviceParams);
  }
}
