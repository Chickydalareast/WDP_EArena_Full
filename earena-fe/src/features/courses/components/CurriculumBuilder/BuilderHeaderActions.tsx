'use client';

import { useCourseSettings } from '../../hooks/useCourseSettings';
import { SubmitForReviewButton } from './SubmitForReviewButton'; 
import { Skeleton } from '@/shared/components/ui/skeleton';
import { CourseStatus } from '../../types/course.schema';

export function BuilderHeaderActions({ courseId }: { courseId: string }) {
  const { data: course, isLoading, isError } = useCourseSettings(courseId);

  if (isLoading) {
    return <Skeleton className="h-10 w-[180px] rounded-md" />;
  }

  if (isError || !course) {
    return <SubmitForReviewButton courseId={courseId} status={CourseStatus.DRAFT} />;
  }

  return (
    <SubmitForReviewButton 
      courseId={courseId} 
      status={course.status || CourseStatus.DRAFT} 
    />
  );
}