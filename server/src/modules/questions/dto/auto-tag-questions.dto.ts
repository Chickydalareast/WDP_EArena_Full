import { IsArray, ArrayMinSize, ArrayMaxSize, IsMongoId } from 'class-validator';

export class AutoTagQuestionsDto {
    @IsArray()
    @ArrayMinSize(1, { message: 'Cần chọn ít nhất 1 câu hỏi để xử lý.' })
    @ArrayMaxSize(200, { message: 'Chỉ được xử lý tối đa 200 câu hỏi mỗi lượt để tránh tràn tải.' })
    @IsMongoId({ each: true, message: 'ID câu hỏi không đúng định dạng.' })
    questionIds: string[];
}