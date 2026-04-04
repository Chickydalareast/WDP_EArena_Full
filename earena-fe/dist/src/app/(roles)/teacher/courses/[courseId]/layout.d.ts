export default function CourseDetailLayout({ children, params, }: {
    children: React.ReactNode;
    params: Promise<{
        courseId: string;
    }>;
}): Promise<any>;
