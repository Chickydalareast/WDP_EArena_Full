import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { MessagingService } from './messaging.service';
import { OpenThreadDto, SendChatMessageDto } from './dto/send-chat-message.dto';

@Controller('messaging')
@UseGuards(JwtAuthGuard)
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Get('threads')
  listThreads(@CurrentUser('userId') userId: string) {
    return this.messagingService.listThreads(userId);
  }

  @Get('threads/unread-count')
  unreadCount(@CurrentUser('userId') userId: string) {
    return this.messagingService.countUnreadThreads(userId);
  }

  @Get('shareable-courses')
  shareableCourses(@CurrentUser('userId') userId: string) {
    return this.messagingService.listShareableCourses(userId);
  }

  @Post('threads/open')
  openThread(
    @CurrentUser('userId') userId: string,
    @Body() dto: OpenThreadDto,
  ) {
    return this.messagingService.openOrGetThread(userId, dto.peerUserId);
  }

  @Post('threads/:threadId/read')
  markRead(
    @CurrentUser('userId') userId: string,
    @Param('threadId') threadId: string,
  ) {
    return this.messagingService.markThreadRead(threadId, userId);
  }

  @Get('threads/:threadId/messages')
  listMessages(
    @CurrentUser('userId') userId: string,
    @Param('threadId') threadId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.messagingService.listMessages(
      threadId,
      userId,
      Math.max(1, Number(page) || 1),
      Math.min(100, Math.max(1, Number(limit) || 40)),
    );
  }

  @Post('threads/:threadId/messages')
  sendMessage(
    @CurrentUser('userId') userId: string,
    @Param('threadId') threadId: string,
    @Body() dto: SendChatMessageDto,
  ) {
    return this.messagingService.sendMessage(threadId, userId, dto);
  }
}
