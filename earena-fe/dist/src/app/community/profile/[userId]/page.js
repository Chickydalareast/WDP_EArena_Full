"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CommunityProfilePage;
const CommunityProfileScreen_1 = require("@/features/community/screens/CommunityProfileScreen");
async function CommunityProfilePage({ params }) {
    const { userId } = await params;
    return <CommunityProfileScreen_1.CommunityProfileScreen userId={userId}/>;
}
//# sourceMappingURL=page.js.map