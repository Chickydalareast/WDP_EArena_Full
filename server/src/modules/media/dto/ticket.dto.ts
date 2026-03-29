import { IsString, IsNumber, IsEnum, IsNotEmpty, Max, Min, Matches } from 'class-validator';
import { MediaContext } from '../schemas/media.schema';

export class RequestUploadTicketDto {
    @IsString()
    @IsNotEmpty({ message: 'Tên file không được để trống' })
    @Matches(/^[^\\/:\*\?"<>\|]+$/, { message: 'Tên file chứa ký tự không hợp lệ' }) 
    fileName: string;

    @IsString()
    @IsNotEmpty({ message: 'Định dạng file không được để trống' })
    @Matches(/^(video\/(mp4|webm|x-matroska)|application\/pdf)$/i, { message: 'Định dạng file không được hỗ trợ' })
    mimeType: string;

    @IsNumber()
    @Min(1, { message: 'Kích thước file không hợp lệ (nhỏ nhất 1 byte)' })
    @Max(2147483648, { message: 'Kích thước file vượt mức cho phép của hệ thống (Tối đa 2GB)' })
    size: number;

    @IsEnum(MediaContext, { message: 'Ngữ cảnh (context) không hợp lệ' })
    context: MediaContext;
}

export class ConfirmUploadDto {
    @IsString()
    @IsNotEmpty({ message: 'Media ID không được để trống' })
    mediaId: string;
}