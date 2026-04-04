'use client';

import { useState } from 'react';
import { Loader2, ArrowDownCircle, MessagesSquare } from 'lucide-react';
import { useTeacherCourseDiscussions } from '../hooks/useTeacherCourseDiscussions';
import { DiscussionFilter, SortOption } from '../types/discussion.schema';
import { DiscussionThread } from '../components/DiscussionThread';
import { EmptyDiscussion } from '../components/EmptyDiscussion';
import { Button } from '@/shared/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';

export function TeacherCourseQnaScreen({ courseId }: { courseId: string }) {
    const [filter, setFilter] = useState<DiscussionFilter>('unanswered');
    const [sortBy, setSortBy] = useState<SortOption>('recent');

    const {
        data,
        isLoading,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage
    } = useTeacherCourseDiscussions({ courseId, filter, sortBy });

    const questions = data?.pages.flatMap(page => page.data) || [];
    const totalDiscussions = data?.pages[0]?.meta.total || 0;

    return (
        <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
                        <MessagesSquare className="w-7 h-7 text-primary" />
                        Hỏi đáp & Thảo luận
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1 font-medium">
                        Quản lý và giải đáp thắc mắc của học viên trong khóa học này.
                    </p>
                </div>

                <Select value={sortBy} onValueChange={(val) => setSortBy(val as SortOption)}>
                    <SelectTrigger className="w-[160px] bg-card font-bold shadow-sm">
                        <SelectValue placeholder="Sắp xếp" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="recent" className="font-medium">Mới nhất</SelectItem>
                        <SelectItem value="popular" className="font-medium">Nhiều tương tác</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Tabs
                defaultValue="unanswered"
                className="w-full"
                onValueChange={(val) => setFilter(val as DiscussionFilter)}
            >
                <TabsList className="grid w-full md:w-[400px] grid-cols-2 h-12 p-1 bg-muted/50">
                    <TabsTrigger value="unanswered" className="font-bold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                        Chưa trả lời
                    </TabsTrigger>
                    <TabsTrigger value="all" className="font-bold rounded-lg data-[state=active]:bg-background transition-all">
                        Tất cả thảo luận
                    </TabsTrigger>
                </TabsList>

                <div className="mt-6 bg-card border border-border/60 rounded-2xl p-6 shadow-sm min-h-[400px]">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-[300px] gap-3">
                            <Loader2 className="w-10 h-10 animate-spin text-primary" />
                            <p className="text-muted-foreground font-medium">Đang tải danh sách...</p>
                        </div>
                    ) : questions.length === 0 ? (
                        <EmptyDiscussion className="border-none shadow-none bg-transparent pt-12" />
                    ) : (
                        <div className="space-y-4">
                            <div className="text-sm font-bold text-muted-foreground pb-4 border-b border-border/40">
                                Tìm thấy {totalDiscussions} thảo luận
                            </div>

                            {questions.map((question) => (
                                <DiscussionThread
                                    key={question.id}
                                    courseId={courseId}
                                    lessonId={question.lesson?.id || ''} // Fallback an toàn, hook thread sẽ ưu tiên dùng parentId
                                    question={question}
                                />
                            ))}

                            {hasNextPage && (
                                <div className="flex justify-center pt-6 pb-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => fetchNextPage()}
                                        disabled={isFetchingNextPage}
                                        className="font-bold border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors"
                                    >
                                        {isFetchingNextPage ? (
                                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang tải...</>
                                        ) : (
                                            <><ArrowDownCircle className="w-4 h-4 mr-2" /> Tải thêm</>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Tabs>
        </div>
    );
}