import { UsersService } from './users.service';
import { CreateUserDto, UpdateProfileDto, UserResponseDto } from './dto';
import type { JwtPayload } from '../auth/auth.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PublicProfileResponseDto } from './dto/public-profile-response.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(dto: CreateUserDto): Promise<import("./schemas/user.schema").UserDocument>;
    findAll(query: PaginationDto): Promise<{
        data: import("./schemas/user.schema").UserDocument[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
        };
    }>;
    getProfile(user: JwtPayload): Promise<import("./schemas/user.schema").UserDocument>;
    updateProfile(user: JwtPayload, dto: UpdateProfileDto): Promise<import("./schemas/user.schema").UserDocument>;
    getMeFast(user: JwtPayload): Promise<{
        data: UserResponseDto;
        message: string;
    }>;
    getPublicProfile(id: string): Promise<{
        message: string;
        data: PublicProfileResponseDto;
    }>;
}
