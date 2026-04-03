import { SetMetadata } from '@nestjs/common';

export const IS_TEACHER_VERIFIED_KEY = 'isTeacherVerified';
export const RequireTeacherVerified = () => SetMetadata(IS_TEACHER_VERIFIED_KEY, true);
