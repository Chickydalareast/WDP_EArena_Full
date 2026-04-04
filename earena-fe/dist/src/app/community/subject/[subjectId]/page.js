"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CommunitySubjectPage;
const CommunityFeedScreen_1 = require("@/features/community/screens/CommunityFeedScreen");
async function CommunitySubjectPage({ params }) {
    const { subjectId } = await params;
    return <CommunityFeedScreen_1.CommunityFeedScreen lockedSubjectId={subjectId}/>;
}
//# sourceMappingURL=page.js.map