import {
  IsArray,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AttachmentDto } from './create-community-post.dto';

export class CreateCommunityCommentDto {
  @IsOptional()
  @IsMongoId()
  parentCommentId?: string;

  /** Có thể bỏ trống nếu có ít nhất một ảnh trong `attachments`. */
  @IsOptional()
  @IsString()
  @MaxLength(8000)
  body?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  attachments?: AttachmentDto[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  mentionedUserIds?: string[];
}

export class UpdateCommunityCommentDto {
  @IsString()
  @MaxLength(8000)
  body: string;
}
