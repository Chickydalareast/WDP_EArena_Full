import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
  ValidateIf,
  IsArray,
  IsMongoId,
  ArrayUnique,
  ArrayMinSize,
} from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Định dạng email không hợp lệ.' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Họ và tên không được để trống.' })
  fullName: string;

  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải từ 6 ký tự trở lên.' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Thiếu vé xác thực OTP (Ticket).' })
  ticket: string;

  @IsEnum(['STUDENT', 'TEACHER'], { message: 'Role không hợp lệ' })
  role: 'STUDENT' | 'TEACHER';
  
  @ValidateIf((o) => o.role === 'TEACHER')
  @IsArray({ message: 'Danh sách môn học phải là một mảng' })
  @IsMongoId({ each: true, message: 'Mã môn học (ID) không hợp lệ' })
  @ArrayUnique({ message: 'Danh sách môn học không được trùng lặp' })
  @ArrayMinSize(1, {
    message: 'Giáo viên bắt buộc phải chọn ít nhất một môn học chuyên môn',
  })
  subjectIds?: string[];
}
