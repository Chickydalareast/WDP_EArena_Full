import { IsString, IsNotEmpty, IsInt, Min, Max, IsNumber } from 'class-validator';

export class SyncHeartbeatDto {
    @IsString()
    @IsNotEmpty()
    courseId: string;

    @IsString()
    @IsNotEmpty()
    lessonId: string;

    @IsInt()
    @Min(1)
    @Max(30, { message: 'Phát hiện bất thường: Delta quá lớn, nghi ngờ hack time.' })
    delta: number;

    @IsNumber()
    @Min(0)
    lastPosition: number;
}