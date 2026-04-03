import { DifficultyLevel } from '../schemas/question.schema';

export const DIFFICULTY_NAME_MAP: Record<DifficultyLevel, string> = {
  [DifficultyLevel.NB]: 'Nhận biết',
  [DifficultyLevel.TH]: 'Thông hiểu',
  [DifficultyLevel.VD]: 'Vận dụng',
  [DifficultyLevel.VDC]: 'Vận dụng cao',
  [DifficultyLevel.UNKNOWN]: 'Chưa phân loại',
};
