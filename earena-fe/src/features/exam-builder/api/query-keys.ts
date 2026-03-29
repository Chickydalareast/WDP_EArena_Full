export const examQueryKeys = {
  all: ['exams'] as const,
  
  lists: () => [...examQueryKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...examQueryKeys.lists(), filters] as const,
  
  details: () => [...examQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...examQueryKeys.details(), id] as const,
  
  papers: () => [...examQueryKeys.all, 'papers'] as const,
  paperDetail: (paperId: string) => [...examQueryKeys.papers(), paperId] as const,
  
  paperQuestions: (paperId: string) => [...examQueryKeys.paperDetail(paperId), 'questions'] as const,
};