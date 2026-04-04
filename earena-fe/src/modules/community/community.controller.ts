import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseFilePipe,
  MaxFileSizeValidator,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UserRole } from 'src/common/enums/user-role.enum';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { OptionalAuth } from 'src/common/decorators/optional-auth.decorator';
import { RateLimit } from 'src/common/decorators/rate-limit.decorator';
import { CommunityService } from './community.service';
import { CreateCommunityPostDto, UpdateCommunityPostDto } from './dto/create-community-post.dto';
import { CommunityFeedQueryDto } from './dto/community-feed-query.dto';
import { CreateCommunityCommentDto, UpdateCommunityCommentDto } from './dto/community-comment.dto';
import { CommunityReactDto } from './dto/community-react.dto';
import { CreateCommunityReportDto } from './dto/community-report.dto';
import { CommunityFollowDto } from './dto/community-follow.dto';
import { CommunityFollowTarget } from './constants/community.constants';
import { CommentIdBodyDto } from './dto/community-id-body.dto';

type ReqUser = {
  userId: string;
  role: UserRole;
  email?: string;
  teacherVerificationStatus?: string;
};

@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  private actor(user: ReqUser) {
    return {
      userId: user.userId,
      role: user.role,
      email: user.email,
      teacherVerificationStatus: user.teacherVerificationStatus,
    };
  }

  @OptionalAuth()
  @Get('feed')
  async feed(
    @Query() query: CommunityFeedQueryDto,
    @CurrentUser('userId') userId: string | null,
  ) {
    const data = await this.communityService.getFeed(query, userId);
    return { message: 'OK', data };
  }

  @OptionalAuth()
  @Get('sidebar')
  async sidebar(@CurrentUser('userId') userId: string | null) {
    const data = await this.communityService.sidebar(userId);
    return { message: 'OK', data };
  }

  @Get('recommended')
  async recommended(
    @CurrentUser('userId') userId: string,
    @Query('limit') limit?: number,
  ) {
    const data = await this.communityService.getRecommended(userId, limit || 20);
    return { message: 'OK', data };
  }

  @OptionalAuth()
  @Get('posts/course/:courseId')
  async postsByCourse(
    @Param('courseId') courseId: string,
    @Query('cursor') cursor: string,
    @Query('limit') limit: number,
    @CurrentUser('userId') userId: string | null,
  ) {
    const data = await this.communityService.listPostsByCourse(
      courseId,
      userId,
      cursor,
      limit || 20,
    );
    return { message: 'OK', data };
  }

  @OptionalAuth()
  @Get('posts/:postId')
  async getPost(
    @Param('postId') postId: string,
    @CurrentUser('userId') userId: string | null,
  ) {
    const data = await this.communityService.getPostById(postId, userId);
    return { message: 'OK', data };
  }

  @OptionalAuth()
  @Get('posts/:postId/comments')
  async listComments(
    @Param('postId') postId: string,
    @CurrentUser('userId') userId: string | null,
  ) {
    const data = await this.communityService.listComments(postId, userId);
    return { message: 'OK', data };
  }

  @OptionalAuth()
  @Get('profile/:userId')
  async profile(
    @Param('userId') userId: string,
    @CurrentUser('userId') viewerId: string | null,
  ) {
    const data = await this.communityService.getProfile(userId, viewerId);
    return { message: 'OK', data };
  }

  /** Ảnh đính kèm bài/comment: multipart qua BE → Cloudinary (cookie JWT, không cần signature phía trình duyệt). */
  @RateLimit({ points: 40, duration: 60 })
  @Post('upload/image')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 8 * 1024 * 1024 },
    }),
  )
  async uploadPostImage(
    @CurrentUser('userId') userId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 8 * 1024 * 1024 })],
      }),
    )
    file: Express.Multer.File,
  ) {
    const data = await this.communityService.uploadAttachmentImage(userId, file);
    return { message: 'Tải ảnh thành công', data };
  }

  @RateLimit({ points: 8, duration: 60 })
  @Post('posts')
  async createPost(
    @CurrentUser() user: ReqUser,
    @Body() dto: CreateCommunityPostDto,
  ) {
    const data = await this.communityService.createPost(this.actor(user), dto);
    return { message: 'Đã đăng bài', data };
  }

  @Patch('posts/:postId')
  async updatePost(
    @CurrentUser() user: ReqUser,
    @Param('postId') postId: string,
    @Body() dto: UpdateCommunityPostDto,
  ) {
    const data = await this.communityService.updatePost(
      this.actor(user),
      postId,
      dto,
    );
    return { message: 'Đã cập nhật', data };
  }

  @Delete('posts/:postId')
  async deletePost(
    @CurrentUser() user: ReqUser,
    @Param('postId') postId: string,
  ) {
    const data = await this.communityService.deletePost(this.actor(user), postId);
    return { message: 'Đã xóa', data };
  }

  @Post('posts/:postId/save')
  async savePost(
    @CurrentUser() user: ReqUser,
    @Param('postId') postId: string,
  ) {
    const data = await this.communityService.savePost(this.actor(user), postId);
    return { message: 'OK', data };
  }

  @Delete('posts/:postId/save')
  async unsavePost(
    @CurrentUser() user: ReqUser,
    @Param('postId') postId: string,
  ) {
    const data = await this.communityService.unsavePost(this.actor(user), postId);
    return { message: 'OK', data };
  }

  @Get('me/saved')
  async saved(
    @CurrentUser() user: ReqUser,
    @Query('cursor') cursor: string,
    @Query('limit') limit: number,
  ) {
    const data = await this.communityService.listSaved(
      this.actor(user),
      cursor,
      limit || 20,
    );
    return { message: 'OK', data };
  }

  @Post('posts/:postId/react')
  async reactPost(
    @CurrentUser() user: ReqUser,
    @Param('postId') postId: string,
    @Body() dto: CommunityReactDto,
  ) {
    const data = await this.communityService.setPostReaction(
      this.actor(user),
      postId,
      dto.kind,
    );
    return { message: 'OK', data };
  }

  @Delete('posts/:postId/react')
  async unreactPost(
    @CurrentUser() user: ReqUser,
    @Param('postId') postId: string,
  ) {
    const data = await this.communityService.removePostReaction(
      this.actor(user),
      postId,
    );
    return { message: 'OK', data };
  }

  @RateLimit({ points: 25, duration: 60 })
  @Post('posts/:postId/comments')
  async createComment(
    @CurrentUser() user: ReqUser,
    @Param('postId') postId: string,
    @Body() dto: CreateCommunityCommentDto,
  ) {
    const data = await this.communityService.createComment(
      this.actor(user),
      postId,
      dto,
    );
    return { message: 'Đã gửi bình luận', data };
  }

  @Patch('comments/:commentId')
  async updateComment(
    @CurrentUser() user: ReqUser,
    @Param('commentId') commentId: string,
    @Body() dto: UpdateCommunityCommentDto,
  ) {
    const data = await this.communityService.updateComment(
      this.actor(user),
      commentId,
      dto,
    );
    return { message: 'Đã cập nhật', data };
  }

  @Delete('comments/:commentId')
  async deleteComment(
    @CurrentUser() user: ReqUser,
    @Param('commentId') commentId: string,
  ) {
    const data = await this.communityService.deleteComment(
      this.actor(user),
      commentId,
    );
    return { message: 'OK', data };
  }

  @Post('comments/:commentId/react')
  async reactComment(
    @CurrentUser() user: ReqUser,
    @Param('commentId') commentId: string,
    @Body() dto: CommunityReactDto,
  ) {
    const data = await this.communityService.setCommentReaction(
      this.actor(user),
      commentId,
      dto.kind,
    );
    return { message: 'OK', data };
  }

  @Delete('comments/:commentId/react')
  async unreactComment(
    @CurrentUser() user: ReqUser,
    @Param('commentId') commentId: string,
  ) {
    const data = await this.communityService.removeCommentReaction(
      this.actor(user),
      commentId,
    );
    return { message: 'OK', data };
  }

  @Post('posts/:postId/best-answer')
  async bestAnswer(
    @CurrentUser() user: ReqUser,
    @Param('postId') postId: string,
    @Body() body: CommentIdBodyDto,
  ) {
    const data = await this.communityService.setBestAnswer(
      this.actor(user),
      postId,
      body.commentId,
    );
    return { message: 'OK', data };
  }

  @Post('posts/:postId/pin-comment')
  async pinComment(
    @CurrentUser() user: ReqUser,
    @Param('postId') postId: string,
    @Body() body: CommentIdBodyDto,
  ) {
    const data = await this.communityService.pinComment(
      this.actor(user),
      postId,
      body.commentId,
    );
    return { message: 'OK', data };
  }

  @Delete('posts/:postId/pin-comment')
  async unpinComment(
    @CurrentUser() user: ReqUser,
    @Param('postId') postId: string,
  ) {
    const data = await this.communityService.unpinComment(
      this.actor(user),
      postId,
    );
    return { message: 'OK', data };
  }

  @RateLimit({ points: 15, duration: 300 })
  @Post('reports')
  async report(
    @CurrentUser() user: ReqUser,
    @Body() dto: CreateCommunityReportDto,
  ) {
    const data = await this.communityService.createReport(this.actor(user), dto);
    return { message: 'Đã gửi báo cáo', data };
  }

  @Post('follows')
  async follow(@CurrentUser() user: ReqUser, @Body() dto: CommunityFollowDto) {
    const data = await this.communityService.follow(
      this.actor(user),
      dto.targetType,
      dto.targetId,
    );
    return { message: 'OK', data };
  }

  @Delete('follows/:targetType/:targetId')
  async unfollow(
    @CurrentUser() user: ReqUser,
    @Param('targetType') targetType: CommunityFollowTarget,
    @Param('targetId') targetId: string,
  ) {
    const data = await this.communityService.unfollow(
      this.actor(user),
      targetType,
      targetId,
    );
    return { message: 'OK', data };
  }

  @Get('me/following')
  async following(@CurrentUser() user: ReqUser) {
    const data = await this.communityService.listFollowing(this.actor(user));
    return { message: 'OK', data };
  }

  @Post('blocks/:userId')
  async block(
    @CurrentUser() user: ReqUser,
    @Param('userId') blockedUserId: string,
  ) {
    const data = await this.communityService.blockUser(
      this.actor(user),
      blockedUserId,
    );
    return { message: 'OK', data };
  }

  @Delete('blocks/:userId')
  async unblock(
    @CurrentUser() user: ReqUser,
    @Param('userId') blockedUserId: string,
  ) {
    const data = await this.communityService.unblockUser(
      this.actor(user),
      blockedUserId,
    );
    return { message: 'OK', data };
  }
}
