import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { SyncHeartbeatDto } from '../dto/learning-tracking.dto';
import { LearningTrackingService } from '../services/learning-tracking.service';
import { SyncHeartbeatPayload } from '../interfaces/learning-tracking.interface';

@Controller('learning')
@UseGuards(JwtAuthGuard)
export class LearningTrackingController {
  constructor(private readonly trackingService: LearningTrackingService) {}

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
}
