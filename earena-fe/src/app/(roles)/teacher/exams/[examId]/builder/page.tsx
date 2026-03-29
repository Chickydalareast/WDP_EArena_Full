import { Suspense } from 'react';
import { ExamBuilderBoard } from '@/features/exam-builder/components/ExamBuilderBoard';
import { Skeleton } from '@/shared/components/ui/skeleton';

export default function ExamBuilderPage() {
  return (
    <div className="w-full">
      <Suspense fallback={
        <div className="max-w-5xl mx-auto space-y-4">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      }>
        <ExamBuilderBoard />
      </Suspense>
    </div>
  );
}