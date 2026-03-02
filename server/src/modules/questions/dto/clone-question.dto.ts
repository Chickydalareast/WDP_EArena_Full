import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CloneQuestionDto {
  @IsMongoId()
  @IsNotEmpty()
  destFolderId: string; 
}