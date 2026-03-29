import { IsOptional, IsString } from 'class-validator';

export class GoogleLoginDto {
  @IsString({ message: 'idToken phải là chuỗi ký tự' })
  @IsOptional()
  idToken?: string;

  @IsString({ message: 'credential phải là chuỗi ký tự' })
  @IsOptional()
  credential?: string;
}