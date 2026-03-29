import { IsMongoId, IsEnum, IsArray, ArrayMinSize, IsOptional } from 'class-validator';
import { OrganizeStrategy } from '../interfaces/question-organizer.interface';

export class OrganizeQuestionsDto {
    @IsArray()
    @IsMongoId({ each: true, message: 'Danh sách ID câu hỏi chứa định dạng không hợp lệ.' })
    @ArrayMinSize(1, { message: 'Phải chọn ít nhất 1 câu hỏi để thao tác.' })
    questionIds: string[];

    @IsEnum(OrganizeStrategy, { message: 'Chiến lược phân loại không hợp lệ.' })
    strategy: OrganizeStrategy;

    @IsOptional()
    @IsMongoId({ message: 'ID thư mục gốc (baseFolderId) không hợp lệ.' })
    baseFolderId?: string;
}