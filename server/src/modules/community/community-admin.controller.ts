import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from 'src/common/enums/user-role.enum';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CommunityService } from './community.service';
import {
  ResolveCommunityReportDto,
  SetUserCommunityStatusDto,
} from './dto/community-admin.dto';
import { FeaturePostBodyDto, LockCommentsBodyDto } from './dto/community-id-body.dto';
import { CommunityReportStatus } from './constants/community.constants';

@Controller('community/admin')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class CommunityAdminController {
  constructor(private readonly communityService: CommunityService) {}

  @Patch('posts/:postId/hide')
  async hidePost(
    @CurrentUser('userId') actorId: string,
    @Param('postId') postId: string,
  ) {
    const data = await this.communityService.adminHidePost(actorId, postId);
    return { message: 'OK', data };
  }

  @Patch('posts/:postId/show')
  async showPost(
    @CurrentUser('userId') actorId: string,
    @Param('postId') postId: string,
  ) {
    const data = await this.communityService.adminShowPost(actorId, postId);
    return { message: 'OK', data };
  }

  @Post('posts/:postId/feature')
  async feature(
    @CurrentUser('userId') actorId: string,
    @Param('postId') postId: string,
    @Body() body: FeaturePostBodyDto,
  ) {
    const data = await this.communityService.adminFeaturePost(
      actorId,
      postId,
      body.featured,
    );
    return { message: 'OK', data };
  }

  @Post('posts/:postId/lock-comments')
  async lockComments(
    @CurrentUser('userId') actorId: string,
    @Param('postId') postId: string,
    @Body() body: LockCommentsBodyDto,
  ) {
    const data = await this.communityService.adminLockComments(
      actorId,
      postId,
      body.locked,
    );
    return { message: 'OK', data };
  }

  @Get('reports')
  async reports(
    @Query('status') status?: CommunityReportStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const data = await this.communityService.adminListReports(
      status,
      page || 1,
      limit || 20,
    );
    return { message: 'OK', data };
  }

  @Patch('reports/:reportId')
  async resolveReport(
    @CurrentUser('userId') actorId: string,
    @Param('reportId') reportId: string,
    @Body() dto: ResolveCommunityReportDto,
  ) {
    const data = await this.communityService.adminResolveReport(
      actorId,
      reportId,
      dto.status,
      dto.resolutionNote,
    );
    return { message: 'OK', data };
  }

  @Patch('users/:userId/community-status')
  async userStatus(
    @CurrentUser('userId') actorId: string,
    @Param('userId') userId: string,
    @Body() dto: SetUserCommunityStatusDto,
  ) {
    const data = await this.communityService.adminSetUserCommunityStatus(
      actorId,
      userId,
      dto,
    );
    return { message: 'OK', data };
  }

  @Get('audit')
  async audit(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const data = await this.communityService.adminAuditLog(page || 1, limit || 50);
    return { message: 'OK', data };
  }
}
