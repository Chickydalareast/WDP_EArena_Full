import { IsString, IsNotEmpty, IsMongoId, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class GenerateFromLectureDto {
    @IsMongoId({ message: 'ID thư mục lưu trữ không hợp lệ.' })
    @IsNotEmpty({ message: 'Bắt buộc phải chọn thư mục (Folder) để lưu bộ câu hỏi.' })
    folderId: string;

    @IsNotEmpty({ message: 'Bắt buộc phải cung cấp số lượng câu hỏi cần tạo.' })
    @Type(() => Number)
    @IsInt({ message: 'Số lượng câu hỏi phải là số nguyên.' })
    @Min(1, { message: 'Cần tạo ít nhất 1 câu hỏi.' })
    @Max(50, { message: 'Để đảm bảo chất lượng AI, tối đa chỉ tạo 50 câu trong một lần.' })
    questionCount: number;

    @IsOptional()
    @IsString({ message: 'Ghi chú (Prompt) phải là chuỗi văn bản.' })
    @Transform(({ value }) => value?.trim())
    additionalInstructions?: string;
}