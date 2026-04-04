import { Controller, Post, Get, Delete, Body, Param, UseGuards, HttpCode, HttpStatus, NotFoundException, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequireTeacherVerified } from '../../common/decorators/teacher-verified.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UsersService } from '../users/users.service';
import { UserRole } from '../../common/enums/user-role.enum';
import { TeacherVerificationStatus } from '../users/schemas/user.schema';

class UploadQualificationDto {
  url: string;
  name: string;
}

class RejectQualificationDto {
  qualificationIndex: number;
  reason?: string;
}

@Controller('teachers')
@UseGuards(JwtAuthGuard)
@RequireTeacherVerified()
export class TeachersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('qualifications')
  async getQualifications(@CurrentUser('userId') userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('Không tìm thấy tài khoản');

    return {
      data: {
        qualifications: user.qualifications || [],
        hasUploadedQualifications: user.hasUploadedQualifications || false,
        verificationStatus: user.teacherVerificationStatus,
      }
    };
  }

  @Post('qualifications')
  @HttpCode(HttpStatus.CREATED)
  async uploadQualification(
    @CurrentUser('userId') userId: string,
    @Body() dto: UploadQualificationDto
  ) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('Không tìm thấy tài khoản');

    if (user.role !== UserRole.TEACHER) {
      throw new ForbiddenException('Chỉ tài khoản giáo viên mới được phép tải lên bằng cấp');
    }

    const newQualification = {
      url: dto.url,
      name: dto.name,
      uploadedAt: new Date(),
    };

    const updated = await this.usersService.addQualification(userId, newQualification);

    return {
      message: 'Tải lên bằng cấp thành công',
      data: {
        qualifications: updated.qualifications,
        hasUploadedQualifications: updated.hasUploadedQualifications,
      }
    };
  }

  @Delete('qualifications/:index')
  @HttpCode(HttpStatus.OK)
  async deleteQualification(
    @CurrentUser('userId') userId: string,
    @Param('index') indexStr: string
  ) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('Không tìm thấy tài khoản');

    if (user.teacherVerificationStatus === TeacherVerificationStatus.VERIFIED) {
      throw new ForbiddenException('Không thể xóa bằng cấp khi tài khoản đã được xác minh');
    }

    const index = parseInt(indexStr, 10);
    const updated = await this.usersService.removeQualification(userId, index);

    if (!updated) throw new NotFoundException('Không tìm thấy tài khoản');

    return {
      message: 'Xóa bằng cấp thành công',
      data: {
        qualifications: updated.qualifications,
        hasUploadedQualifications: updated.hasUploadedQualifications,
      }
    };
  }

  @Post('qualifications/submit-review')
  @HttpCode(HttpStatus.OK)
  async submitForVerification(@CurrentUser('userId') userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('Không tìm thấy tài khoản');

    if (user.role !== UserRole.TEACHER) {
      throw new ForbiddenException('Chỉ tài khoản giáo viên mới được phép gửi xét duyệt');
    }

    if (!user.hasUploadedQualifications || !user.qualifications || user.qualifications.length === 0) {
      throw new ForbiddenException('Vui lòng tải lên ít nhất một bằng cấp trước khi gửi xét duyệt');
    }

    if (user.teacherVerificationStatus === TeacherVerificationStatus.VERIFIED) {
      throw new ForbiddenException('Tài khoản của bạn đã được xác minh');
    }

    await this.usersService.updateTeacherVerificationStatus(
      userId,
      TeacherVerificationStatus.PENDING,
      'Đã gửi hồ sơ xét duyệt'
    );

    return {
      message: 'Hồ sơ đã được gửi để xét duyệt. Vui lòng chờ quản trị viên xử lý.'
    };
  }
}
