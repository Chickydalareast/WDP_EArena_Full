'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ROUTES } from '@/config/routes';
import { Progress } from '@/shared/components/ui/progress';
import { PlayCircle, User } from 'lucide-react';
import { MyLearningCourse } from '../types/enrollment.schema';

interface MyCourseCardProps {
    enrollment: MyLearningCourse;
}

export function MyCourseCard({ enrollment }: MyCourseCardProps) {
    const { course, progress, courseId } = enrollment;

    return (
        <Link
            href={ROUTES.STUDENT.STUDY_ROOM(courseId)}
            className="group flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-blue-300 transition-all duration-300"
        >
            <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
                {course.coverImage?.url ? (
                    <Image
                        src={course.coverImage.url}
                        alt={course.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                        No Image
                    </div>
                )}

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <PlayCircle className="w-8 h-8 text-blue-600 ml-1" />
                    </div>
                </div>
            </div>

            <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-lg text-slate-800 line-clamp-2 mb-3 group-hover:text-blue-600 transition-colors">
                    {course.title}
                </h3>

                <div className="flex items-center gap-2 mt-auto mb-4 text-sm text-slate-600">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border border-blue-200">
                        {course.teacher.avatar ? (
                            <Image src={course.teacher.avatar} alt="Teacher" width={24} height={24} className="object-cover" />
                        ) : (
                            <User className="w-3 h-3 text-blue-600" />
                        )}
                    </div>
                    <span className="font-medium truncate">{course.teacher.fullName}</span>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                        <span className={progress === 100 ? 'text-green-600' : 'text-blue-600'}>
                            {progress === 100 ? 'Đã hoàn thành' : 'Đang học'}
                        </span>
                        <span className="text-slate-600">{progress}%</span>
                    </div>
                    <Progress
                        value={progress}
                        className="h-2 bg-slate-100"
                    />
                </div>
            </div>
        </Link>
    );
}