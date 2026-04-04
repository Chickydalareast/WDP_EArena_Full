export type UpdateProfilePayload = {
    fullName?: string;
    avatar?: string;
    phone?: string;
    dateOfBirth?: string | Date;
};
export declare const profileService: {
    uploadAvatar: (file: File) => Promise<string>;
    updateProfile: (payload: UpdateProfilePayload) => Promise<any>;
};
