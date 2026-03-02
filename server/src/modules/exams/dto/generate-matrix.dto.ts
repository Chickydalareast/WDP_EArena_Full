import { IsArray, IsEnum, IsInt, IsMongoId, IsNotEmpty, IsString, MaxLength, Min, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { DifficultyLevel } from '../../questions/schemas/question.schema';

class MatrixCriterionDto {
  @IsArray()
  @IsMongoId({ each: true })
  @ArrayMinSize(1)
  folderIds: string[]; 
  @IsMongoId()
  @IsNotEmpty()
  topicId: string; 

  @IsEnum(DifficultyLevel)
  difficulty: DifficultyLevel;

  @IsInt()
  @Min(1)
  limit: number; 
}

export class GenerateMatrixDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  duration: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  totalScore: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MatrixCriterionDto)
  @ArrayMinSize(1)
  criteria: MatrixCriterionDto[];
}