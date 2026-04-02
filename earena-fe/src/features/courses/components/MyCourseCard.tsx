'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ROUTES } from '@/config/routes';
import { Progress } from '@/shared/components/ui/progress';
import { PlayCircle, User, CheckCircle2 } from 'lucide-react';
import { MyLearningCourse } from '../types/enrollment.schema';
import { cn } from '@/shared/lib/utils';

interface MyCourseCardProps {
    enrollment: MyLearningCourse;
    isHero?: boolean;
    className?: string;
}

export function MyCourseCard({ enrollment, isHero = false, className }: MyCourseCardProps) {
    const { course, progress, courseId, status } = enrollment;
    const isCompleted = progress === 100 || status === 'COMPLETED';

    return (
        <Link
            href={ROUTES.STUDENT.STUDY_ROOM(courseId)}
            className={cn(
                "group flex bg-card rounded-[2rem] border border-border/60 overflow-hidden transition-all duration-300",
                "hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/40",
                isHero ? "flex-col md:flex-row" : "flex-col",
                className
            )}
        >
            <div className={cn(
                "relative bg-secondary/50 overflow-hidden shrink-0",
                // [CTO FIX]: Thu hẹp tỷ lệ ảnh lại thành 5/12 để nhường không gian cho Text thở tốt hơn
                isHero ? "w-full md:w-5/12 lg:w-1/2 aspect-video md:aspect-auto" : "w-full aspect-video"
            )}>
                {course.coverImage?.url ? (
                    <Image
                        src={course.coverImage.url}
                        alt={course.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes={isHero ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 25vw"}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary text-muted-foreground font-medium">
                        Chưa có ảnh bìa
                    </div>
                )}
                
                <div className="absolute top-4 left-4 flex gap-2">
                    {isCompleted ? (
                        <span className="bg-green-500/90 backdrop-blur-md text-white text-xs font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Hoàn thành
                        </span>
                    ) : (
                        <span className="bg-background/90 backdrop-blur-md text-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                            {status || 'Đang học'}
                        </span>
                    )}
                </div>

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="w-16 h-16 bg-background/95 rounded-full flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform duration-300">
                        <PlayCircle className="w-8 h-8 text-primary ml-1" />
                    </div>
                </div>
            </div>

            <div className="p-6 md:p-8 flex flex-col flex-1 bg-card relative z-10">
                <div>
                    <h3 className={cn(
                        "font-black text-foreground line-clamp-2 group-hover:text-primary transition-colors",
                        isHero ? "text-2xl md:text-3xl mb-4 leading-tight" : "text-xl mb-3"
                    )}>
                        {course.title}
                    </h3>

                    <div className="flex items-center gap-3 mt-4 mb-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/20 shrink-0">
                            {course.teacher.avatar ? (
                                <Image src={course.teacher.avatar} alt="Teacher" width={32} height={32} className="object-cover w-full h-full" />
                            ) : (
                                <User className="w-4 h-4 text-primary" />
                            )}
                        </div>
                        <span className="font-semibold text-muted-foreground text-sm truncate">
                            {course.teacher.fullName}
                        </span>
                    </div>
                </div>

                {/* [CTO FIX]: Dùng mt-auto và pt-6 để ép thanh tiến độ luôn nằm gọn dưới đáy box */}
                <div className="space-y-3 mt-auto pt-6">
                    <div className="flex justify-between items-end text-sm font-bold">
                        <span className={isCompleted ? 'text-green-600 dark:text-green-400' : 'text-primary'}>
                            {progress}% <span className="text-muted-foreground font-medium text-xs ml-1">tiến độ</span>
                        </span>
                    </div>
                    <Progress
                        value={progress}
                        className="h-2.5 bg-secondary overflow-hidden"
                    />
                </div>
            </div>
        </Link>
    );
}