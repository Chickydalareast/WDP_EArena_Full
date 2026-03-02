import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class AutoSaveDto {
  @IsMongoId()
  questionId: string;

  @IsString()
  @IsOptional()
  selectedAnswerId?: string; 
}