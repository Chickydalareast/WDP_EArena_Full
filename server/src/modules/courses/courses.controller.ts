import {
  Controller,
  Post,
  Body,
  UseGuards,
  Put,
  Param,
  Patch,
  Delete,
  Get,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequireTeacherVerified } from '../../common/decorators/teacher-verified.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { UpdateCourseDto } from './dto/course.dto';
import {
  CreateCoursePayload,
  UpdateCoursePayload,
} from './interfaces/course.interface';

@Controller('courses')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireTeacherVerified()
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async createCourse(
    @Body() dto: CreateCourseDto,
    @CurrentUser('userId') userId: string,
  ) {
    const payload: CreateCoursePayload = {
      title: dto.title,
      price: dto.price,
      description: dto.description,
      teacherId: userId,
      progressionMode: dto.progressionMode,
      isStrictExam: dto.isStrictExam,
    };

    const result = await this.coursesService.createCourse(payload);

    return {
      message: 'Khởi tạo khóa học thành công',
      data: result,
    };
  }

  @Put(':id')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async updateCourse(
    @Param('id') id: string,
    @Body() dto: UpdateCourseDto,
    @CurrentUser('userId') userId: string,
  ) {
    const payload: UpdateCoursePayload = {
      courseId: id,
      teacherId: userId,
      title: dto.title,
      price: dto.price,
      discountPrice: dto.discountPrice,
      description: dto.description,
      benefits: dto.benefits,
      requirements: dto.requirements,
      coverImageId: dto.coverImageId,
      promotionalVideoId: dto.promotionalVideoId,
      progressionMode: dto.progressionMode,
      isStrictExam: dto.isStrictExam,
    };
    return this.coursesService.updateCourse(payload);
  }

  @Delete(':id')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async deleteCourse(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.coursesService.deleteCourse(id, userId);
  }

  @Get('me')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async getMyCourses(@CurrentUser('userId') userId: string) {
    const data = await this.coursesService.getMyCourses(userId);
    return {
      message: 'Lấy danh sách khóa học của tôi thành công',
      data,
    };
  }

  @Get('teacher/:id')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async getTeacherCourseDetail(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    const data = await this.coursesService.getTeacherCourseDetail(id, userId);
    return {
      message: 'Lấy thông tin cài đặt khóa học thành công',
      data,
    };
  }

  @Get('teacher/:id/curriculum-view')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async getTeacherCourseCurriculum(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    const data = await this.coursesService.getTeacherCourseCurriculum(
      id,
      userId,
    );
    return {
      message: 'Lấy cấu trúc khóa học thành công',
      data,
    };
  }

  @Get('teacher/:id/dashboard-stats')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async getDashboardStats(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    const data = await this.coursesService.getTeacherCourseStats(id, userId);
    return {
      message: 'Lấy thống kê khóa học thành công',
      data,
    };
  }

  @Patch(':id/submit-for-review')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async submitCourseForReview(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.coursesService.submitCourseForReview(id, userId);
  }
}
