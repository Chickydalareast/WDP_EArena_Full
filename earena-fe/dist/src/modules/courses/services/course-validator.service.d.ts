import { MediaRepository } from '../../media/media.repository';
import { UsersRepository } from '../../users/users.repository';
import { CoursesRepository } from '../courses.repository';
import { ValidateCourseSubmissionPayload } from '../interfaces/course.interface';
export declare class CourseValidatorService {
    private readonly mediaRepo;
    private readonly usersRepo;
    private readonly coursesRepo;
    private readonly logger;
    constructor(mediaRepo: MediaRepository, usersRepo: UsersRepository, coursesRepo: CoursesRepository);
    validateTeacherSubjectAccess(teacherId: string, subjectId: string): Promise<void>;
    verifyMediaOwnershipStrict(mediaIds: (string | null | undefined)[], teacherId: string): Promise<void>;
    verifyExamOwnershipStrict(examId: string | undefined, teacherId: string): Promise<void>;
    validateCourseSubmissionRules(payload: ValidateCourseSubmissionPayload): Promise<void>;
}
