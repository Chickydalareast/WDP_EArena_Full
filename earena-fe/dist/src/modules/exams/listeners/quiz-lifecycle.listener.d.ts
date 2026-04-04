import { ExamsService } from '../exams.service';
import * as courseEventConstant from 'src/modules/courses/constants/course-event.constant';
export declare class QuizLifecycleListener {
    private readonly examsService;
    private readonly logger;
    constructor(examsService: ExamsService);
    handleCourseDeactivated(payload: courseEventConstant.CourseDeactivatedEventPayload): Promise<void>;
}
