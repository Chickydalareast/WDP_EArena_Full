import { useQuery } from '@tanstack/react-query';
import { courseService } from '../api/course.service';
import { courseQueryKeys } from '../api/course-keys';
import { CourseBasic, PublicCourseDetail, SectionPreview } from '../types/course.schema';

interface UsePublicCoursesProps {
  page?: number;
  limit?: number;
  keyword?: string;
  subjectId?: string;
  isFree?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'NEWEST' | 'PRICE_ASC' | 'PRICE_DESC' | 'POPULAR';
}

interface UsePublicCoursesProps {
  page?: number;
  limit?: number;
  keyword?: string;
  subjectId?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedCourseResponse {
  items: CourseBasic[];
  meta: PaginationMeta;
}

export const usePublicCourses = (filters: UsePublicCoursesProps = { page: 1, limit: 12 }) => {
  return useQuery({
    queryKey: courseQueryKeys.publicList(filters as Record<string, unknown>),
    queryFn: () => courseService.getPublicCourses(filters as Record<string, unknown>),
    staleTime: 1000 * 60 * 5,
    select: (response: any): PaginatedCourseResponse => {
      // [CTO HOTFIX]: Tương thích mọi kiểu bọc data từ interceptor axios-client
      if (response?.data && response?.meta) {
        return { items: response.data as CourseBasic[], meta: response.meta as PaginationMeta };
      }
      if (response?.items && response?.meta) {
        return { items: response.items as CourseBasic[], meta: response.meta as PaginationMeta };
      }
      return { 
        items: (Array.isArray(response) ? response : []) as CourseBasic[], 
        meta: { page: 1, limit: 12, total: 0, totalPages: 1 } 
      };
    }
  });
};

export const usePublicCourseDetail = (slug: string) => {
  return useQuery({
    queryKey: courseQueryKeys.publicDetail(slug),
    queryFn: () => courseService.getPublicCourseDetail(slug),
    staleTime: 1000 * 60 * 10,
    enabled: !!slug,
    select: (response): PublicCourseDetail | undefined => {
        if (!response || typeof response !== 'object') return undefined;

        const raw = response as Record<string, unknown>;

        if ('course' in raw && 'curriculum' in raw) {
            const courseData = raw.course as Record<string, unknown>;
            const curriculumData = raw.curriculum as Record<string, unknown>;
            
            return {
                ...(courseData as unknown as CourseBasic),
                teacher: courseData.teacher,
                // [CTO FIX]: Lấy trường isEnrolled từ gốc raw nhét vào object trả về!
                isEnrolled: raw.isEnrolled as boolean | undefined,
                
                curriculum: {
                    ...curriculumData, 
                    sections: Array.isArray(curriculumData.sections) 
                        ? (curriculumData.sections as SectionPreview[]) 
                        : []
                }
            } as PublicCourseDetail;
        }

        if ('id' in raw && 'title' in raw && 'curriculum' in raw) {
            return raw as unknown as PublicCourseDetail;
        }

        return undefined;
    }
  });
};