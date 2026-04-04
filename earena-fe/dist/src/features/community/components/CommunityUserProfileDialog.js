'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunityUserProfileDialog = CommunityUserProfileDialog;
const react_query_1 = require("@tanstack/react-query");
const link_1 = __importDefault(require("next/link"));
const dialog_1 = require("@/shared/components/ui/dialog");
const button_1 = require("@/shared/components/ui/button");
const lucide_react_1 = require("lucide-react");
const auth_store_1 = require("@/features/auth/stores/auth.store");
const routes_1 = require("@/config/routes");
const sonner_1 = require("sonner");
const community_api_1 = require("../api/community-api");
const community_badge_labels_1 = require("../lib/community-badge-labels");
const direct_message_policy_1 = require("@/features/messaging/lib/direct-message-policy");
const CommunityFloatingChatShell_1 = require("./CommunityFloatingChatShell");
function CommunityUserProfileDialog({ open, onOpenChange, userId, displayNameHint, }) {
    const qc = (0, react_query_1.useQueryClient)();
    const me = (0, auth_store_1.useAuthStore)((s) => s.user);
    const isAuthenticated = (0, auth_store_1.useAuthStore)((s) => s.isAuthenticated);
    const floatingChat = (0, CommunityFloatingChatShell_1.useCommunityFloatingChatOptional)();
    const q = (0, react_query_1.useQuery)({
        queryKey: ['community-profile', userId],
        queryFn: () => (0, community_api_1.getCommunityProfile)(userId),
        enabled: open && !!userId,
    });
    const data = q.data;
    const fullProfileHref = userId ? routes_1.ROUTES.PUBLIC.COMMUNITY_PROFILE(userId) : null;
    const toggleFollow = async () => {
        if (!userId || !data?.user)
            return;
        try {
            if (data.following) {
                await (0, community_api_1.unfollowCommunity)('USER', userId);
                sonner_1.toast.success('Đã bỏ theo dõi');
            }
            else {
                await (0, community_api_1.followCommunity)('USER', userId);
                sonner_1.toast.success('Đã theo dõi');
            }
            await qc.invalidateQueries({ queryKey: ['community-profile', userId] });
            q.refetch();
        }
        catch {
            sonner_1.toast.error('Thao tác thất bại');
        }
    };
    const peerRole = data?.user?.role;
    const dmHref = isAuthenticated &&
        me?.id &&
        userId &&
        me.id !== userId &&
        me.role &&
        peerRole &&
        (0, direct_message_policy_1.canDirectMessage)(me.role, peerRole)
        ? (0, direct_message_policy_1.messagesInboxUrlForPeer)(me.role, userId)
        : null;
    const loginReturnHref = routes_1.ROUTES.AUTH.LOGIN +
        '?callbackUrl=' +
        encodeURIComponent(fullProfileHref || routes_1.ROUTES.PUBLIC.COMMUNITY);
    const showName = data?.user?.fullName || displayNameHint || 'Thành viên';
    return (<dialog_1.Dialog open={open} onOpenChange={onOpenChange}>
      <dialog_1.DialogContent className="sm:max-w-md">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle className="flex items-center gap-3 pr-8">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
              {showName.charAt(0) || '?'}
            </span>
            <span className="text-left leading-tight">{showName}</span>
          </dialog_1.DialogTitle>
          <dialog_1.DialogDescription className="text-left space-y-1 pt-1">
            {q.isLoading ? (<span className="flex items-center gap-2 text-muted-foreground text-sm">
                <lucide_react_1.Loader2 className="h-4 w-4 animate-spin shrink-0"/>
                Đang tải hồ sơ…
              </span>) : data?.user ? (<>
                {peerRole ? (<span className="block text-sm text-muted-foreground">
                    {(0, direct_message_policy_1.peerRoleLabel)(peerRole)}
                  </span>) : null}
                <span className="block text-sm text-muted-foreground">
                  Uy tín: {data.community?.reputation ?? 0} · Huy hiệu:{' '}
                  {(0, community_badge_labels_1.formatCommunityBadges)(data.community?.badges)}
                </span>
              </>) : q.isError ? (<span className="text-sm text-destructive">Không tải được hồ sơ.</span>) : null}
          </dialog_1.DialogDescription>
        </dialog_1.DialogHeader>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {fullProfileHref ? (<button_1.Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
              <link_1.default href={fullProfileHref} onClick={() => onOpenChange(false)}>
                <lucide_react_1.ExternalLink className="mr-2 h-4 w-4"/>
                Trang hồ sơ đầy đủ
              </link_1.default>
            </button_1.Button>) : null}
          {isAuthenticated && me?.id && userId && me.id !== userId && !q.isLoading && data?.user ? (<>
              <button_1.Button variant={data.following ? 'outline' : 'default'} size="sm" className="w-full sm:w-auto" onClick={toggleFollow}>
                {data.following ? 'Đang theo dõi' : 'Theo dõi'}
              </button_1.Button>
              {dmHref && userId ? (floatingChat ? (<button_1.Button variant="secondary" size="sm" className="w-full sm:w-auto" onClick={() => {
                    floatingChat.openWithPeer(userId, showName);
                    onOpenChange(false);
                }}>
                    <lucide_react_1.MessageCircle className="mr-2 h-4 w-4"/>
                    Trò chuyện riêng
                  </button_1.Button>) : (<button_1.Button variant="secondary" size="sm" className="w-full sm:w-auto" asChild>
                    <link_1.default href={dmHref} onClick={() => onOpenChange(false)}>
                      <lucide_react_1.MessageCircle className="mr-2 h-4 w-4"/>
                      Trò chuyện riêng
                    </link_1.default>
                  </button_1.Button>)) : null}
            </>) : null}
          {!isAuthenticated && userId ? (<p className="text-sm text-muted-foreground w-full">
              <link_1.default href={loginReturnHref} className="text-primary font-medium hover:underline">
                Đăng nhập
              </link_1.default>{' '}
              để theo dõi và nhắn tin.
            </p>) : null}
        </div>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>);
}
//# sourceMappingURL=CommunityUserProfileDialog.js.map