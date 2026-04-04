import { ActiveFiltersPayloadDTO } from '../types/exam.schema';
export declare const examQueryKeys: {
    all: readonly ["exams"];
    lists: () => readonly ["exams", "list"];
    list: (filters: Record<string, unknown>) => readonly ["exams", "list", Record<string, unknown>];
    details: () => readonly ["exams", "detail"];
    detail: (id: string) => readonly ["exams", "detail", string];
    papers: () => readonly ["exams", "papers"];
    paperDetail: (paperId: string) => readonly ["exams", "papers", string];
    paperQuestions: (paperId: string) => readonly ["exams", "papers", string, "questions"];
    matrices: () => readonly ["exams", "matrices"];
    matrixLists: () => readonly ["exams", "matrices", "list"];
    matrixList: (filters: Record<string, unknown>) => readonly ["exams", "matrices", "list", Record<string, unknown>];
    matrixDetail: (id: string) => readonly ["exams", "matrices", "detail", string];
    activeFilters: (payload: ActiveFiltersPayloadDTO) => readonly ["exams", "active-filters", z.infer<any>];
    previewRule: (paperId: string, payload: any) => readonly ["exams", "preview-rule", string, any];
};
