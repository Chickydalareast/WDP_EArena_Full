import { create } from 'zustand';
import { IAiProcessedQuestion, IAiBatchProgress } from '../types/question-bank.schema';
import { ActiveFiltersPayloadDTO } from '@/features/exam-builder/types/exam.schema';

const INITIAL_ACTIVE_PAYLOAD: ActiveFiltersPayloadDTO = {
    folderIds: [],
    topicIds: [],
    difficulties: [],
    tags: [],
};

interface QuestionBankState {
    selectedFolderId: string | null;
    setSelectedFolderId: (id: string | null) => void;

    activePayload: ActiveFiltersPayloadDTO;
    toggleFilter: <K extends keyof ActiveFiltersPayloadDTO>(
        key: K, 
        value: NonNullable<ActiveFiltersPayloadDTO[K]>[number]
    ) => void;
    setFilters: (filters: Partial<ActiveFiltersPayloadDTO>) => void;
    resetFilters: () => void;

    expandedFolderIds: string[];
    selectedQuestionIds: string[];

    toggleFolderExpand: (id: string) => void;
    setExpandedFolderIds: (ids: string[]) => void;
    toggleQuestionSelection: (id: string) => void;
    clearQuestionSelection: () => void;
    selectAllQuestions: (ids: string[]) => void;

    processingIds: string[];
    addProcessingIds: (ids: string[]) => void;
    removeProcessingIds: (ids: string[]) => void;
    clearProcessingIds: () => void;

    aiProcessedQuestions: IAiProcessedQuestion[];
    aiBatchProgress: IAiBatchProgress | null;
    isSummaryModalOpen: boolean;

    processAiBatchEvent: (batchNum: number, totalBatches: number, questions: IAiProcessedQuestion[]) => void;
    clearAiProcessState: () => void;
    closeSummaryModal: () => void;
}

export const useQuestionBankStore = create<QuestionBankState>((set) => ({
    selectedFolderId: null,
    activePayload: INITIAL_ACTIVE_PAYLOAD,
    expandedFolderIds: [],
    selectedQuestionIds: [],
    processingIds: [],
    aiProcessedQuestions: [],
    aiBatchProgress: null,
    isSummaryModalOpen: false,

    setSelectedFolderId: (id) => set({ 
        selectedFolderId: id, 
        selectedQuestionIds: [],
        activePayload: INITIAL_ACTIVE_PAYLOAD 
    }),

    toggleFilter: (key, value) => set((state) => {
        const currentArray = state.activePayload[key] || [];
        const isExisting = (currentArray as any[]).includes(value);
        const nextArray = isExisting
            ? (currentArray as any[]).filter((item) => item !== value)
            : [...(currentArray as any[]), value];

        return {
            activePayload: { ...state.activePayload, [key]: nextArray },
            selectedQuestionIds: [],
        };
    }),

    setFilters: (filters) => set((state) => ({
        activePayload: { ...state.activePayload, ...filters },
        selectedQuestionIds: [],
    })),

    resetFilters: () => set({ 
        activePayload: INITIAL_ACTIVE_PAYLOAD,
        selectedQuestionIds: [],
    }),

    toggleFolderExpand: (id) => set((state) => ({
        expandedFolderIds: state.expandedFolderIds.includes(id)
            ? state.expandedFolderIds.filter((folderId) => folderId !== id)
            : [...state.expandedFolderIds, id],
    })),
    setExpandedFolderIds: (ids) => set({ expandedFolderIds: ids }),

    toggleQuestionSelection: (id) => set((state) => ({
        selectedQuestionIds: state.selectedQuestionIds.includes(id)
            ? state.selectedQuestionIds.filter((qId) => qId !== id)
            : [...state.selectedQuestionIds, id],
    })),
    clearQuestionSelection: () => set({ selectedQuestionIds: [] }),
    selectAllQuestions: (ids) => set({ selectedQuestionIds: ids }),

    addProcessingIds: (ids) => set((state) => ({
        processingIds: Array.from(new Set([...state.processingIds, ...ids]))
    })),
    removeProcessingIds: (ids) => set((state) => ({
        processingIds: state.processingIds.filter(id => !ids.includes(id))
    })),
    clearProcessingIds: () => set({ processingIds: [] }),

    processAiBatchEvent: (batchNum, totalBatches, questions) => set((state) => {
        const existingIds = new Set(state.aiProcessedQuestions.map(q => q.id));
        const uniqueNewQuestions = questions.filter(q => !existingIds.has(q.id));
        const accumulatedQuestions = [...state.aiProcessedQuestions, ...uniqueNewQuestions];
        const newProcessedIdsList = questions.map(q => q.id);
        const remainingProcessingIds = state.processingIds.filter(id => !newProcessedIdsList.includes(id));
        const isFinished = batchNum === totalBatches && totalBatches > 0;
        return {
            aiProcessedQuestions: accumulatedQuestions,
            processingIds: remainingProcessingIds,
            aiBatchProgress: { current: batchNum, total: totalBatches },
            isSummaryModalOpen: isFinished ? true : state.isSummaryModalOpen,
        };
    }),

    clearAiProcessState: () => set({
        aiProcessedQuestions: [],
        aiBatchProgress: null,
        isSummaryModalOpen: false,
        processingIds: [],
    }),

    closeSummaryModal: () => set({ isSummaryModalOpen: false }),
}));