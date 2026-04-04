import { IsBoolean, IsMongoId, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from './pagination.dto';

export class AdminListQuestionsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsMongoId()
  ownerId?: string;

  @IsOptional()
  @IsMongoId()
  folderId?: string;

  @IsOptional()
  @IsMongoId()
  topicId?: string;
}

export class AdminSetQuestionArchiveDto {
  @IsBoolean()
  isArchived: boolean;
}
