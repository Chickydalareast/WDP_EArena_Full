"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = CourseSettingsPage;
const CourseSettingsForm_1 = require("@/features/courses/components/CourseSettingsForm");
exports.metadata = {
    title: "Cài đặt khóa học | EArena Teacher",
    description: "Cập nhật thông tin, giá bán và ảnh bìa khóa học.",
};
async function CourseSettingsPage({ params }) {
    const resolvedParams = await params;
    const courseId = resolvedParams.courseId;
    if (!courseId) {
        return <div className="p-8 text-center text-red-500">Mã khóa học không hợp lệ.</div>;
    }
    return (<div className="w-full max-w-[800px] mx-auto p-4 md:p-8 animate-in fade-in duration-300">
      <div className="flex items-center gap-4 mb-8 border-b border-border pb-4">
        
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            Cài đặt chung
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý thông tin hiển thị, giá bán và các yêu cầu của khóa học.
          </p>
        </div>
      </div>

      <CourseSettingsForm_1.CourseSettingsForm courseId={courseId}/>
    </div>);
}
//# sourceMappingURL=page.js.map