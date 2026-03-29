import { Metadata, ResolvingMetadata } from 'next';
import { env } from '@/config/env';
import { CourseLandingScreen } from '@/features/courses/screens/CourseLandingScreen';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/courses/public/${resolvedParams.slug}`);
    const data = await res.json();
    const course = data.data || data;

    return {
      title: `${course.title} | EArena`,
      description: course.description?.slice(0, 160) || 'Khóa học chất lượng cao trên EArena',
      openGraph: {
        images: [course.coverImage?.url || ''],
      },
    };
  } catch (error) {
    return { title: 'Chi tiết khóa học | EArena' };
  }
}

export default async function CourseDetailPage({ params }: Props) {
  const resolvedParams = await params;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/20">
      <main className="flex-1 w-full pt-16">
        <CourseLandingScreen slug={resolvedParams.slug} />
      </main>

    </div>
  );
}