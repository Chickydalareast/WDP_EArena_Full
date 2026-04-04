import { Types } from 'mongoose';
import { DifficultyLevel } from '../../questions/schemas/question.schema';
import { ShowResultMode } from '../schemas/lesson.schema';

export interface DynamicFilterParam {
  difficulty: DifficultyLevel;
  count: number;
}

export interface MatrixRuleParam {
  folderIds?: string[];
  topicIds?: string[];
  difficulties?: DifficultyLevel[];
  tags?: string[];
  limit: number;
}
export interface MatrixSectionParam {
  name: string;
  orderIndex?: number;
  rules: MatrixRuleParam[];
}

export interface DynamicExamConfigParam {
  sourceFolders?: (string | Types.ObjectId)[];
  mixRatio?: DynamicFilterParam[];
  matrixId?: string | Types.ObjectId;
  adHocSections?: MatrixSectionParam[];
}

export interface ExamRuleConfigParam {
  timeLimit: number;
  maxAttempts: number;
  passPercentage: number;
  showResultMode: ShowResultMode;
}

export interface CreateCourseQuizParams {
  teacherId: string;
  courseId: string;
  sectionId: string;
  title: string;
  content: string;
  isFreePreview: boolean;
  totalScore: number;
  dynamicConfig: DynamicExamConfigParam;
  examRules: ExamRuleConfigParam;
}

export interface UpdateCourseQuizParams {
  teacherId: string;
  courseId: string;
  lessonId: string;
  title?: string;
  content?: string;
  isFreePreview?: boolean;
  totalScore?: number;
  dynamicConfig?: DynamicExamConfigParam;
  examRules?: ExamRuleConfigParam;
}

export interface DeleteCourseQuizParams {
  teacherId: string;
  courseId: string;
  lessonId: string;
}

export interface GetQuizMatricesParams {
  teacherId: string;
  courseId: string;
  page: number;
  limit: number;
  search?: string;
}

export interface RulePreviewParams {
  teacherId: string;
  folderIds?: string[];
  topicIds?: string[];
  difficulties?: DifficultyLevel[];
  tags?: string[];
  limit: number;
}

export interface RulePreviewResult {
  availableCount: number;
  requiredCount: number;
  isSufficient: boolean;
  safetyRatio: number;
}

export interface PreviewQuizConfigParams {
  teacherId: string;
  matrixId?: string;
  adHocSections?: MatrixSectionParam[];
}

export interface QuizHealthRuleStatus {
  sectionName: string;
  requiredCount: number;
  availableCount: number;
  isSufficient: boolean;
  safetyRatio: number;
  isWarning: boolean;
}

export interface QuizHealthResult {
  lessonId: string;
  examId: string;
  isHealthy: boolean;
  hasWarning: boolean;
  isLocked: boolean;
  matrixExists: boolean | null;
  configMode: 'matrix' | 'adHoc' | 'unconfigured';
  rules: QuizHealthRuleStatus[];
}

export interface GetQuizHealthParams {
  teacherId: string;
  courseId: string;
  lessonId: string;
}