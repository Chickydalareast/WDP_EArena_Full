import { Exclude, Expose, Transform } from 'class-transformer';

@Exclude() 
export class UserResponseDto {
  @Expose({ name: 'id' })
  @Transform(({ obj }) => obj._id?.toString() || obj.id)
  id: string;

  @Expose()
  email: string;

  @Expose()
  fullName: string;

  @Expose()
  role: string;

  @Expose()
  avatar?: string;

  @Expose()
  phone?: string;

  @Expose()
  dateOfBirth?: Date;

  @Expose({ name: 'subjects' })
  @Transform(({ obj }) => {
    if (Array.isArray(obj.subjectIds)) {
      return obj.subjectIds.map((sub: any) => {
        if (sub && sub._id && sub.name) {
          return { id: sub._id.toString(), name: sub.name };
        }
        return { id: sub?.toString() || '', name: 'Unknown Subject' };
      });
    }
    return [];
  })
  subjects: { id: string; name: string }[];

  @Expose({ name: 'subscription' })
  @Transform(({ obj }) => {
    if (!obj.currentPlanId) return null;

    const planInfo = obj.currentPlanId;
    const planId = planInfo._id ? planInfo._id.toString() : planInfo.toString();
    const planCode = planInfo.code || 'FREE';

    let isExpired = true;
    let expiresAtStr = null;

    if (obj.planExpiresAt) {
      const expiresAtDate = new Date(obj.planExpiresAt);
      expiresAtStr = expiresAtDate.toISOString();
      isExpired = expiresAtDate.getTime() < Date.now();
    }

    return {
      planId,
      planCode,
      expiresAt: expiresAtStr,
      isExpired
    };
  })
  subscription: { planId: string; planCode: string; expiresAt: string | null; isExpired: boolean } | null;
}