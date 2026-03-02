import { IsEnum, IsMongoId, IsNotEmpty } from 'class-validator';

export enum PaperUpdateAction {
  ADD = 'ADD',
  REMOVE = 'REMOVE',
}

export class UpdatePaperQuestionsDto {
  @IsEnum(PaperUpdateAction)
  action: PaperUpdateAction;

  @IsMongoId()
  @IsNotEmpty()
  questionId: string;
}