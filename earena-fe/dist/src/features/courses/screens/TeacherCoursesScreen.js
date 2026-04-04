'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeacherCoursesScreen = TeacherCoursesScreen;
const react_1 = require("react");
const useTeacherCourses_1 = require("../hooks/useTeacherCourses");
const TeacherCourseCard_1 = require("../components/TeacherCourseCard");
const CreateCourseModal_1 = require("../components/CreateCourseModal");
const button_1 = require("@/shared/components/ui/button");
const lucide_react_1 = require("lucide-react");
function TeacherCoursesScreen() {
    const { data: courses, isLoading, isError } = (0, useTeacherCourses_1.useTeacherCourses)();
    const [isModalOpen, setIsModalOpen] = (0, react_1.useState)(false);
    const courseList = courses ?? [];
    return (<div className="flex flex-col h-full animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground flex items-center gap-3">
            <lucide_react_1.GraduationCap className="text-primary w-8 h-8"/>
            Khóa học của tôi
          </h1>
          <p className="text-muted-foreground mt-1">Quản lý và thiết kế các khóa học trực tuyến của bạn.</p>
        </div>
        
        <button_1.Button onClick={() => setIsModalOpen(true)} className="rounded-full shadow-md font-bold px-6">
          <lucide_react_1.Plus className="mr-2 w-5 h-5"/> Tạo Khóa Học
        </button_1.Button>
      </div>

      {isLoading ? (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <TeacherCourseCard_1.TeacherCourseCardSkeleton key={i}/>)}
        </div>) : isError ? (<div className="flex flex-col items-center justify-center py-20 bg-red-50/50 rounded-xl border border-red-100">
          <lucide_react_1.AlertCircle className="w-10 h-10 mb-2 text-red-500"/>
          <p className="text-red-600 font-medium">Không thể tải dữ liệu khóa học. Vui lòng thử lại.</p>
        </div>) : courseList.length === 0 ? (<div className="flex flex-col items-center justify-center py-24 bg-muted/20 rounded-xl border border-dashed border-border">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <lucide_react_1.BookOpen className="w-8 h-8 text-muted-foreground"/>
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">Chưa có khóa học nào</h3>
          <p className="text-muted-foreground mb-6 max-w-sm text-center">
            Bạn chưa tạo khóa học nào trên nền tảng. Hãy bắt đầu bằng cách tạo khóa học đầu tiên của mình.
          </p>
          <button_1.Button onClick={() => setIsModalOpen(true)} variant="outline">
            Tạo khóa học ngay
          </button_1.Button>
        </div>) : (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courseList.map((course, index) => (<TeacherCourseCard_1.TeacherCourseCard key={course.id || `course-fallback-${index}`} course={course}/>))}
        </div>)}

      <CreateCourseModal_1.CreateCourseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}/>
    </div>);
}
//# sourceMappingURL=TeacherCoursesScreen.js.map