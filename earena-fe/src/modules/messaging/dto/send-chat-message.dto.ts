import { IsArray, IsMongoId, IsOptional, IsString, MaxLength } from 'class-validator';

export class OpenThreadDto {
  @IsMongoId()
  peerUserId: string;
}

export class SendChatMessageDto {
  @IsOptional()
  @IsString()
  @MaxLength(8000)
  body?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(2000, { each: true })
  imageUrls?: string[];

  @IsOptional()
  @IsMongoId()
  shareCourseId?: string;
}
