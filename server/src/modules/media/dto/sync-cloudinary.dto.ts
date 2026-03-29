import { IsString, IsNotEmpty, IsNumber, Min, IsEnum, Matches } from 'class-validator';
import { MediaContext } from '../schemas/media.schema';

export class SyncCloudinaryDto {
    @IsString({ message: 'Public ID phải là chuỗi ký tự' })
    @IsNotEmpty({ message: 'Public ID không được để trống' })
    publicId: string;

    @IsString({ message: 'Định dạng file phải là chuỗi ký tự' })
    @IsNotEmpty({ message: 'Định dạng file (format) không được để trống' })
    @Matches(/^[a-zA-Z0-9]+$/, { message: 'Định dạng file không hợp lệ (VD: jpg, pdf, png)' })
    format: string;

    @IsNumber({}, { message: 'Dung lượng file phải là số' })
    @Min(1, { message: 'Dung lượng file không hợp lệ (nhỏ nhất 1 byte)' })
    bytes: number;

    @IsString({ message: 'Tên file gốc phải là chuỗi ký tự' })
    @IsNotEmpty({ message: 'Tên file gốc không được để trống' })
    @Matches(/^[^\\/:\*\?"<>\|]+$/, { message: 'Tên file chứa ký tự không hợp lệ' })
    originalName: string;

    @IsNotEmpty({ message: 'Ngữ cảnh (context) không được để trống' })
    @IsEnum(MediaContext, { message: 'Ngữ cảnh (context) không hợp lệ trong hệ thống' })
    context: MediaContext;
}