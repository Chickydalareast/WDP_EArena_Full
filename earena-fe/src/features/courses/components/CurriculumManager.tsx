'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useTeacherCurriculumView } from '../hooks/useCurriculumBuilder';
import { CourseStatus } from '../types/course.schema';

import { BuilderBoard } from './CurriculumBuilder/BuilderBoard';
import { StudySidebar } from './StudySidebar';
import { TeacherLessonViewer } from './TeacherLessonViewer';

import { Skeleton } from '@/shared/components/ui/skeleton';
import { Button } from '@/shared/components/ui/button';
import { BookOpen, Edit3, Eye, AlertCircle, Info, Loader2 } from 'lucide-react';

interface CurriculumManagerProps {
    courseId: string;
}

export function CurriculumManager({ courseId }: CurriculumManagerProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const lessonIdParam = searchParams.get('lessonId');

    const [isEditMode, setIsEditMode] = useState(false);

    const { data: courseData, isLoading } = useTeacherCurriculumView(courseId);

    const isStatusLocked = courseData?.status === CourseStatus.PENDING_REVIEW;

    useEffect(() => {
        if (!isEditMode && courseData?.curriculum?.sections) {
            if (!lessonIdParam && courseData.curriculum.sections.length > 0) {
                const firstSection = courseData.curriculum.sections[0];
                if (firstSection.lessons && firstSection.lessons.length > 0) {
                    router.replace(`${pathname}?lessonId=${firstSection.lessons[0].id}`, { scroll: false });
                }
            }
        }
    }, [isEditMode, courseData, lessonIdParam, pathname, router]);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-16 w-full rounded-xl" />
                <div className="flex gap-6">
                    <Skeleton className="w-80 h-[600px] rounded-xl hidden lg:block" />
                    <Skeleton className="flex-1 h-[600px] rounded-xl" />
                </div>
            </div>
        );
    }

    if (!courseData) return null;

    const sections = courseData.curriculum?.sections || [];
    const activeLesson = sections.flatMap(s => s.lessons).find(l => l.id === lessonIdParam);

    return (
        <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500">

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
                <div>
                    <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-primary" />
                        Giáo án Khóa học
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        {isEditMode
                            ? "Kéo thả, thêm mới hoặc xóa bài học trong cấu trúc."
                            : "Trải nghiệm khóa học dưới góc nhìn của Học viên."}
                    </p>
                </div>

                <div className="flex items-center bg-muted/50 p-1.5 rounded-lg border border-border">
                    <Button
                        variant={!isEditMode ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setIsEditMode(false)}
                        className="rounded-md font-semibold transition-all"
                    >
                        <Eye className="w-4 h-4 mr-2" /> Xem trước
                    </Button>
                    <Button
                        variant={isEditMode ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setIsEditMode(true)}
                        disabled={isStatusLocked}
                        className="rounded-md font-semibold transition-all"
                        title={isStatusLocked ? "Không thể chỉnh sửa khi đang chờ duyệt" : ""}
                    >
                        <Edit3 className="w-4 h-4 mr-2" /> Chỉnh sửa
                    </Button>
                </div>
            </div>

            {isStatusLocked && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-xl flex items-start gap-3 text-yellow-700">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-sm">Chế độ Chỉnh sửa đã bị khóa</h4>
                        <p className="text-xs mt-1">Hệ thống đang thẩm định khóa học này. Bạn chỉ có thể Xem trước (View Mode) nhằm bảo vệ tính toàn vẹn dữ liệu.</p>
                    </div>
                </div>
            )}

            {isEditMode ? (
                <BuilderBoard courseId={courseId} />
            ) : (
                <div className="flex flex-col lg:flex-row gap-6 h-full items-start">

                    <div className="w-full lg:w-80 shrink-0 bg-card rounded-xl border border-border shadow-sm overflow-hidden sticky top-4">
                        <div className="p-4 border-b border-border bg-muted/30">
                            <h3 className="font-bold text-sm flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-primary" /> Mục lục
                            </h3>
                        </div>

                        {sections.length === 0 ? (
                            <div className="p-8 text-center text-sm text-muted-foreground italic">
                                Khóa học chưa có dữ liệu.
                            </div>
                        ) : (
                            <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                                <StudySidebar
                                    sections={sections}
                                    currentLessonId={lessonIdParam}
                                    treeStatus="ACTIVE"
                                    progressionMode="FREE"
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0 w-full bg-card rounded-xl border border-border shadow-sm overflow-hidden min-h-[500px]">
                        {sections.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[500px] text-center p-8 bg-slate-50/50 dark:bg-slate-900/20">
                                <Info className="w-12 h-12 text-muted-foreground/30 mb-4" />
                                <h3 className="text-lg font-bold text-foreground">Chưa có giáo án</h3>
                                <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                                    Khóa học này hiện chưa có Chương / Bài học nào. Hãy bật "Chế độ Chỉnh sửa" để bắt đầu thiết kế nội dung.
                                </p>
                                <Button className="mt-6" onClick={() => setIsEditMode(true)} disabled={isStatusLocked}>
                                    <Edit3 className="w-4 h-4 mr-2" /> Bật Chỉnh sửa ngay
                                </Button>
                            </div>
                        ) : activeLesson ? (
                            <TeacherLessonViewer lesson={activeLesson} />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center p-8 text-muted-foreground min-h-[500px]">
                                <Loader2 className="w-8 h-8 animate-spin text-primary/40 mb-4" />
                                Đang tải nội dung bài học...
                            </div>
                        )}
                    </div>

                </div>
            )}
        </div>
    );
}