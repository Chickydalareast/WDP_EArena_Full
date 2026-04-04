import {
  IsOptional,
  IsMongoId,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EmbeddedExamSectionDto } from '../../courses/dto/embedded-exam-config.dto';

export class PreviewDynamicExamDto {
  @IsMongoId({ message: 'ID Ma trận mẫu (matrixId) không hợp lệ' })
  @IsOptional()
  matrixId?: string;

  @IsArray({ message: 'adHocSections phải là một mảng' })
  @ValidateNested({ each: true })
  @Type(() => EmbeddedExamSectionDto)
  @IsOptional()
  adHocSections?: EmbeddedExamSectionDto[];
}
