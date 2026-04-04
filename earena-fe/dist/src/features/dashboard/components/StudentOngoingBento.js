'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentOngoingBento = StudentOngoingBento;
const react_1 = __importDefault(require("react"));
const useMyCourses_1 = require("@/features/courses/hooks/useMyCourses");
const MyCourseCard_1 = require("@/features/courses/components/MyCourseCard");
const skeleton_1 = require("@/shared/components/ui/skeleton");
const lucide_react_1 = require("lucide-react");
const link_1 = __importDefault(require("next/link"));
const routes_1 = require("@/config/routes");
function StudentOngoingBento() {
    const { data, isLoading, isError } = (0, useMyCourses_1.useMyCourses)(1, 4);
    if (isLoading) {
        return (<div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-fr">
                
                <div className="md:col-span-12 lg:col-span-6 bg-card rounded-[2rem] border border-border p-6 flex flex-col md:flex-row gap-6">
                    <skeleton_1.Skeleton className="w-full md:w-1/2 aspect-video rounded-xl"/>
                    <div className="flex-1 space-y-4 py-4">
                        <skeleton_1.Skeleton className="h-6 w-3/4"/>
                        <skeleton_1.Skeleton className="h-4 w-1/2"/>
                        <skeleton_1.Skeleton className="h-10 w-full mt-auto"/>
                    </div>
                </div>
                
                <div className="md:col-span-12 lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <skeleton_1.Skeleton className="w-full h-full min-h-[250px] rounded-[2rem]"/>
                    <skeleton_1.Skeleton className="w-full h-full min-h-[250px] rounded-[2rem]"/>
                </div>
            </div>);
    }
    const courses = data?.data || [];
    if (isError || courses.length === 0) {
        return (<div className="bg-card border border-dashed border-border/60 rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                    <lucide_react_1.BookOpen size={32}/>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Chưa có khóa học nào</h3>
                <p className="text-sm text-muted-foreground max-w-md mb-6">
                    Bạn chưa ghi danh vào khóa học nào. Hãy khám phá ngay nhé.
                </p>
                <link_1.default href={routes_1.ROUTES.PUBLIC.COURSES} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-bold shadow-md hover:bg-primary/90 transition-colors">
                    Khám phá ngay
                </link_1.default>
            </div>);
    }
    const heroCourse = courses[0];
    const recentCourses = courses.slice(1, 3);
    return (<div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            
            <div className="md:col-span-12 lg:col-span-6 flex">
                <MyCourseCard_1.MyCourseCard enrollment={heroCourse} isHero={true} className="w-full h-full"/>
            </div>

            
            {recentCourses.length > 0 && (<div className="md:col-span-12 lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {recentCourses.map(course => (<MyCourseCard_1.MyCourseCard key={course.id} enrollment={course} isHero={false} className="w-full h-full"/>))}
                </div>)}
        </div>);
}
//# sourceMappingURL=StudentOngoingBento.js.map