import { 
  IsEmail, 
  IsEnum, 
  IsNotEmpty, 
  IsOptional, 
  IsString, 
  MinLength, 
  IsArray, 
  IsMongoId, 
  ArrayUnique 
} from 'class-validator';
import { UserRole } from 'src/common/enums/user-role.enum';

export class CreateUserDto {
  @IsEmail({}, { message: 'Định dạng email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Họ và tên không được để trống' })
  fullName: string;

  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải từ 6 ký tự trở lên' })
  password: string;

  @IsEnum(UserRole, { message: 'Role không hợp lệ' })
  @IsOptional()
  role?: UserRole;

  @IsOptional()
  @IsArray({ message: 'Danh sách môn học phải là một mảng' })
  @IsMongoId({ each: true, message: 'Mã môn học (ID) không hợp lệ' })
  @ArrayUnique({ message: 'Danh sách môn học không được trùng lặp' })
  subjectIds?: string[];
}