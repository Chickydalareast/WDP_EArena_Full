import { EventEmitter2 } from '@nestjs/event-emitter';
import { CoursesRepository } from '../courses.repository';
import { EnrollmentsRepository } from '../repositories/enrollments.repository';
import { EnrollmentsService } from './enrollments.service';
import { WalletsService } from '../../wallets/wallets.service';
import { CourseCheckoutPayload } from '../interfaces/course.interface';
export declare class CourseCheckoutService {
    private readonly coursesRepo;
    private readonly enrollmentsRepo;
    private readonly enrollmentsService;
    private readonly walletsService;
    private readonly eventEmitter;
    private readonly logger;
    constructor(coursesRepo: CoursesRepository, enrollmentsRepo: EnrollmentsRepository, enrollmentsService: EnrollmentsService, walletsService: WalletsService, eventEmitter: EventEmitter2);
    checkoutCourse(payload: CourseCheckoutPayload): Promise<{
        message: string;
        enrollmentId: string;
    }>;
}
