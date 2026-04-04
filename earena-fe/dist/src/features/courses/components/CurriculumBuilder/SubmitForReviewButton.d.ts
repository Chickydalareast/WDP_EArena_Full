import { CourseStatus } from '../../types/course.schema';
interface SubmitForReviewButtonProps {
    courseId: string;
    status?: CourseStatus | string;
}
export declare function SubmitForReviewButton({ courseId, status }: SubmitForReviewButtonProps): any;
export {};
