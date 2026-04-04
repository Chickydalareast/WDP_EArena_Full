import { MyLearningCourse } from '../types/enrollment.schema';
interface MyCourseCardProps {
    enrollment: MyLearningCourse;
    isHero?: boolean;
    className?: string;
}
export declare function MyCourseCard({ enrollment, isHero, className }: MyCourseCardProps): any;
export {};
