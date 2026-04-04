import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Model } from 'mongoose';
import { UserDocument } from '../../modules/users/schemas/user.schema';
export declare class TeacherVerificationGuard implements CanActivate {
    private reflector;
    private userModel;
    constructor(reflector: Reflector, userModel: Model<UserDocument>);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
