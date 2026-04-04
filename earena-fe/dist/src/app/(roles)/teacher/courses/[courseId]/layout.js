"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CourseDetailLayout;
const lucide_react_1 = require("lucide-react");
const link_1 = __importDefault(require("next/link"));
const routes_1 = require("@/config/routes");
const button_1 = require("@/shared/components/ui/button");
const TeacherCourseNav_1 = require("@/features/courses/components/TeacherCourseNav");
const BuilderHeaderActions_1 = require("@/features/courses/components/CurriculumBuilder/BuilderHeaderActions");
async function CourseDetailLayout({ children, params, }) {
    const resolvedParams = await params;
    const courseId = resolvedParams.courseId;
    return (<div className="w-full min-h-[calc(100vh-4rem)] flex flex-col space-y-4 animate-in fade-in duration-300">
            
            <div className="flex items-center justify-between px-2">
                <link_1.default href={routes_1.ROUTES.TEACHER.COURSES}>
                    <button_1.Button variant="ghost" size="sm" className="h-8 gap-1 text-muted-foreground hover:text-foreground">
                        <lucide_react_1.ArrowLeft className="h-4 w-4"/>
                        Quay lại kho khóa học
                    </button_1.Button>
                </link_1.default>

                
                <BuilderHeaderActions_1.BuilderHeaderActions courseId={courseId}/>
            </div>

            <div className="bg-background rounded-xl border border-border overflow-hidden flex-1 flex flex-col shadow-sm">
                <TeacherCourseNav_1.TeacherCourseNav courseId={courseId}/>

                <div className="flex-1 p-4 md:p-6 bg-muted/10 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>);
}
//# sourceMappingURL=layout.js.map