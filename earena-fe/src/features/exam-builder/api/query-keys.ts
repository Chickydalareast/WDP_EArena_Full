import { ActiveFiltersPayloadDTO } from '../types/exam.schema';

export const examQueryKeys = {
  all: ['exams'] as const,
  
  lists: () => [...examQueryKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...examQueryKeys.lists(), filters] as const,
  
  details: () => [...examQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...examQueryKeys.details(), id] as const,
  
  papers: () => [...examQueryKeys.all, 'papers'] as const,
  paperDetail: (paperId: string) => [...examQueryKeys.papers(), paperId] as const,
  
  paperQuestions: (paperId: string) => [...examQueryKeys.paperDetail(paperId), 'questions'] as const,

  matrices: () => [...examQueryKeys.all, 'matrices'] as const,
  matrixLists: () => [...examQueryKeys.matrices(), 'list'] as const,
  matrixList: (filters: Record<string, unknown>) => [...examQueryKeys.matrixLists(), filters] as const,
  matrixDetail: (id: string) => [...examQueryKeys.matrices(), 'detail', id] as const,

  activeFilters: (payload: ActiveFiltersPayloadDTO) => 
    [...examQueryKeys.all, 'active-filters', payload] as const,

  previewRule: (paperId: string, payload: any) => 
    [...examQueryKeys.all, 'preview-rule', paperId, payload] as const,
};