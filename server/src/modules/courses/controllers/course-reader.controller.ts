import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import {
  CourseReaderService,
  SearchPublicCoursesPayload,
  GetStudyTreePayload,
  GetLessonContentPayload,
} from '../services/course-reader.service';
import { SearchPublicCoursesDto } from '../dto/course-reader.dto';
import {
  CoursePublicDetailResponseDto,
  LessonContentResponseDto,
  StudyTreeResponseDto,
} from '../dto/course-reader-response.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { OptionalAuth } from '../../../common/decorators/optional-auth.decorator';
import { PaginationDto } from '../../../common/dto/pagination.dto'; // Import DTO phân trang chung của dự án
import { UserRole } from '../../../common/enums/user-role.enum';
import { Roles } from '../../../common/decorators/roles.decorator';

@Controller('courses')
export class CourseReaderController {
  constructor(private readonly courseReaderService: CourseReaderService) {}

  @OptionalAuth()
  @Get('public')
  async searchPublicCourses(
    @Query() dto: SearchPublicCoursesDto,
    @CurrentUser('userId') userId: string,
  ) {
    if (
      dto.minPrice !== undefined &&
      dto.maxPrice !== undefined &&
      dto.minPrice > dto.maxPrice
    ) {
      throw new BadRequestException(
        'minPrice không được phép lớn hơn maxPrice.',
      );
    }

    const payload: SearchPublicCoursesPayload = {
      keyword: dto.keyword,
      subjectId: dto.subjectId,
      page: dto.page || 1,
      limit: dto.limit || 20,
      isFree: dto.isFree,
      minPrice: dto.minPrice,
      maxPrice: dto.maxPrice,
      sort: dto.sort,
      userId,
    };

    const result = await this.courseReaderService.searchPublicCourses(payload);
    return { message: 'Lấy danh sách khóa học thành công', ...result };
  }

  @OptionalAuth()
  @Get('public/:slug')
  async getPublicCourseDetail(
    @Param('slug') slug: string,
    @CurrentUser('userId') userId: string,
  ) {
    const data = await this.courseReaderService.getPublicCourseDetail(
      slug,
      userId,
    );

    const serializedData = plainToInstance(
      CoursePublicDetailResponseDto,
      data,
      {
        excludeExtraneousValues: true,
      },
    );

    return {
      message: 'Lấy chi tiết khóa học thành công',
      data: serializedData,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':courseId/study-tree')
  async getStudyTree(
    @Param('courseId') courseId: string,
    @CurrentUser('userId') userId: string,
  ) {
    const payload: GetStudyTreePayload = {
      courseId,
      userId,
    };
    const data = await this.courseReaderService.getStudyTree(payload);

    const serializedData = plainToInstance(StudyTreeResponseDto, data, {
      excludeExtraneousValues: true,
    });

    return { message: 'Lấy dữ liệu học tập thành công', data: serializedData };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':courseId/lessons/:lessonId/content')
  async getLessonContent(
    @Param('courseId') courseId: string,
    @Param('lessonId') lessonId: string,
    @CurrentUser('userId') userId: string,
  ) {
    const payload: GetLessonContentPayload = {
      courseId,
      lessonId,
      userId,
    };
    
    const data = await this.courseReaderService.getLessonContent(payload);

    const serializedData = plainToInstance(LessonContentResponseDto, data, {
      excludeExtraneousValues: true,
    });

    return { message: 'Lấy nội dung bài học thành công', data: serializedData };
  }

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.STUDENT, UserRole.TEACHER)
  @Get('my-learning')
  async getMyLearning(
    @CurrentUser('userId') userId: string,
    @Query() query: PaginationDto,
  ) {
    const payload = {
      userId,
      page: query.page || 1,
      limit: query.limit || 10,
    };

    const result = await this.courseReaderService.getMyLearningCourses(payload);

    return { message: 'Lấy danh sách khóa học của tôi thành công', ...result };
  }
}
