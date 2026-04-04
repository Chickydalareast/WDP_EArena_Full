import { StudentExamQuestion } from '../types/exam-take.schema';

export interface NestedExamQuestion extends StudentExamQuestion {
    subQuestions?: StudentExamQuestion[];
}


export const groupExamQuestions = (flatQuestions: StudentExamQuestion[]): NestedExamQuestion[] => {
    if (!flatQuestions || flatQuestions.length === 0) return [];

    const questionMap = new Map<string, NestedExamQuestion>();
    const rootQuestions: NestedExamQuestion[] = [];

    flatQuestions.forEach(q => {
        questionMap.set(q.originalQuestionId, { ...q, subQuestions: [] });
    });

    flatQuestions.forEach(q => {
        const node = questionMap.get(q.originalQuestionId);
        if (!node) return;

        if (q.parentPassageId) {
            const parent = questionMap.get(q.parentPassageId);
            if (parent && parent.subQuestions) {
                parent.subQuestions.push(node);
            }
        } else {
            rootQuestions.push(node);
        }
    });

    return rootQuestions;
};