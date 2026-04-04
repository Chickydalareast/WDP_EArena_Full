import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CommunityPostType } from '../constants/community.constants';

export class AttachmentDto {
  @IsString()
  url: string;

  @IsEnum(['IMAGE', 'FILE'] as const)
  kind: 'IMAGE' | 'FILE';

  @IsOptional()
  @IsString()
  @MaxLength(500)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  mime?: string;
}

export class CreateCommunityPostDto {
  @IsEnum(CommunityPostType)
  type: CommunityPostType;

  /** Chuỗi JSON Tiptap */
  @IsString()
  @MaxLength(200000)
  bodyJson: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  attachments?: AttachmentDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  tags?: string[];

  @IsOptional()
  @IsMongoId()
  subjectId?: string;

  @IsOptional()
  @IsMongoId()
  courseId?: string;

  @IsOptional()
  @IsMongoId()
  examId?: string;
}

export class UpdateCommunityPostDto {
  @IsOptional()
  @IsString()
  @MaxLength(200000)
  bodyJson?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  attachments?: AttachmentDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  tags?: string[];

  @IsOptional()
  @IsMongoId()
  subjectId?: string;
}
