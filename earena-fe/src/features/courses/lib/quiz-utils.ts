import { QuizBuilderPreviewResponse } from '../types/course.schema';

export type FlatQuestionPreview = QuizBuilderPreviewResponse['previewData']['questions'][0];

export interface NestedQuestionPreview extends FlatQuestionPreview {
    subQuestions?: NestedQuestionPreview[];
}

export const buildNestedQuestions = (flatQuestions: FlatQuestionPreview[]): NestedQuestionPreview[] => {
    if (!flatQuestions || flatQuestions.length === 0) return [];

    const questionMap = new Map<string, NestedQuestionPreview>();
    const rootQuestions: NestedQuestionPreview[] = [];

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