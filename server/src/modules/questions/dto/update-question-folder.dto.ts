import { IsMongoId, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';

export class UpdateQuestionFolderDto {
    @IsOptional()
    @IsString()
    @MaxLength(255)
    name?: string;

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    description?: string;

    @IsOptional()
    @ValidateIf((o) => o.parentId !== null)
    @IsMongoId({ message: 'ID thư mục cha không hợp lệ.' })
    parentId?: string | null;
}