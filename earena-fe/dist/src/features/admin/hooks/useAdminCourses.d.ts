import { MasterListCourseStatus } from '../types/admin.types';
export declare const useAdminCoursesMasterList: (params: {
    page: number;
    limit: number;
    search?: string;
    status?: MasterListCourseStatus;
}) => any;
export declare const useAdminCoursesList: (params: {
    page: number;
    limit: number;
}) => any;
export declare const useAdminCourseDetail: (id: string | null) => any;
export declare const useApproveCourse: () => any;
export declare const useRejectCourse: () => any;
export declare const useForceTakedownCourse: () => any;
