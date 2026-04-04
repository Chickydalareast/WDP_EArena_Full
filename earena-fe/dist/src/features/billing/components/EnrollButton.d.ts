import { CourseBasic } from '@/features/courses/types/course.schema';
interface EnrollButtonProps {
    course: CourseBasic;
    className?: string;
    variant?: 'default' | 'outline' | 'secondary';
    size?: 'default' | 'sm' | 'lg';
}
export declare function EnrollButton({ course, className, variant, size }: EnrollButtonProps): any;
export {};
