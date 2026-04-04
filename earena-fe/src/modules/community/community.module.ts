import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { User, UserSchema } from '../users/schemas/user.schema';
import { UsersModule } from '../users/users.module';
import { CoursesModule } from '../courses/courses.module';
import { ExamsModule } from '../exams/exams.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { TaxonomyModule } from '../taxonomy/taxonomy.module';
import { MediaModule } from '../media/media.module';

import { CommunityPost, CommunityPostSchema } from './schemas/community-post.schema';
import { CommunityComment, CommunityCommentSchema } from './schemas/community-comment.schema';
import { CommunityReaction, CommunityReactionSchema } from './schemas/community-reaction.schema';
import { CommunitySavedPost, CommunitySavedPostSchema } from './schemas/community-saved-post.schema';
import { CommunityReport, CommunityReportSchema } from './schemas/community-report.schema';
import { CommunityFollow, CommunityFollowSchema } from './schemas/community-follow.schema';
import { CommunityBlock, CommunityBlockSchema } from './schemas/community-block.schema';
import {
  CommunityUserProfile,
  CommunityUserProfileSchema,
} from './schemas/community-user-profile.schema';
import {
  CommunityModerationAudit,
  CommunityModerationAuditSchema,
} from './schemas/community-moderation-audit.schema';

import { CommunityService } from './community.service';
import { CommunityController } from './community.controller';
import { CommunityAdminController } from './community-admin.controller';
import { CommunityDigestProcessor } from './processors/community-digest.processor';
import { CommunityJobsRegistrar } from './community-jobs.registrar';
import { COMMUNITY_QUEUE } from './constants/community.constants';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: CommunityPost.name, schema: CommunityPostSchema },
      { name: CommunityComment.name, schema: CommunityCommentSchema },
      { name: CommunityReaction.name, schema: CommunityReactionSchema },
      { name: CommunitySavedPost.name, schema: CommunitySavedPostSchema },
      { name: CommunityReport.name, schema: CommunityReportSchema },
      { name: CommunityFollow.name, schema: CommunityFollowSchema },
      { name: CommunityBlock.name, schema: CommunityBlockSchema },
      { name: CommunityUserProfile.name, schema: CommunityUserProfileSchema },
      { name: CommunityModerationAudit.name, schema: CommunityModerationAuditSchema },
    ]),
    BullModule.registerQueue({ name: COMMUNITY_QUEUE }),
    forwardRef(() => CoursesModule),
    forwardRef(() => ExamsModule),
    NotificationsModule,
    UsersModule,
    TaxonomyModule,
    MediaModule,
  ],
  controllers: [CommunityController, CommunityAdminController],
  providers: [
    CommunityService,
    CommunityDigestProcessor,
    CommunityJobsRegistrar,
  ],
  exports: [CommunityService],
})
export class CommunityModule {}
