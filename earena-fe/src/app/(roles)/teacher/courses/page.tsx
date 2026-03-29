import { TeacherCoursesScreen } from "@/features/courses/screens/TeacherCoursesScreen";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý Khóa học | EArena Teacher",
  description: "Trình quản lý khóa học dành cho giáo viên.",
};

export default function TeacherCoursesPage() {
  return <TeacherCoursesScreen />;
}