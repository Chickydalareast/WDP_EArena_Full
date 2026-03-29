import { StudyRoomScreen } from "@/features/courses/screens/StudyRoomScreen";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Phòng học | EArena",
  description: "Không gian học tập tập trung.",
};

export default async function StudyPage({ params }: { params: Promise<{ courseId: string }> }) {
  const resolvedParams = await params;

  return (
    <div className="w-full min-h-screen bg-background text-foreground">
      <StudyRoomScreen courseId={resolvedParams.courseId} />
    </div>
  );
}