import { BuilderBoard } from "@/features/courses/components/CurriculumBuilder/BuilderBoard";
import { BuilderHeaderActions } from "@/features/courses/components/CurriculumBuilder/BuilderHeaderActions";
import { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/config/routes";
import { Button } from "@/shared/components/ui/button";

export const metadata: Metadata = {
  title: "Soạn giáo án | EArena Teacher",
};

export default async function CourseBuilderPage({ 
  params 
}: { 
  params: Promise<{ courseId: string }> 
}) {
  const resolvedParams = await params;
  const courseId = resolvedParams.courseId;

  if (!courseId) {
    return <div className="p-8 text-center text-red-500">Mã khóa học không hợp lệ.</div>;
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-border pb-4 gap-4">
        <div className="flex items-center gap-4">
          <Link href={ROUTES.TEACHER.COURSES}>
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-full">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Curriculum Builder</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Soạn thảo và sắp xếp bài giảng. Hệ thống tự động lưu vị trí kéo thả.
            </p>
          </div>
        </div>

        <BuilderHeaderActions courseId={courseId} />
      </div>

      <BuilderBoard courseId={courseId} />
    </div>
  );
}