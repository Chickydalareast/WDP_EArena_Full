"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = CourseCurriculumPage;
const CurriculumManager_1 = require("@/features/courses/components/CurriculumManager");
exports.metadata = {
    title: "Giáo án & Cấu trúc | EArena Teacher",
};
async function CourseCurriculumPage({ params, }) {
    const resolvedParams = await params;
    const courseId = resolvedParams.courseId;
    return (<div className="w-full h-full max-w-[1400px] mx-auto">
            <CurriculumManager_1.CurriculumManager courseId={courseId}/>
        </div>);
}
//# sourceMappingURL=page.js.map