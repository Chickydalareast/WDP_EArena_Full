import { IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { WithdrawalStatus } from '../../wallets/schemas/withdrawal-request.schema';

export class AdminGetWithdrawalsQueryDto {
    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' && value.trim() === '' ? undefined : value))
    @IsEnum(WithdrawalStatus, { message: 'Trạng thái không hợp lệ' })
    status?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 10;
}