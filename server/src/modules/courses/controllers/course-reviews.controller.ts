import { Controller, Post, Patch, Body, Param, UseGuards, Get, Query } from '@nestjs/common';
import { CourseReviewsService } from '../services/course-reviews.service';
import { CreateCourseReviewDto, ReplyCourseReviewDto } from '../dto/course-review.dto';
import { CreateCourseReviewPayload, ReplyCourseReviewPayload } from '../interfaces/course.interface';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { UserRole } from '../../../common/enums/user-role.enum';
import { Public } from 'src/common/decorators/public.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('courses')
@UseGuards(JwtAuthGuard)
export class CourseReviewsController {
  constructor(private readonly courseReviewsService: CourseReviewsService) { }

  @Post(':courseId/reviews')
  async createReview(
    @Param('courseId') courseId: string,
    @Body() dto: CreateCourseReviewDto,
    @CurrentUser('userId') userId: string, // 
  ) {
    const payload: CreateCourseReviewPayload = {
      courseId,
      userId,
      rating: dto.rating,
      comment: dto.comment,
    };

    return this.courseReviewsService.createReview(payload);
  }

  @Patch(':courseId/reviews/:reviewId/reply')
  @UseGuards(RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async replyReview(
    @Param('courseId') courseId: string,
    @Param('reviewId') reviewId: string,
    @Body() dto: ReplyCourseReviewDto,
    @CurrentUser('userId') teacherId: string,
  ) {
    const payload: ReplyCourseReviewPayload = {
      reviewId,
      courseId,
      teacherId,
      reply: dto.reply,
    };

    return this.courseReviewsService.replyReview(payload);
  }

  @Get(':courseId/reviews')
  @Public()
  async getReviews(
    @Param('courseId') courseId: string,
    @Query() query: PaginationDto
  ) {
    const payload = {
      courseId,
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 10,
    };

    const data = await this.courseReviewsService.getReviews(payload);

    return {
      message: 'Lấy danh sách đánh giá thành công',
      data: data.items,
      meta: data.meta
    };
  }
}