"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CommunityPostPage;
const CommunityPostScreen_1 = require("@/features/community/screens/CommunityPostScreen");
async function CommunityPostPage({ params }) {
    const { postId } = await params;
    return <CommunityPostScreen_1.CommunityPostScreen postId={postId}/>;
}
//# sourceMappingURL=page.js.map