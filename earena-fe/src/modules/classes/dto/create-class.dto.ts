import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength, Matches } from 'class-validator';
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

  @IsOptional()
  @Matches(/^(https?:\/\/res\.cloudinary\.com\/.*|https?:\/\/.*\.googleusercontent\.com\/.*)$/, {
    message: 'Nguồn ảnh bìa không hợp lệ. Vui lòng upload qua hệ thống.',
  })
  coverImageUrl?: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}