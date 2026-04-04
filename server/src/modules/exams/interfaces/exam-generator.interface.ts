import { Types } from 'mongoose';
import { DifficultyLevel, QuestionType } from 'src/modules/questions/schemas/question.schema';
import { MatrixRulePayload, RuleQuestionType } from './exam-matrix.interface';

export interface GenerateRawPaperPayload {
  teacherId: string;
  totalScore: number;
  matrixId?: string;
  adHocSections?: {
    name: string;
    orderIndex?: number;
    rules: MatrixRulePayload[];
  }[];
}

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


export interface CandidateAnswer {
  id: string;
  content: string;
  isCorrect: boolean;
}


export interface CandidateQuestion {
  _id: Types.ObjectId;
  type: QuestionType;
  content: string;
  difficultyLevel: DifficultyLevel;
  answers: CandidateAnswer[];
  
  explanation?: string | null;
  attachedMedia?: Types.ObjectId[];
  parentPassageId?: Types.ObjectId | null;
  orderIndex?: number;
}


export interface CandidatePassage extends CandidateQuestion {
  childQuestions: CandidateQuestion[];
}

export interface CandidatePool {
  flats: CandidateQuestion[];
  passages: CandidatePassage[];
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
    questionType?: RuleQuestionType;
    subQuestionLimit?: number;
    folderIds?: string[];
    topicIds?: string[];
    difficulties?: DifficultyLevel[];
    tags?: string[];
    limit: number;
  };
}