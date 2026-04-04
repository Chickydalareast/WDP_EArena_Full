import { EnrollmentsService } from '../services/enrollments.service';
import { MarkLessonDto } from '../dto/enrollment.dto';
import { CourseCheckoutService } from '../services/course-checkout.service';
export declare class EnrollmentsController {
    private readonly enrollmentsService;
    private readonly checkoutService;
    constructor(enrollmentsService: EnrollmentsService, checkoutService: CourseCheckoutService);
    enrollCourse(courseId: string, userId: string): Promise<{
        message: string;
        enrollmentId: string;
    }>;
    markCompleted(dto: MarkLessonDto, userId: string): Promise<{
        message: string;
        progress: number;
    }>;
}
