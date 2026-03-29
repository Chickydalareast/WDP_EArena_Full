import { IsMongoId, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateQuestionFolderDto {
    @IsString()
    @IsNotEmpty({ message: 'Tên thư mục không được để trống.' })
    @MaxLength(255, { message: 'Tên thư mục không được vượt quá 255 ký tự.' })
    name: string;

    @IsString()
    @IsOptional()
    @MaxLength(1000, { message: 'Mô tả không được vượt quá 1000 ký tự.' })
    description?: string;

    @IsMongoId({ message: 'ID thư mục cha không hợp lệ.' })
    @IsOptional()
    parentId?: string;
}