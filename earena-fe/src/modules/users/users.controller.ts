import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  UseGuards,
  Query,
  Param,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateProfileDto, UserResponseDto } from './dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { JwtPayload } from '../auth/auth.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { UserRole } from 'src/common/enums/user-role.enum';
import { Public } from 'src/common/decorators/public.decorator';
import { PublicProfileResponseDto } from './dto/public-profile-response.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create({
      email: dto.email,
      fullName: dto.fullName,
      password: dto.password,
      role: dto.role,
    });
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  async findAll(@Query() query: PaginationDto) {
    return this.usersService.findAll(query.page, query.limit);
  }

  @Get('me/profile')
  async getProfile(@CurrentUser() user: JwtPayload) {
    return this.usersService.getProfile(user.userId);
  }

  @Patch('me/profile')
  async updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.userId, {
      fullName: dto.fullName,
      avatar: dto.avatar,
      phone: dto.phone,
      dateOfBirth: dto.dateOfBirth,
    });
  }

  @Get('me')
  async getMeFast(@CurrentUser() user: JwtPayload) {
    const fullUser = await this.usersService.getBasicUserInfo(user.userId);

    return {
      data: plainToInstance(UserResponseDto, fullUser, {
        excludeExtraneousValues: true,
      }),
      message: 'Lấy thông tin cơ bản thành công',
    };
  }

  @Public()
  @Get(':id/public-profile')
  async getPublicProfile(@Param('id') id: string) {
    const profile = await this.usersService.getPublicProfile(id);

    return {
      message: 'Lấy hồ sơ công khai thành công',
      data: plainToInstance(PublicProfileResponseDto, profile, {
        excludeExtraneousValues: true,
      }),
    };
  }
}
