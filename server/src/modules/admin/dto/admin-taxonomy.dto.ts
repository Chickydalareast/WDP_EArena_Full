import { IsBoolean, IsMongoId, IsOptional, IsString, Max, Min, IsInt, ValidateIf } from 'class-validator';

export class AdminCreateSubjectDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class AdminUpdateSubjectDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class AdminCreateTopicDto {
  @IsMongoId()
  subjectId: string;

  @IsString()
  name: string;

  @IsInt()
  @Min(1)
  @Max(3)
  level: number;

  @IsOptional()
  @IsMongoId()
  parentId?: string;
}

export class AdminUpdateTopicDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3)
  level?: number;

  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsMongoId()
  parentId?: string | null;
}
