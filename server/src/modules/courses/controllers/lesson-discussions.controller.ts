import {
    Controller,
    Post,
    Get,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { LessonDiscussionsService } from '../services/lesson-discussions.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import {
    CreateDiscussionDto,
    ReplyDiscussionDto,
    DiscussionQueryDto,
    ReplyQueryDto,
    CourseDiscussionQueryDto,
} from '../dto/lesson-discussion.dto';
import {
    CreateDiscussionPayload,
    GetCourseDiscussionsParams,
    ReplyDiscussionPayload,
} from '../interfaces/lesson-discussion.interface';

@Controller('courses/discussions')
@UseGuards(JwtAuthGuard)
export class LessonDiscussionsController {
    constructor(private readonly discussionsService: LessonDiscussionsService) { }

    @Post('questions')
    async askQuestion(
        @CurrentUser('userId') userId: string,
        @Body() dto: CreateDiscussionDto,
    ) {
        const payload: CreateDiscussionPayload = {
            userId,
            courseId: dto.courseId,
            lessonId: dto.lessonId,
            content: dto.content,
            attachments: dto.attachments,
        };
        const result = await this.discussionsService.createQuestion(payload);
        return { message: result.message, data: { id: result.id } };
    }

    @Post('replies')
    async replyQuestion(
        @CurrentUser('userId') userId: string,
        @Body() dto: ReplyDiscussionDto,
    ) {
        const payload: ReplyDiscussionPayload = {
            userId,
            courseId: dto.courseId,
            lessonId: dto.lessonId,
            parentId: dto.parentId,
            content: dto.content,
            attachments: dto.attachments,
        };
        const result = await this.discussionsService.replyToQuestion(payload);
        return { message: result.message, data: { id: result.id } };
    }

    @Get('lessons/:lessonId/questions')
    async getQuestions(
        @CurrentUser('userId') userId: string,
        @Param('lessonId') lessonId: string,
        @Query() query: DiscussionQueryDto,
    ) {
        const result = await this.discussionsService.getLessonQuestions({
            userId,
            courseId: query.courseId,
            lessonId,
            page: query.page || 1,
            limit: query.limit || 10,
            sortBy: query.sortBy || 'recent',
        });

        return {
            message: 'Lấy danh sách thảo luận thành công',
            data: result.data,
            meta: { total: result.total, page: query.page, limit: query.limit },
        };
    }

    @Get('questions/:parentId/replies')
    async getReplies(
        @CurrentUser('userId') userId: string,
        @Param('parentId') parentId: string,
        @Query() query: ReplyQueryDto,
    ) {
        const result = await this.discussionsService.getQuestionReplies(userId, query.courseId, parentId);
        return { message: 'Lấy danh sách phản hồi thành công', data: result.data };
    }

    @Get('courses/:courseId/questions')
    async getCourseQuestions(
        @CurrentUser('userId') userId: string,
        @Param('courseId') courseId: string,
        @Query() query: CourseDiscussionQueryDto,
    ) {
        const payload: GetCourseDiscussionsParams = {
            userId,
            courseId,
            page: query.page || 1,
            limit: query.limit || 10,
            sortBy: query.sortBy || 'recent',
            filter: query.filter || 'all',
        };

        const result = await this.discussionsService.getCourseQuestions(payload);

        return {
            message: 'Lấy danh sách thảo luận toàn khóa học thành công',
            data: result.data,
            meta: { total: result.total, page: payload.page, limit: payload.limit },
        };
    }
}