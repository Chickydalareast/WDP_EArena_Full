import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseService } from '../api/course.service';
import { courseQueryKeys } from '../api/course-keys';
import { StudyTreeResponse } from '../types/course.schema';
import { toast } from 'sonner';
import { parseApiError } from '@/shared/lib/error-parser';

export const useStudyTree = (courseId: string) => {
  return useQuery({
    queryKey: courseQueryKeys.studyTree(courseId),
    queryFn: () => courseService.getStudyTree(courseId),
    staleTime: 1000 * 60 * 5,
    enabled: !!courseId,
  });
};

export const useLessonContent = (courseId: string, lessonId: string | null) => {
  return useQuery({
    queryKey: [...courseQueryKeys.studyTree(courseId), 'lesson', lessonId],
    queryFn: async () => {
      if (!lessonId) throw new Error('Lesson ID is missing');
      return courseService.getLessonContent(courseId, lessonId);
    },
    staleTime: 1000 * 60 * 10,
    enabled: !!courseId && !!lessonId,
  });
};

export const useMarkLessonCompleted = (courseId: string) => {
  const queryClient = useQueryClient();
  const treeKey = courseQueryKeys.studyTree(courseId);

  return useMutation({
    mutationFn: (lessonId: string) => courseService.markLessonCompleted({ courseId, lessonId }),
    
    onMutate: async (lessonId) => {
      await queryClient.cancelQueries({ queryKey: treeKey });
      const previousTree = queryClient.getQueryData<StudyTreeResponse>(treeKey);
      
      if (previousTree) {
        queryClient.setQueryData<StudyTreeResponse>(treeKey, (oldData) => {
          if (!oldData) return oldData;

          const newSections = oldData.curriculum.sections.map(section => ({
            ...section,
            lessons: section.lessons.map(lesson => 
              lesson.id === lessonId ? { ...lesson, isCompleted: true } : lesson
            )
          }));

          const allLessons = newSections.flatMap(s => s.lessons);
          const totalLessons = allLessons.length;
          const completedLessons = allLessons.filter(l => l.isCompleted).length;
          const newProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

          return {
            ...oldData,
            progress: newProgress,
            curriculum: {
              ...oldData.curriculum,
              sections: newSections
            }
          };
        });
      }
      return { previousTree };
    },
    
    onError: (err, lessonId, context) => {
      if (context?.previousTree) {
        queryClient.setQueryData(treeKey, context.previousTree);
      }
      toast.error('Không thể lưu tiến độ', { description: parseApiError(err).message });
    }
  });
};

export const useRefreshLessonToken = () => {
  const queryClient = useQueryClient();
  return {
    refreshToken: async (courseId: string, lessonId: string) => {
      await queryClient.invalidateQueries({
        queryKey: [...courseQueryKeys.studyTree(courseId), 'lesson', lessonId]
      });
    }
  };
};