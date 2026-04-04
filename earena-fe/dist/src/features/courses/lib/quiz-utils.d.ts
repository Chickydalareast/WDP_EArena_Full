import { QuizBuilderPreviewResponse } from '../types/course.schema';
export type FlatQuestionPreview = QuizBuilderPreviewResponse['previewData']['questions'][0] & {
    parentPassageId?: string;
};
export interface NestedQuestionPreview extends FlatQuestionPreview {
    subQuestions?: NestedQuestionPreview[];
}
export declare const buildNestedQuestions: (flatQuestions: FlatQuestionPreview[]) => NestedQuestionPreview[];
