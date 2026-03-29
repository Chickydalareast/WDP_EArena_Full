import { IsString, IsNumber, IsNotEmpty, Min, IsPositive, IsEnum, IsOptional } from 'class-validator';

export class CreateWithdrawalDto {
    @IsNumber()
    @IsPositive()
    @Min(100000, { message: 'Số tiền rút tối thiểu là 100.000 VNĐ' })
    amount: number;

    @IsString()
    @IsNotEmpty()
    bankName: string;

    @IsString()
    @IsNotEmpty()
    accountNumber: string;

    @IsString()
    @IsNotEmpty()
    accountName: string;
}

export enum ProcessAction {
    APPROVE = 'APPROVE',
    REJECT = 'REJECT',
}

export class ProcessWithdrawalDto {
    @IsEnum(ProcessAction, { message: 'Hành động không hợp lệ (APPROVE hoặc REJECT)' })
    action: ProcessAction;

    @IsString()
    @IsOptional()
    rejectionReason?: string;
}