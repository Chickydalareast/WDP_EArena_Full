import { DifficultyLevel } from 'src/modules/questions/schemas/question.schema';
import { MatrixRulePayload } from './exam-matrix.interface';

export interface GenerateDynamicExamPayload {
  teacherId: string;
  title: string;
  totalScore: number;
  matrixId?: string;
  adHocSections?: {
    name: string;
    orderIndex?: number;
    rules: MatrixRulePayload[];
  }[];
}

export interface PreviewDynamicExamPayload {
  teacherId: string;
  matrixId?: string;
  adHocSections?: {
    name: string;
    orderIndex?: number;
    rules: MatrixRulePayload[];
  }[];
}

export interface CandidatePool {
  flats: any[];
  passages: any[];
}

export interface FillExistingPaperPayload {
  teacherId: string;
  paperId: string;
  matrixId?: string;
  adHocSections?: {
    name: string;
    orderIndex?: number;
    rules: MatrixRulePayload[];
  }[];
}

export interface PreviewRulePayload {
  teacherId: string;
  paperId: string;
  rule: {
    folderIds?: string[];
    topicIds?: string[];
    difficulties?: DifficultyLevel[];
    tags?: string[];
    limit: number;
  };
}
