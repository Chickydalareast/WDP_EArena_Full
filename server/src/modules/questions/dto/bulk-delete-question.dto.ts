import { IsArray, IsMongoId, ArrayMinSize } from 'class-validator';

export class BulkDeleteQuestionDto {
    @IsArray({ message: 'Payload phải là một mảng danh sách các ID.' })
    @IsMongoId({ each: true, message: 'Một hoặc nhiều ID câu hỏi không hợp lệ.' })
    @ArrayMinSize(1, { message: 'Phải chọn ít nhất 1 câu hỏi để xóa.' })
    questionIds: string[];
}