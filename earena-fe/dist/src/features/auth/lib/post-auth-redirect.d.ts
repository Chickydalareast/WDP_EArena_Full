import type { UserSession } from '../stores/auth.store';
type UserLike = Pick<UserSession, 'role' | 'teacherVerificationStatus'>;
export declare function getPostAuthLandingPath(user: UserLike): string;
export declare function resolvePostAuthRoute(user: UserLike, callbackUrl: string | null): string;
export {};
