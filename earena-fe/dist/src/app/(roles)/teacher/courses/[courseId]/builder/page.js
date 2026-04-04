"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = CourseBuilderPage;
const BuilderBoard_1 = require("@/features/courses/components/CurriculumBuilder/BuilderBoard");
const BuilderHeaderActions_1 = require("@/features/courses/components/CurriculumBuilder/BuilderHeaderActions");
const lucide_react_1 = require("lucide-react");
const link_1 = __importDefault(require("next/link"));
const routes_1 = require("@/config/routes");
const button_1 = require("@/shared/components/ui/button");
exports.metadata = {
    title: "Soạn giáo án | EArena Teacher",
};
async function CourseBuilderPage({ params }) {
    const resolvedParams = await params;
    const courseId = resolvedParams.courseId;
    if (!courseId) {
        return <div className="p-8 text-center text-red-500">Mã khóa học không hợp lệ.</div>;
    }
    return (<div className="w-full max-w-[1200px] mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-border pb-4 gap-4">
        <div className="flex items-center gap-4">
          <link_1.default href={routes_1.ROUTES.TEACHER.COURSES}>
            <button_1.Button variant="outline" size="icon" className="h-9 w-9 rounded-full">
              <lucide_react_1.ArrowLeft className="h-4 w-4"/>
            </button_1.Button>
          </link_1.default>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Curriculum Builder</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Soạn thảo và sắp xếp bài giảng. Hệ thống tự động lưu vị trí kéo thả.
            </p>
          </div>
        </div>

        <BuilderHeaderActions_1.BuilderHeaderActions courseId={courseId}/>
      </div>

      <BuilderBoard_1.BuilderBoard courseId={courseId}/>
    </div>);
}
//# sourceMappingURL=page.js.map