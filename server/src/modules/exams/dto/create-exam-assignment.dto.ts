import { IsDateString, IsMongoId, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateExamAssignmentDto {
  @IsMongoId()
  @IsNotEmpty()
  examId: string;

  @IsMongoId()
  @IsNotEmpty()
  classId: string;

  @IsDateString()
  @IsNotEmpty()
  startTime: string; 

  @IsDateString()
  @IsNotEmpty()
  endTime: string; 

  @IsNumber()
  @Min(1)
  timeLimit: number; 

  @IsNumber()
  @Min(1)
  @IsOptional()
  maxAttempts?: number = 1; 
}