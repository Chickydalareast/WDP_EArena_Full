import { IsArray, IsInt, IsMongoId, IsNotEmpty, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateExamMatrixDto } from './exam-matrix.dto';

export class GenerateDynamicExamDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @Type(() => Number)
    @IsInt()
    @Min(0)
    totalScore: number;

    @IsOptional()
    @IsMongoId()
    matrixId?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateExamMatrixDto.prototype.sections[0].constructor)
    adHocSections?: any[];
}