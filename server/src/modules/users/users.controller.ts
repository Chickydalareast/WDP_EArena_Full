import { Controller, Post, Body, Get, Patch, UseGuards, Req } from '@nestjs/common';
import type { Request } from 'express';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateProfileDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from './schemas/user.schema';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN) 
  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/profile')
  async getProfile(@Req() req: Request) {
    const userId = (req.user as any).userId;
    return this.usersService.getProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/profile')
  async updateProfile(
    @Req() req: Request,
    @Body() dto: UpdateProfileDto
  ) {
    const userId = (req.user as any).userId;

    return this.usersService.updateProfile(userId, {
      fullName: dto.fullName,
      avatar: dto.avatar,
      phone: dto.phone,
      dateOfBirth: dto.dateOfBirth,
    });
  }
}