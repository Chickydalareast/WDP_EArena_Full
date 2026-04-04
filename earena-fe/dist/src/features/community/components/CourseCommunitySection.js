'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseCommunitySection = CourseCommunitySection;
const react_query_1 = require("@tanstack/react-query");
const link_1 = __importDefault(require("next/link"));
const routes_1 = require("@/config/routes");
const community_api_1 = require("../api/community-api");
const card_1 = require("@/shared/components/ui/card");
const lucide_react_1 = require("lucide-react");
function CourseCommunitySection({ courseId }) {
    const q = (0, react_query_1.useQuery)({
        queryKey: ['community-course-posts', courseId],
        queryFn: () => (0, community_api_1.getCommunityPostsByCourse)(courseId, { limit: 8 }),
    });
    const items = q.data?.items || [];
    return (<div className="space-y-4 pt-8 border-t border-border">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Thảo luận cộng đồng</h2>
        <link_1.default href={routes_1.ROUTES.PUBLIC.COMMUNITY} className="text-sm font-semibold text-primary hover:underline">
          Xem tất cả
        </link_1.default>
      </div>
      {q.isLoading ? (<div className="flex justify-center py-8">
          <lucide_react_1.Loader2 className="w-6 h-6 animate-spin text-muted-foreground"/>
        </div>) : !items.length ? (<p className="text-muted-foreground text-sm">
          Chưa có bài đăng nào về khóa học này. Hãy chia sẻ đầu tiên!
        </p>) : (<div className="grid gap-2">
          {items.map((p) => (<card_1.Card key={p.id} className="p-3">
              <link_1.default href={routes_1.ROUTES.PUBLIC.COMMUNITY_POST(p.id)} className="text-sm font-medium text-primary hover:underline line-clamp-2">
                {p.bodyPlain || 'Bài viết'}
              </link_1.default>
            </card_1.Card>))}
        </div>)}
    </div>);
}
//# sourceMappingURL=CourseCommunitySection.js.map