"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMetadata = generateMetadata;
exports.default = CourseDetailPage;
const env_1 = require("@/config/env");
const CourseLandingScreen_1 = require("@/features/courses/screens/CourseLandingScreen");
async function generateMetadata({ params }, parent) {
    try {
        const resolvedParams = await params;
        const res = await fetch(`${env_1.env.NEXT_PUBLIC_API_URL}/courses/public/${resolvedParams.slug}`);
        const data = await res.json();
        const course = data.data || data;
        return {
            title: `${course.title} | EArena`,
            description: course.description?.slice(0, 160) || 'Khóa học chất lượng cao trên EArena',
            openGraph: {
                images: [course.coverImage?.url || ''],
            },
        };
    }
    catch (error) {
        return { title: 'Chi tiết khóa học | EArena' };
    }
}
async function CourseDetailPage({ params }) {
    const resolvedParams = await params;
    return (<div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/20">
      <main className="flex-1 w-full pt-16">
        <CourseLandingScreen_1.CourseLandingScreen slug={resolvedParams.slug}/>
      </main>

    </div>);
}
//# sourceMappingURL=page.js.map