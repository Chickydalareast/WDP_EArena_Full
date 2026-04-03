import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { BypassTransform } from '../../common/decorators/bypass-transform.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Sse('stream')
  @BypassTransform()
  streamNotifications(
    @CurrentUser('userId') userId: string,
  ): Observable<MessageEvent> {
    return this.notificationsService.subscribeToNotifications(userId).pipe(
      map(
        (event) =>
          ({
            id: event.id,
            type: event.type || 'message',
            retry: event.retry,
            data: event.data,
          }) as MessageEvent,
      ),
      finalize(() => {
        this.notificationsService.removeConnection(userId);
      }),
    );
  }

  @Get()
  async getMyNotifications(
    @CurrentUser('userId') userId: string,
    @Query() query: PaginationDto,
  ) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    return this.notificationsService.getUserNotifications(userId, page, limit);
  }

  @Patch('read-all')
  async markAllAsRead(@CurrentUser('userId') userId: string) {
    await this.notificationsService.markAllAsRead(userId);
    return { message: 'Đã đánh dấu toàn bộ là đã đọc' };
  }

  @Patch(':id/read')
  async markAsRead(
    @CurrentUser('userId') userId: string,
    @Param('id') notificationId: string,
  ) {
    await this.notificationsService.markAsRead(userId, notificationId);
    return { message: 'Đã đánh dấu đọc' };
  }
}
