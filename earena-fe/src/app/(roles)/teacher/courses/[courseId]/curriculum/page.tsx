import { Metadata } from "next";
import { CurriculumManager } from "@/features/courses/components/CurriculumManager";

export const metadata: Metadata = {
    title: "Giáo án & Cấu trúc | EArena Teacher",
};

export default async function CourseCurriculumPage({
    params,
}: {
    params: Promise<{ courseId: string }>;
}) {
    const resolvedParams = await params;
    const courseId = resolvedParams.courseId;

    return (
        <div className="w-full h-full max-w-[1400px] mx-auto">
            <CurriculumManager courseId={courseId} />
        </div>
    );
}