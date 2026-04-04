"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = StudyPage;
const StudyRoomScreen_1 = require("@/features/courses/screens/StudyRoomScreen");
exports.metadata = {
    title: "Phòng học | EArena",
    description: "Không gian học tập tập trung.",
};
async function StudyPage({ params }) {
    const resolvedParams = await params;
    return (<div className="w-full min-h-screen bg-background text-foreground">
      <StudyRoomScreen_1.StudyRoomScreen courseId={resolvedParams.courseId}/>
    </div>);
}
//# sourceMappingURL=page.js.map