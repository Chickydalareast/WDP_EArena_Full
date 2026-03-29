import { PublicCoursesScreen } from "@/features/courses/screens/PublicCoursesScreen";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Danh sách Khóa học | EArena",
  description: "Khám phá các khóa học ôn thi THPT Quốc gia chất lượng cao.",
};

export default function CoursesPage() {
  return (
    <PublicCoursesScreen />
  );
}