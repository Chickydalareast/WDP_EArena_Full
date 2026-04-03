import { Controller, Post, Param, Body, UseGuards } from '@nestjs/common';
import {
  EnrollmentsService,
  EnrollUserPayload,
  MarkLessonPayload,
} from '../services/enrollments.service';
import { MarkLessonDto } from '../dto/enrollment.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CourseCheckoutPayload } from '../interfaces/course.interface';
import { CourseCheckoutService } from '../services/course-checkout.service';

@Controller('enrollments')
@UseGuards(JwtAuthGuard)
export class EnrollmentsController {
  constructor(
    private readonly enrollmentsService: EnrollmentsService,
    private readonly checkoutService: CourseCheckoutService,
  ) {}
  @Post(':courseId/enroll')
  async enrollCourse(
    @Param('courseId') courseId: string,
    @CurrentUser('userId') userId: string,
  ) {
    const payload: CourseCheckoutPayload = { userId, courseId };
    return this.checkoutService.checkoutCourse(payload);
  }

  @Post('mark-completed')
  async markCompleted(
    @Body() dto: MarkLessonDto,
    @CurrentUser('userId') userId: string,
  ) {
    const payload: MarkLessonPayload = {
      userId,
      courseId: dto.courseId,
      lessonId: dto.lessonId,
    };
    return this.enrollmentsService.markLessonCompleted(payload);
  }
}
