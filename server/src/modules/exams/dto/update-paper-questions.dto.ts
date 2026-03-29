import { IsEnum, IsMongoId, IsNotEmpty, IsArray, ValidateIf, ArrayMinSize } from 'class-validator';

export enum PaperUpdateAction {
  ADD = 'ADD',
  REMOVE = 'REMOVE',
  REORDER = 'REORDER',
}

export class UpdatePaperQuestionsDto {
  @IsEnum(PaperUpdateAction)
  action: PaperUpdateAction;

  @ValidateIf(o => o.action === PaperUpdateAction.ADD || o.action === PaperUpdateAction.REMOVE)
  @IsMongoId({ message: 'ID câu hỏi không hợp lệ.' })
  @IsNotEmpty({ message: 'Phải cung cấp questionId khi ADD hoặc REMOVE.' })
  questionId?: string;

  @ValidateIf(o => o.action === PaperUpdateAction.REORDER)
  @IsArray({ message: 'Danh sách ID phải là một mảng.' })
  @IsMongoId({ each: true, message: 'Danh sách ID chứa phần tử không hợp lệ.' })
  @ArrayMinSize(1, { message: 'Cần ít nhất 1 câu hỏi để sắp xếp lại.' })
  questionIds?: string[];
}