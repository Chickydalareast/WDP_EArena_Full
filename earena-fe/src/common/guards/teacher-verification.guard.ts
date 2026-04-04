import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, TeacherVerificationStatus } from '../../modules/users/schemas/user.schema';
import { UserRole } from '../enums/user-role.enum';
import { IS_TEACHER_VERIFIED_KEY } from '../decorators/teacher-verified.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class TeacherVerificationGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requireVerified = this.reflector.getAllAndOverride<boolean>(IS_TEACHER_VERIFIED_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requireVerified) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const { user } = request;

    if (!user || !user.userId) {
      throw new UnauthorizedException('Vui lòng đăng nhập');
    }

    if (user.role !== UserRole.TEACHER) {
      return true;
    }

    const dbUser = await this.userModel.findById(user.userId).select('teacherVerificationStatus').lean();

    if (!dbUser) {
      throw new UnauthorizedException('Không tìm thấy tài khoản');
    }

    if (dbUser.teacherVerificationStatus !== TeacherVerificationStatus.VERIFIED) {
      throw new ForbiddenException(
        'Tài khoản giáo viên của bạn chưa được xác minh. Vui lòng chờ quản trị viên phê duyệt hoặc liên hệ hỗ trợ.',
      );
    }

    return true;
  }
}
