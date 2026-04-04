'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentExploreBento = StudentExploreBento;
const react_1 = __importDefault(require("react"));
const useCourses_1 = require("@/features/courses/hooks/useCourses");
const CourseCard_1 = require("@/features/courses/components/CourseCard");
function StudentExploreBento() {
    const { data, isLoading, isError } = (0, useCourses_1.usePublicCourses)({ limit: 4 });
    if (isLoading) {
        return (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (<CourseCard_1.CourseCardSkeleton key={i}/>))}
            </div>);
    }
    const items = data?.items || [];
    if (isError || items.length === 0) {
        return (<div className="p-8 text-center bg-card rounded-2xl border border-border/50 text-muted-foreground text-sm font-medium">
                Hiện tại chưa có khóa học mới nào.
            </div>);
    }
    return (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map(course => (<CourseCard_1.CourseCard key={course.id} course={course}/>))}
        </div>);
}
//# sourceMappingURL=StudentExploreBento.js.map