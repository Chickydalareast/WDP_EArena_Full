'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurriculumManager = CurriculumManager;
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const useCurriculumBuilder_1 = require("../hooks/useCurriculumBuilder");
const course_schema_1 = require("../types/course.schema");
const BuilderBoard_1 = require("./CurriculumBuilder/BuilderBoard");
const StudySidebar_1 = require("./StudySidebar");
const TeacherLessonViewer_1 = require("./TeacherLessonViewer");
const skeleton_1 = require("@/shared/components/ui/skeleton");
const button_1 = require("@/shared/components/ui/button");
const lucide_react_1 = require("lucide-react");
function CurriculumManager({ courseId }) {
    const searchParams = (0, navigation_1.useSearchParams)();
    const router = (0, navigation_1.useRouter)();
    const pathname = (0, navigation_1.usePathname)();
    const lessonIdParam = searchParams.get('lessonId');
    const [isEditMode, setIsEditMode] = (0, react_1.useState)(false);
    const { data: courseData, isLoading } = (0, useCurriculumBuilder_1.useTeacherCurriculumView)(courseId);
    const isStatusLocked = courseData?.status === course_schema_1.CourseStatus.PENDING_REVIEW;
    (0, react_1.useEffect)(() => {
        if (!isEditMode && courseData?.curriculum?.sections) {
            if (!lessonIdParam && courseData.curriculum.sections.length > 0) {
                const firstSection = courseData.curriculum.sections[0];
                if (firstSection.lessons && firstSection.lessons.length > 0) {
                    router.replace(`${pathname}?lessonId=${firstSection.lessons[0].id}`, { scroll: false });
                }
            }
        }
    }, [isEditMode, courseData, lessonIdParam, pathname, router]);
    if (isLoading) {
        return (<div className="space-y-6">
                <skeleton_1.Skeleton className="h-16 w-full rounded-xl"/>
                <div className="flex gap-6">
                    <skeleton_1.Skeleton className="w-80 h-[600px] rounded-xl hidden lg:block"/>
                    <skeleton_1.Skeleton className="flex-1 h-[600px] rounded-xl"/>
                </div>
            </div>);
    }
    if (!courseData)
        return null;
    const sections = courseData.curriculum?.sections || [];
    const activeLesson = sections.flatMap(s => s.lessons).find(l => l.id === lessonIdParam);
    return (<div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500">

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
                <div>
                    <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                        <lucide_react_1.BookOpen className="w-6 h-6 text-primary"/>
                        Giáo án Khóa học
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        {isEditMode
            ? "Kéo thả, thêm mới hoặc xóa bài học trong cấu trúc."
            : "Trải nghiệm khóa học dưới góc nhìn của Học viên."}
                    </p>
                </div>

                <div className="flex items-center bg-muted/50 p-1.5 rounded-lg border border-border">
                    <button_1.Button variant={!isEditMode ? 'default' : 'ghost'} size="sm" onClick={() => setIsEditMode(false)} className="rounded-md font-semibold transition-all">
                        <lucide_react_1.Eye className="w-4 h-4 mr-2"/> Xem trước
                    </button_1.Button>
                    <button_1.Button variant={isEditMode ? 'default' : 'ghost'} size="sm" onClick={() => setIsEditMode(true)} disabled={isStatusLocked} className="rounded-md font-semibold transition-all" title={isStatusLocked ? "Không thể chỉnh sửa khi đang chờ duyệt" : ""}>
                        <lucide_react_1.Edit3 className="w-4 h-4 mr-2"/> Chỉnh sửa
                    </button_1.Button>
                </div>
            </div>

            {isStatusLocked && (<div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-xl flex items-start gap-3 text-yellow-700">
                    <lucide_react_1.AlertCircle className="w-5 h-5 shrink-0 mt-0.5"/>
                    <div>
                        <h4 className="font-bold text-sm">Chế độ Chỉnh sửa đã bị khóa</h4>
                        <p className="text-xs mt-1">Hệ thống đang thẩm định khóa học này. Bạn chỉ có thể Xem trước (View Mode) nhằm bảo vệ tính toàn vẹn dữ liệu.</p>
                    </div>
                </div>)}

            {isEditMode ? (<BuilderBoard_1.BuilderBoard courseId={courseId}/>) : (<div className="flex flex-col lg:flex-row gap-6 h-full items-start">

                    <div className="w-full lg:w-80 shrink-0 bg-card rounded-xl border border-border shadow-sm overflow-hidden sticky top-4">
                        <div className="p-4 border-b border-border bg-muted/30">
                            <h3 className="font-bold text-sm flex items-center gap-2">
                                <lucide_react_1.BookOpen className="w-4 h-4 text-primary"/> Mục lục
                            </h3>
                        </div>

                        {sections.length === 0 ? (<div className="p-8 text-center text-sm text-muted-foreground italic">
                                Khóa học chưa có dữ liệu.
                            </div>) : (<div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                                <StudySidebar_1.StudySidebar sections={sections} currentLessonId={lessonIdParam} treeStatus="ACTIVE" progressionMode="FREE"/>
                            </div>)}
                    </div>

                    <div className="flex-1 min-w-0 w-full bg-card rounded-xl border border-border shadow-sm overflow-hidden min-h-[500px]">
                        {sections.length === 0 ? (<div className="flex flex-col items-center justify-center h-[500px] text-center p-8 bg-slate-50/50 dark:bg-slate-900/20">
                                <lucide_react_1.Info className="w-12 h-12 text-muted-foreground/30 mb-4"/>
                                <h3 className="text-lg font-bold text-foreground">Chưa có giáo án</h3>
                                <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                                    Khóa học này hiện chưa có Chương / Bài học nào. Hãy bật "Chế độ Chỉnh sửa" để bắt đầu thiết kế nội dung.
                                </p>
                                <button_1.Button className="mt-6" onClick={() => setIsEditMode(true)} disabled={isStatusLocked}>
                                    <lucide_react_1.Edit3 className="w-4 h-4 mr-2"/> Bật Chỉnh sửa ngay
                                </button_1.Button>
                            </div>) : activeLesson ? (<TeacherLessonViewer_1.TeacherLessonViewer lesson={activeLesson}/>) : (<div className="flex flex-col items-center justify-center h-full text-center p-8 text-muted-foreground min-h-[500px]">
                                <lucide_react_1.Loader2 className="w-8 h-8 animate-spin text-primary/40 mb-4"/>
                                Đang tải nội dung bài học...
                            </div>)}
                    </div>

                </div>)}
        </div>);
}
//# sourceMappingURL=CurriculumManager.js.map