import { IsArray, IsEnum, IsInt, IsMongoId, IsNotEmpty, IsOptional, IsString, MaxLength, Min, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { DifficultyLevel } from '../../questions/schemas/question.schema';

export class MatrixRuleDto {
    @IsOptional()
    @IsArray()
    @IsMongoId({ each: true })
    folderIds?: string[];

    @IsOptional()
    @IsArray()
    @IsMongoId({ each: true })
    topicIds?: string[];

    @IsOptional()
    @IsArray()
    @IsEnum(DifficultyLevel, { each: true })
    difficulties?: DifficultyLevel[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @IsInt()
    @Min(1)
    limit: number;
}

export class MatrixSectionDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name: string;

    @IsInt()
    @Min(0)
    orderIndex: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MatrixRuleDto)
    @ArrayMinSize(1)
    rules: MatrixRuleDto[];
}

export class CreateExamMatrixDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    title: string;

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    description?: string;

    @IsMongoId()
    @IsNotEmpty()
    subjectId: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MatrixSectionDto)
    @ArrayMinSize(1)
    sections: MatrixSectionDto[];
}

export class UpdateExamMatrixDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    title?: string;

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    description?: string;

    @IsOptional()
    @IsMongoId()
    subjectId?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MatrixSectionDto)
    @ArrayMinSize(1)
    sections?: MatrixSectionDto[];
}