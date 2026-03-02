import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { PaginationQueryDto } from './pagination.dto';
import { UserRole, UserStatus } from '../../users/schemas/user.schema';

export class AdminListUsersQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}

export class AdminCreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  fullName: string;

  @MinLength(6)
  password: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}

export class AdminUpdateUserRoleDto {
  @IsEnum(UserRole)
  role: UserRole;
}

export class AdminUpdateUserStatusDto {
  @IsEnum(UserStatus)
  status: UserStatus;
}

export class AdminResetPasswordDto {
  @IsOptional()
  @IsString()
  @MinLength(6)
  newPassword?: string;
}
