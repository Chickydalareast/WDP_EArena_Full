'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuilderHeaderActions = BuilderHeaderActions;
const useCourseSettings_1 = require("../../hooks/useCourseSettings");
const SubmitForReviewButton_1 = require("./SubmitForReviewButton");
const skeleton_1 = require("@/shared/components/ui/skeleton");
const course_schema_1 = require("../../types/course.schema");
function BuilderHeaderActions({ courseId }) {
    const { data: course, isLoading, isError } = (0, useCourseSettings_1.useCourseSettings)(courseId);
    if (isLoading) {
        return <skeleton_1.Skeleton className="h-10 w-[180px] rounded-md"/>;
    }
    if (isError || !course) {
        return <SubmitForReviewButton_1.SubmitForReviewButton courseId={courseId} status={course_schema_1.CourseStatus.DRAFT}/>;
    }
    return (<SubmitForReviewButton_1.SubmitForReviewButton courseId={courseId} status={course.status || course_schema_1.CourseStatus.DRAFT}/>);
}
//# sourceMappingURL=BuilderHeaderActions.js.map