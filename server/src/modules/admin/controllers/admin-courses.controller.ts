import { Controller, Get, Param, Patch, Body, Query, UseGuards } from '@nestjs/common';
import { AdminCoursesService } from '../services/admin-courses.service';
import { ForceTakedownCourseDto, GetAdminCoursesDto, GetPendingCoursesDto, RejectCourseDto } from '../dto/admin-courses.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user-role.enum';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@Controller('admin/courses')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminCoursesController {
    constructor(private readonly adminCoursesService: AdminCoursesService) { }

    @Get('pending')
    async getPendingCourses(@Query() query: GetPendingCoursesDto) {
        const data = await this.adminCoursesService.getPendingCourses({
            page: query.page ?? 1,
            limit: query.limit ?? 10,
        });

        return {
            message: 'Lấy danh sách khóa học chờ duyệt thành công.',
            data: data.items,
            meta: data.meta,
        };
    }

    @Get(':id')
    async getCourseDetailForReview(@Param('id') id: string) {
        const data = await this.adminCoursesService.getCourseDetailForReview(id);
        return {
            message: 'Lấy chi tiết khóa học thành công.',
            data,
        };
    }

    @Get(':id/lessons/:lessonId/preview-quiz')
    async previewCourseQuiz(
        @Param('id') courseId: string,
        @Param('lessonId') lessonId: string
    ) {
        const payload = { courseId, lessonId };
        const data = await this.adminCoursesService.previewCourseQuiz(payload);
        
        return {
            message: 'Tạo bản xem trước bài thi cho Admin thành công.',
            data: data.previewData,
            meta: {
                totalItems: data.totalItems,
                totalActualQuestions: data.totalActualQuestions
            }
        };
    }

    @Patch(':id/approve')
    async approveCourse(
        @Param('id') id: string,
        @CurrentUser('userId') adminId: string
    ) {
        const result = await this.adminCoursesService.approveCourse({ courseId: id, adminId });
        return result;
    }

    @Patch(':id/reject')
    async rejectCourse(
        @Param('id') id: string,
        @Body() dto: RejectCourseDto,
        @CurrentUser('userId') adminId: string
    ) {
        const result = await this.adminCoursesService.rejectCourse({
            courseId: id,
            reason: dto.reason,
            adminId,
        });
        return result;
    }

    @Get()
    async getAllCourses(@Query() query: GetAdminCoursesDto) {
        const data = await this.adminCoursesService.getAllCourses({
            page: query.page ?? 1,
            limit: query.limit ?? 10,
            search: query.search,
            status: query.status,
            teacherId: query.teacherId,
        });

        return {
            message: 'Lấy danh sách khóa học tổng thành công.',
            data: data.items,
            meta: data.meta,
        };
    }

    @Patch(':id/force-takedown')
    async forceTakedownCourse(
        @Param('id') id: string,
        @Body() dto: ForceTakedownCourseDto,
        @CurrentUser('userId') adminId: string
    ) {
        const result = await this.adminCoursesService.forceTakedownCourse({
            courseId: id,
            reason: dto.reason,
            adminId,
        });

        return result;
    }
}