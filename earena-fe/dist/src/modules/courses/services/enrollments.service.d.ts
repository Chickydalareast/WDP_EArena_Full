import { EventEmitter2 } from '@nestjs/event-emitter';
import { EnrollmentsRepository } from '../repositories/enrollments.repository';
import { LessonsRepository } from '../repositories/lessons.repository';
import { CoursesRepository } from '../courses.repository';
import { CreateEnrollmentPayload } from '../interfaces/course.interface';
export type EnrollUserPayload = {
    userId: string;
    courseId: string;
};
export type MarkLessonPayload = {
    userId: string;
    courseId: string;
    lessonId: string;
};
export declare class EnrollmentsService {
    private readonly enrollmentsRepo;
    private readonly lessonsRepo;
    private readonly coursesRepo;
    private readonly eventEmitter;
    constructor(enrollmentsRepo: EnrollmentsRepository, lessonsRepo: LessonsRepository, coursesRepo: CoursesRepository, eventEmitter: EventEmitter2);
    validateCourseExamAccess(userId: string, courseId: string, examId: string): Promise<boolean>;
    createEnrollment(payload: CreateEnrollmentPayload): Promise<{
        id: string;
    }>;
    markLessonCompleted(payload: MarkLessonPayload): Promise<{
        message: string;
        progress: number;
    }>;
}
