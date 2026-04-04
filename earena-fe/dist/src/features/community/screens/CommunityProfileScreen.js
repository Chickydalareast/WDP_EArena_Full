'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunityProfileScreen = CommunityProfileScreen;
const react_query_1 = require("@tanstack/react-query");
const link_1 = __importDefault(require("next/link"));
const routes_1 = require("@/config/routes");
const community_api_1 = require("../api/community-api");
const community_badge_labels_1 = require("../lib/community-badge-labels");
const button_1 = require("@/shared/components/ui/button");
const card_1 = require("@/shared/components/ui/card");
const lucide_react_1 = require("lucide-react");
const auth_store_1 = require("@/features/auth/stores/auth.store");
const sonner_1 = require("sonner");
const direct_message_policy_1 = require("@/features/messaging/lib/direct-message-policy");
const CommunityFloatingChatShell_1 = require("../components/CommunityFloatingChatShell");
function CommunityProfileScreen({ userId }) {
    const me = (0, auth_store_1.useAuthStore)((s) => s.user);
    const isAuthenticated = (0, auth_store_1.useAuthStore)((s) => s.isAuthenticated);
    const floatingChat = (0, CommunityFloatingChatShell_1.useCommunityFloatingChatOptional)();
    const q = (0, react_query_1.useQuery)({
        queryKey: ['community-profile', userId],
        queryFn: () => (0, community_api_1.getCommunityProfile)(userId),
    });
    const data = q.data;
    if (q.isLoading || !data?.user) {
        return (<div className="flex justify-center py-24">
        <lucide_react_1.Loader2 className="w-8 h-8 animate-spin text-primary"/>
      </div>);
    }
    const toggleFollow = async () => {
        try {
            if (data.following) {
                await (0, community_api_1.unfollowCommunity)('USER', userId);
                sonner_1.toast.success('Đã bỏ theo dõi');
            }
            else {
                await (0, community_api_1.followCommunity)('USER', userId);
                sonner_1.toast.success('Đã theo dõi');
            }
            q.refetch();
        }
        catch {
            sonner_1.toast.error('Thao tác thất bại');
        }
    };
    const peerRole = data.user.role;
    const dmHref = isAuthenticated &&
        me?.id &&
        me.id !== userId &&
        me.role &&
        peerRole &&
        (0, direct_message_policy_1.canDirectMessage)(me.role, peerRole)
        ? (0, direct_message_policy_1.messagesInboxUrlForPeer)(me.role, userId)
        : null;
    const loginReturnHref = routes_1.ROUTES.AUTH.LOGIN +
        '?callbackUrl=' +
        encodeURIComponent(routes_1.ROUTES.PUBLIC.COMMUNITY_PROFILE(userId));
    return (<div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <card_1.Card className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{data.user.fullName}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Uy tín: {data.community?.reputation ?? 0} · Huy hiệu:{' '}
            {(0, community_badge_labels_1.formatCommunityBadges)(data.community?.badges)}
          </p>
        </div>
        {isAuthenticated && me?.id && me.id !== userId ? (<div className="flex flex-wrap gap-2 justify-start sm:justify-end">
            <button_1.Button variant={data.following ? 'outline' : 'default'} onClick={toggleFollow}>
              {data.following ? 'Đang theo dõi' : 'Theo dõi'}
            </button_1.Button>
            {dmHref ? (floatingChat ? (<button_1.Button variant="secondary" onClick={() => floatingChat.openWithPeer(userId, data.user?.fullName || undefined)}>
                  <lucide_react_1.MessageCircle className="w-4 h-4 mr-2"/>
                  Trò chuyện riêng
                </button_1.Button>) : (<button_1.Button variant="secondary" asChild>
                  <link_1.default href={dmHref}>
                    <lucide_react_1.MessageCircle className="w-4 h-4 mr-2"/>
                    Trò chuyện riêng
                  </link_1.default>
                </button_1.Button>)) : null}
          </div>) : !isAuthenticated ? (<p className="text-sm text-muted-foreground text-left sm:text-right sm:max-w-xs sm:ml-auto leading-relaxed">
            <link_1.default href={loginReturnHref} className="text-primary font-medium hover:underline">
              Đăng nhập
            </link_1.default>{' '}
            để theo dõi và nhắn tin riêng.
          </p>) : null}
      </card_1.Card>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Bài đã đăng</h2>
        {(data.posts || []).map((p) => (<card_1.Card key={p.id} className="p-3">
            <link_1.default href={routes_1.ROUTES.PUBLIC.COMMUNITY_POST(p.id)} className="text-sm text-primary hover:underline line-clamp-2">
              {p.bodyPlain}
            </link_1.default>
          </card_1.Card>))}
      </section>
    </div>);
}
//# sourceMappingURL=CommunityProfileScreen.js.map