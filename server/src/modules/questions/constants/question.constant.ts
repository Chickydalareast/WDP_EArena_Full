import { DifficultyLevel } from '../schemas/question.schema';

export const DIFFICULTY_NAME_MAP: Record<DifficultyLevel, string> = {
  [DifficultyLevel.NB]: 'Nhận biết',
  [DifficultyLevel.TH]: 'Thông hiểu',
  [DifficultyLevel.VD]: 'Vận dụng',
  [DifficultyLevel.VDC]: 'Vận dụng cao',
  [DifficultyLevel.UNKNOWN]: 'Chưa phân loại',
};

export const DIFFICULTY_WEIGHT_MAP: Record<DifficultyLevel, number> = {
  [DifficultyLevel.UNKNOWN]: 0,
  [DifficultyLevel.NB]: 1,
  [DifficultyLevel.TH]: 2,
  [DifficultyLevel.VD]: 3,
  [DifficultyLevel.VDC]: 4,
};