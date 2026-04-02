import { IsArray, IsMongoId, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { MatrixSectionDto } from './exam-matrix.dto'; 

export class FillFromMatrixDto {
    @IsOptional()
    @IsMongoId()
    matrixId?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MatrixSectionDto)
    adHocSections?: MatrixSectionDto[];
}