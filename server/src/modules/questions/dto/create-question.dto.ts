// src/modules/questions/dto/create-question.dto.ts

import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsString,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsOptional,
  ArrayMinSize,
  ValidateIf,
  IsInt,
  Min,
  registerDecorator,
  ValidationOptions,
  ValidationArguments
} from 'class-validator';
import { Type } from 'class-transformer';
import { DifficultyLevel, QuestionType } from '../schemas/question.schema';
import { NoBase64Image } from '../../../common/decorators/no-base64.decorator';

// =======================================================================
// [CTO CHỐT CHẶN CORE]: Cross-Validation Guard cho Matrix Engine
// =======================================================================
export function IsRequiredIfPublished(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isRequiredIfPublished',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const { isDraft } = args.object as any;
          
          // Nếu là tạo Nháp (isDraft = true hoặc undefined), cho qua
          if (isDraft === true || isDraft === undefined) {
            return true;
          }

          // KHI XUẤT BẢN (isDraft = false)
          if (propertyName === 'topicId') {
            // Bắt buộc phải có giá trị String không rỗng
            return typeof value === 'string' && value.trim().length > 0;
          }
          if (propertyName === 'difficultyLevel') {
            // Bắt buộc phải có giá trị và tuyệt đối KHÔNG được là UNKNOWN
            return value !== undefined && value !== null && value !== DifficultyLevel.UNKNOWN;
          }
          
          return true;
        },
        defaultMessage(args: ValidationArguments) {
          if (args.property === 'difficultyLevel') {
             return 'Bắt buộc chọn Mức độ học thuật (khác UNKNOWN) khi Xuất bản câu hỏi.';
          }
          return `Bắt buộc chọn Chuyên đề (topicId) khi Xuất bản câu hỏi.`;
        }
      },
    });
  };
}

class AnswerOptionDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  @NoBase64Image()
  content: string;

  @IsBoolean()
  isCorrect: boolean;
}

export class CreateQuestionDto {
  // [MAX PING FIX]: Bọc Custom Decorator làm Gatekeeper
  @IsOptional()
  @IsMongoId({ message: 'Định dạng ID Chuyên đề không hợp lệ.' })
  @IsRequiredIfPublished()
  topicId?: string;

  @IsMongoId()
  @IsNotEmpty()
  folderId: string;

  @IsEnum(QuestionType)
  @IsNotEmpty()
  type: QuestionType;

  // [MAX PING FIX]: Bọc Custom Decorator làm Gatekeeper
  @IsOptional()
  @IsEnum(DifficultyLevel)
  @IsRequiredIfPublished()
  difficultyLevel?: DifficultyLevel;

  @IsString()
  @IsNotEmpty()
  @NoBase64Image()
  content: string;

  @IsString()
  @IsOptional()
  @NoBase64Image()
  explanation?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  orderIndex?: number;

  @ValidateIf((o) => o.type !== QuestionType.PASSAGE)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerOptionDto)
  @ArrayMinSize(2, { message: 'Câu hỏi trắc nghiệm phải có ít nhất 2 đáp án.' })
  answers?: AnswerOptionDto[];

  @IsMongoId()
  @IsOptional()
  parentPassageId?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsBoolean()
  @IsOptional()
  isDraft?: boolean;

  @IsArray()
  @IsOptional()
  @IsMongoId({ each: true, message: 'Định dạng ID tệp đính kèm không hợp lệ.' })
  attachedMedia?: string[];
}