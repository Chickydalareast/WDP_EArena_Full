import { Metadata } from 'next';
import { TeacherCourseQnaScreen } from '@/features/discussions/screens/TeacherCourseQnaScreen';

export const metadata: Metadata = {
    title: 'Hỏi đáp khóa học | EArena Teacher',
    description: 'Quản lý và giải đáp thắc mắc của học viên.',
};

export default async function TeacherCourseQnaPage({
    params,
}: {
    params: Promise<{ courseId: string }>;
}) {
    const resolvedParams = await params;

    return <TeacherCourseQnaScreen courseId={resolvedParams.courseId} />;
}