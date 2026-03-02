import { IsBoolean, IsMongoId, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateClassDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  @Transform(({ value }) => value?.trim())
  description?: string;

  @IsMongoId()
  @IsOptional()
  coverImageId?: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}