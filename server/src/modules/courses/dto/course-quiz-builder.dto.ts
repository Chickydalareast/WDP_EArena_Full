import { IsString, IsNotEmpty, IsMongoId, IsBoolean, IsOptional, ValidateNested, IsNumber, Min, Max, IsArray, IsEnum, registerDecorator, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType, OmitType } from '@nestjs/mapped-types';
import { DifficultyLevel } from '../../questions/schemas/question.schema';
import { ShowResultMode } from '../schemas/lesson.schema';

@ValidatorConstraint({ name: 'MutuallyExclusiveMatrixSource', async: false })
class MutuallyExclusiveMatrixSourceConstraint implements ValidatorConstraintInterface {
    validate(_value: unknown, args: ValidationArguments): boolean {
        const obj = args.object as DynamicExamConfigDto;
        const hasMatrix = !!obj.matrixId;
        const hasAdHoc = Array.isArray(obj.adHocSections) && obj.adHocSections.length > 0;
        return !(hasMatrix && hasAdHoc);
    }

    defaultMessage(): string {
        return 'Chỉ được chọn một trong hai nguồn: "matrixId" (dùng Khuôn mẫu có sẵn) HOẶC "adHocSections" (tự định nghĩa). Không được dùng cả hai cùng lúc.';
    }
}

class DynamicFilterDto {
    @IsEnum(DifficultyLevel)
    difficulty: DifficultyLevel;

    @IsNumber()
    @Min(1)
    count: number;
}

class MatrixRuleDto {
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

    @IsNumber()
    @Min(1)
    limit: number;
}

class MatrixSectionDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsOptional()
    @IsNumber()
    orderIndex?: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MatrixRuleDto)
    rules: MatrixRuleDto[];
}

// [FIX #1.3]: Validator enforce chỉ được dùng MỘT trong hai: matrixId hoặc adHocSections.
// Dùng registerDecorator để tạo property decorator hợp lệ thay vì @Validate trên class.
function IsMatrixSourceMutuallyExclusive() {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'isMatrixSourceMutuallyExclusive',
            target: (object as any).constructor,
            propertyName,
            validator: {
                validate(_value: unknown, args: ValidationArguments): boolean {
                    const obj = args.object as DynamicExamConfigDto;
                    const hasMatrix = !!obj.matrixId;
                    const hasAdHoc = Array.isArray(obj.adHocSections) && obj.adHocSections.length > 0;
                    return !(hasMatrix && hasAdHoc);
                },
                defaultMessage(): string {
                    return 'Chỉ được chọn một nguồn: "matrixId" (Khuôn mẫu có sẵn) HOẶC "adHocSections" (tự định nghĩa). Không được dùng cả hai cùng lúc.';
                },
            },
        });
    };
}

class DynamicExamConfigDto {
    @IsOptional()
    @IsArray()
    @IsMongoId({ each: true })
    sourceFolders?: string[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DynamicFilterDto)
    mixRatio?: DynamicFilterDto[];

    @IsOptional()
    @IsMongoId()
    // Gắn validator vào matrixId — khi matrixId được set thì check conflict với adHocSections
    @IsMatrixSourceMutuallyExclusive()
    matrixId?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MatrixSectionDto)
    adHocSections?: MatrixSectionDto[];
}

class ExamRuleConfigDto {
    @IsNumber()
    @Min(0)
    timeLimit: number;

    @IsNumber()
    @Min(1)
    maxAttempts: number;

    @IsNumber()
    @Min(0)
    @Max(100)
    passPercentage: number;

    @IsEnum(ShowResultMode)
    showResultMode: ShowResultMode;
}

export class CreateCourseQuizDto {
    @IsMongoId()
    courseId: string;

    @IsMongoId()
    sectionId: string;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    content: string = '';

    @IsBoolean()
    @IsOptional()
    isFreePreview: boolean = false;

    @IsNumber()
    @Min(0)
    totalScore: number = 100;

    @ValidateNested()
    @Type(() => DynamicExamConfigDto)
    @IsNotEmpty()
    dynamicConfig: DynamicExamConfigDto;

    @ValidateNested()
    @Type(() => ExamRuleConfigDto)
    @IsNotEmpty()
    examRules: ExamRuleConfigDto;
}

export class UpdateCourseQuizDto extends PartialType(
    OmitType(CreateCourseQuizDto, ['courseId', 'sectionId'] as const)
) {
    @IsMongoId()
    @IsNotEmpty()
    courseId: string;

    @IsMongoId()
    @IsNotEmpty()
    lessonId: string;
}

export class DeleteCourseQuizDto {
    @IsMongoId()
    @IsNotEmpty()
    courseId: string;

    @IsMongoId()
    @IsNotEmpty()
    lessonId: string;
}

export class GetQuizMatricesDto {
    @IsMongoId()
    @IsNotEmpty()
    courseId: string;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    page?: number = 1;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    limit?: number = 10;

    @IsOptional()
    @IsString()
    search?: string;
}


export class RulePreviewDto {
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

    @IsNumber()
    @Min(1)
    limit: number;
}

export class PreviewQuizConfigDto {
    @IsOptional()
    @IsMongoId()
    @IsMatrixSourceMutuallyExclusive()
    matrixId?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MatrixSectionDto)
    adHocSections?: MatrixSectionDto[];
}