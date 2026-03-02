import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class InitManualExamDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  duration: number; 

  @Type(() => Number)
  @IsInt()
  @Min(0)
  totalScore: number;
}