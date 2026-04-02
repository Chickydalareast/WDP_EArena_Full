import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/config/routes";
import { Button } from "@/shared/components/ui/button";
import { TeacherCourseNav } from "@/features/courses/components/TeacherCourseNav";

// [THÊM IMPORT]: Gọi Component chứa Nút vào Layout
import { BuilderHeaderActions } from "@/features/courses/components/CurriculumBuilder/BuilderHeaderActions";

export default async function CourseDetailLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ courseId: string }>;
}) {
    const resolvedParams = await params;
    const courseId = resolvedParams.courseId;

    return (
        <div className="w-full min-h-[calc(100vh-4rem)] flex flex-col space-y-4 animate-in fade-in duration-300">
            {/* [CHỈNH SỬA]: Chuyển div này thành flex-between để gắn nút sang góc phải */}
            <div className="flex items-center justify-between px-2">
                <Link href={ROUTES.TEACHER.COURSES}>
                    <Button variant="ghost" size="sm" className="h-8 gap-1 text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="h-4 w-4" />
                        Quay lại kho khóa học
                    </Button>
                </Link>

                {/* [THÊM NÚT GỬI DUYỆT]: Đặt ở đây sẽ hiển thị ở TẤT CẢ các tab của khóa học */}
                <BuilderHeaderActions courseId={courseId} />
            </div>

            <div className="bg-background rounded-xl border border-border overflow-hidden flex-1 flex flex-col shadow-sm">
                <TeacherCourseNav courseId={courseId} />

                <div className="flex-1 p-4 md:p-6 bg-muted/10 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}