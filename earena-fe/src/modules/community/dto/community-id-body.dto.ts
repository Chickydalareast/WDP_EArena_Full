import { IsBoolean, IsMongoId } from 'class-validator';

export class CommentIdBodyDto {
  @IsMongoId()
  commentId: string;
}

export class FeaturePostBodyDto {
  @IsBoolean()
  featured: boolean;
}

export class LockCommentsBodyDto {
  @IsBoolean()
  locked: boolean;
}
