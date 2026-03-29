import { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/config/routes";
import { Button } from "@/shared/components/ui/button";
import { CourseSettingsForm } from "@/features/courses/components/CourseSettingsForm";

export const metadata: Metadata = {
  title: "Cài đặt khóa học | EArena Teacher",
  description: "Cập nhật thông tin, giá bán và ảnh bìa khóa học.",
};

export default async function CourseSettingsPage({ 
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
    <div className="w-full max-w-[800px] mx-auto p-4 md:p-8 animate-in fade-in duration-300">
      <div className="flex items-center gap-4 mb-8 border-b border-border pb-4">
        <Link href={ROUTES.TEACHER.COURSES}>
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            Cài đặt chung
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý thông tin hiển thị, giá bán và các yêu cầu của khóa học.
          </p>
        </div>
      </div>

      <CourseSettingsForm courseId={courseId} />
    </div>
  );
}