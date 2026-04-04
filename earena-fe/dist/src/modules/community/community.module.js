"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunityModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const bullmq_1 = require("@nestjs/bullmq");
const user_schema_1 = require("../users/schemas/user.schema");
const users_module_1 = require("../users/users.module");
const courses_module_1 = require("../courses/courses.module");
const exams_module_1 = require("../exams/exams.module");
const notifications_module_1 = require("../notifications/notifications.module");
const taxonomy_module_1 = require("../taxonomy/taxonomy.module");
const media_module_1 = require("../media/media.module");
const community_post_schema_1 = require("./schemas/community-post.schema");
const community_comment_schema_1 = require("./schemas/community-comment.schema");
const community_reaction_schema_1 = require("./schemas/community-reaction.schema");
const community_saved_post_schema_1 = require("./schemas/community-saved-post.schema");
const community_report_schema_1 = require("./schemas/community-report.schema");
const community_follow_schema_1 = require("./schemas/community-follow.schema");
const community_block_schema_1 = require("./schemas/community-block.schema");
const community_user_profile_schema_1 = require("./schemas/community-user-profile.schema");
const community_moderation_audit_schema_1 = require("./schemas/community-moderation-audit.schema");
const community_service_1 = require("./community.service");
const community_controller_1 = require("./community.controller");
const community_admin_controller_1 = require("./community-admin.controller");
const community_digest_processor_1 = require("./processors/community-digest.processor");
const community_jobs_registrar_1 = require("./community-jobs.registrar");
const community_constants_1 = require("./constants/community.constants");
let CommunityModule = class CommunityModule {
};
exports.CommunityModule = CommunityModule;
exports.CommunityModule = CommunityModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: community_post_schema_1.CommunityPost.name, schema: community_post_schema_1.CommunityPostSchema },
                { name: community_comment_schema_1.CommunityComment.name, schema: community_comment_schema_1.CommunityCommentSchema },
                { name: community_reaction_schema_1.CommunityReaction.name, schema: community_reaction_schema_1.CommunityReactionSchema },
                { name: community_saved_post_schema_1.CommunitySavedPost.name, schema: community_saved_post_schema_1.CommunitySavedPostSchema },
                { name: community_report_schema_1.CommunityReport.name, schema: community_report_schema_1.CommunityReportSchema },
                { name: community_follow_schema_1.CommunityFollow.name, schema: community_follow_schema_1.CommunityFollowSchema },
                { name: community_block_schema_1.CommunityBlock.name, schema: community_block_schema_1.CommunityBlockSchema },
                { name: community_user_profile_schema_1.CommunityUserProfile.name, schema: community_user_profile_schema_1.CommunityUserProfileSchema },
                { name: community_moderation_audit_schema_1.CommunityModerationAudit.name, schema: community_moderation_audit_schema_1.CommunityModerationAuditSchema },
            ]),
            bullmq_1.BullModule.registerQueue({ name: community_constants_1.COMMUNITY_QUEUE }),
            (0, common_1.forwardRef)(() => courses_module_1.CoursesModule),
            (0, common_1.forwardRef)(() => exams_module_1.ExamsModule),
            notifications_module_1.NotificationsModule,
            users_module_1.UsersModule,
            taxonomy_module_1.TaxonomyModule,
            media_module_1.MediaModule,
        ],
        controllers: [community_controller_1.CommunityController, community_admin_controller_1.CommunityAdminController],
        providers: [
            community_service_1.CommunityService,
            community_digest_processor_1.CommunityDigestProcessor,
            community_jobs_registrar_1.CommunityJobsRegistrar,
        ],
        exports: [community_service_1.CommunityService],
    })
], CommunityModule);
//# sourceMappingURL=community.module.js.map